# 👩‍💼 Candidate Experience Guide

The candidate portal provides job seekers with discovery tools, transparent application telemetry, automated job matching, and **pre-apply ATS compatibility diagnostics**.

---

## 🔍 Job Search & Targeted Filtering

### Multi-Dimensional Filter Engine (`FilterCard.jsx`)
Candidates can filter open positions across four key dimensions:
1. **Discipline / Role**: Frontend, Backend, Full Stack, DevOps, Mobile, Machine Learning, Data Science, Product, UI/UX.
2. **Location & Remote**: Remote, Hybrid, Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune.
3. **Experience Level**: Entry Level (0-2 yrs), Mid Level (3-5 yrs), Senior Level (6+ yrs), Staff / Lead (8+ yrs).
4. **Compensation Bracket**: 0-6 LPA, 6-12 LPA, 12-25 LPA, 25-50 LPA, 50+ LPA.

### URL State Synchronization (`useFilterUrlSync.js`)
All filter states are synchronized with URL query parameters (`?q=react&location=remote&salary=18`), enabling shareable search links and browser history navigation.

---

## 📄 Application Process & PDF Streaming

1. **One-Click Application**: Candidates apply using their verified profile information and Cloudinary-stored resume.
2. **Resume Viewer (`ResumeViewer.jsx`)**: Built-in modal viewer allowing candidates and recruiters to inspect PDF resumes inline with responsive filename truncation and secure download.
3. **Duplicate Prevention**: Backend checks for existing applications on the `jobId` + `userId` composite key and prevents accidental duplicate submissions.

---

## 🎯 Pre-Apply ATS Compatibility Checker (v2.1)

Before submitting an application, candidates can evaluate their resume compatibility directly on the job detail page:

### `JobDetailATSCheck.jsx`
1. **Source Selection**: Toggle between "My Profile Resume" (stored on Cloudinary) or "Upload Local File" (PDF, DOCX, TXT up to 5MB).
2. **One-Click Analysis**: Runs `POST /api/ats/analyze` with the resume and target `job_id`.
3. **Inline Results**:
   - **Job Match Score**: Circular gauge showing job-specific alignment (0–100).
   - **ATS Parseability Score**: Circular gauge for structural and formatting evaluation (0–100).
   - **Match Health Summary**: Matched skills count and missing required skills count.
4. **Skills Alignment Comparison**: Visual badge breakdown of ✓ Matched, ✗ Missing Required, and + Missing Preferred skills.
5. **Actionable Tips**: Top 2 prioritized recommendations displayed before the "Proceed to Apply Now" button.
6. **Transparent Explanation**: "Why is my score X/100?" dialog with category-level breakdown reasons.

> **Graceful Fallback**: If a Cloudinary-stored resume returns a storage error (401/403), the component automatically switches to direct file upload with a guidance toast.

### Full ATS Diagnostic Studio (`/ats`)
For comprehensive analysis outside the context of a specific job, candidates can navigate to the dedicated ATS page featuring:
- Dual animated circular score gauges
- 6-category score breakdown with progress bars
- Filterable matched/missing skill pills
- Historical scan records
- Formatting issue severity cards
- Prioritized actionable recommendations

---

## ⏱️ Real-Time Telemetry Tracking (`AppliedJob.jsx`)

Every application transitions through explicit, transparent status milestones:

```
[Pending / Submitted] ➔ [Under Review] ➔ [Shortlisted] ➔ [Interview Scheduled] ➔ [Accepted / Rejected]
```

- **Video Interviews**: When an employer schedules an interview, conference links, scheduled time, and time-zone reminders are surfaced directly in the telemetry card.
- **Zero Ambiguity**: No silent rejections or ghosting; telemetry updates are recorded and timestamped.

---

## 🔔 Periodic Job Alerts (`JobAlerts.jsx`)

Candidates can configure background alerts matching their specific criteria:
- Keywords & titles
- Minimum compensation threshold
- Frequency: Daily (08:00 AM) or Weekly (Monday 08:00 AM) email summaries
- Triggered by backend Node-Cron scheduler (`jobAlertScheduler.js`)
- Each alert generates an in-app notification + formatted HTML email with direct job links