# 👩‍💼 Candidate Experience Guide

The candidate portal provides job seekers with discovery tools, transparent application telemetry, and automated job matching.

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
- Frequency: Daily or Weekly email summaries
- Triggered by backend Node-Cron scheduler (`jobAlertScheduler.js`).