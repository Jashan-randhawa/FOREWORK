/**
 * Job Alert Scheduler
 * Runs a cron job to dispatch JOB_ALERT notifications for matching active alerts.
 *
 * Schedule:
 *  - Daily alerts  → runs every day at 08:00 AM server time
 *  - Weekly alerts → runs every Monday at 08:00 AM server time
 *
 * Logic per alert:
 *  1. Skip if lastSentAt is within the alert's frequency window (idempotent).
 *  2. Query published jobs created in the last frequency window whose fields
 *     match the alert's criteria (keyword, location, jobType, salary, experience).
 *  3. If matching jobs found, create one JOB_ALERT notification per user and
 *     send a summary email.
 *  4. Update alert.lastSentAt to now so duplicate runs are skipped.
 */

import cron from "node-cron";
import { JobAlert } from "../models/jobAlert.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "./createNotification.js";
import { sendEmail } from "./mailer.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Build a Mongoose query filter from alert criteria.
 * @param {object} criteria
 * @param {Date} since – only consider jobs created after this date
 */
function buildJobFilter(criteria, since) {
  const filter = {
    status: "published",
    createdAt: { $gte: since },
  };

  if (criteria.keyword?.trim()) {
    const re = new RegExp(criteria.keyword.trim(), "i");
    filter.$or = [{ title: re }, { description: re }];
  }

  if (criteria.location?.trim()) {
    filter.location = new RegExp(criteria.location.trim(), "i");
  }

  if (criteria.jobType?.trim()) {
    filter.jobType = criteria.jobType.trim();
  }

  if (criteria.minSalary != null) {
    filter.salary = { ...(filter.salary || {}), $gte: criteria.minSalary };
  }

  if (criteria.maxSalary != null) {
    filter.salary = { ...(filter.salary || {}), $lte: criteria.maxSalary };
  }

  if (criteria.experienceLevel != null) {
    filter.experienceLevel = { $lte: criteria.experienceLevel };
  }

  return filter;
}

/**
 * Process all active job alerts of a given frequency that are due to run.
 * @param {"daily"|"weekly"} frequency
 */
export async function dispatchJobAlerts(frequency) {
  const windowMs = frequency === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Find active alerts of this frequency that have never been sent OR were
  // last sent before the start of this window (i.e., are due again).
  const alerts = await JobAlert.find({
    isActive: true,
    frequency,
    $or: [{ lastSentAt: null }, { lastSentAt: { $lte: windowStart } }],
  }).lean();

  if (!alerts.length) {
    console.log(`[JobAlertScheduler] No due ${frequency} alerts found.`);
    return;
  }

  console.log(`[JobAlertScheduler] Processing ${alerts.length} ${frequency} alert(s)...`);

  for (const alert of alerts) {
    try {
      const jobFilter = buildJobFilter(alert.criteria, windowStart);
      const matchingJobs = await Job.find(jobFilter)
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      if (!matchingJobs.length) {
        // Still update lastSentAt so we don't re-process this alert until the next window
        await JobAlert.findByIdAndUpdate(alert._id, { lastSentAt: now });
        continue;
      }

      const user = await User.findById(alert.user).lean();
      if (!user) {
        console.warn(`[JobAlertScheduler] User not found for alert ${alert._id}, skipping.`);
        continue;
      }

      // Build a human-readable job list for the notification message
      const jobListText = matchingJobs
        .slice(0, 5)
        .map((j) => `• ${j.title} at ${j.company?.name || "a company"}`)
        .join("\n");

      const jobCount = matchingJobs.length;
      const plural = jobCount === 1 ? "job" : "jobs";

      // In-app notification
      await createNotification({
        recipient: alert.user,
        type: "JOB_ALERT",
        title: `Job Alert: "${alert.title}"`,
        message: `${jobCount} new ${plural} match your alert "${alert.title}". Check them out now!`,
        link: `/jobs?keyword=${encodeURIComponent(alert.criteria.keyword || "")}`,
        metadata: { alertId: alert._id, jobCount, frequency },
      });

      // Email notification
      if (user.email) {
        const jobListHtml = matchingJobs
          .slice(0, 5)
          .map(
            (j) =>
              `<li><a href="${FRONTEND_URL}/jobs/${j._id}" style="color:#6B3AC2;text-decoration:none;">` +
              `<strong>${j.title}</strong></a> – ${j.company?.name || "Company"}</li>`
          )
          .join("");

        sendEmail({
          to: user.email,
          subject: `Job Alert: ${jobCount} new ${plural} for "${alert.title}"`,
          text: `Hi ${user.fullname || "there"},\n\n${jobCount} new ${plural} match your FOREWORK job alert "${alert.title}":\n\n${jobListText}\n\nView all matching jobs: ${FRONTEND_URL}/jobs\n\nBest regards,\nFOREWORK Team`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;">
              <h2 style="color:#6B3AC2;">Job Alert: "${alert.title}"</h2>
              <p>Hi ${user.fullname || "there"},</p>
              <p>We found <strong>${jobCount} new ${plural}</strong> matching your job alert.</p>
              <ul style="padding-left:20px;line-height:2;">${jobListHtml}</ul>
              ${jobCount > 5 ? `<p>…and ${jobCount - 5} more.</p>` : ""}
              <a href="${FRONTEND_URL}/jobs" style="display:inline-block;background:#6B3AC2;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;margin:15px 0;">
                View All Matches
              </a>
              <p style="color:#999;font-size:12px;">You can manage your job alerts from your FOREWORK profile.</p>
            </div>
          `,
        }).catch((err) =>
          console.error(`[JobAlertScheduler] Email failed for user ${user._id}:`, err.message)
        );
      }

      // Mark alert as sent
      await JobAlert.findByIdAndUpdate(alert._id, { lastSentAt: now });

      console.log(
        `[JobAlertScheduler] Dispatched alert "${alert.title}" (${jobCount} jobs) → user ${user._id}`
      );
    } catch (err) {
      console.error(`[JobAlertScheduler] Error processing alert ${alert._id}:`, err.message);
    }
  }
}

/**
 * Start the cron schedules. Call this once when the server starts.
 * Schedules:
 *  - Daily  alerts: every day at 08:00 AM
 *  - Weekly alerts: every Monday at 08:00 AM
 */
export function startJobAlertScheduler() {
  // Daily: "0 8 * * *"  → At 08:00 every day
  cron.schedule("0 8 * * *", async () => {
    console.log("[JobAlertScheduler] Running daily alert dispatch...");
    try {
      await dispatchJobAlerts("daily");
    } catch (err) {
      console.error("[JobAlertScheduler] Daily dispatch error:", err.message);
    }
  });

  // Weekly: "0 8 * * 1" → At 08:00 every Monday
  cron.schedule("0 8 * * 1", async () => {
    console.log("[JobAlertScheduler] Running weekly alert dispatch...");
    try {
      await dispatchJobAlerts("weekly");
    } catch (err) {
      console.error("[JobAlertScheduler] Weekly dispatch error:", err.message);
    }
  });

  console.log("[JobAlertScheduler] Cron schedules registered (daily @08:00, weekly Mon@08:00)");
}
