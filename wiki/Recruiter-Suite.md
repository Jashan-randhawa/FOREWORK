# 🏢 Recruiter Suite Guide

The Recruiter Suite empowers verified hiring teams to publish listings, manage corporate profiles, review candidate pipelines with **real-time ATS compatibility insights**, and analyze talent conversion metrics.

---

## 🏢 Company Profile & Verification

1. **Company Setup (`CompanySetup.jsx`)**:
   - Company name, corporate domain, registered office location, and description.
   - High-resolution logo upload streamed to Cloudinary CDN.
2. **Verification Badge**:
   - Newly created companies enter a moderation queue.
   - Once vetted by platform administrators, the company receives the verified badge (`BadgeCheck`).

---

## 📋 5-Stage Job Lifecycle

Listings progress through five states managed by `JobLifecycleBadge.jsx`:

| State | Visibility | Candidate Actions | Recruiter Actions |
| :--- | :--- | :--- | :--- |
| **`draft`** | Private to recruiter | Inactive | Edit, delete, publish |
| **`published`** | Public marketplace | Searchable & open for applications | Pause, close, edit |
| **`paused`** | Public marketplace | Viewable, applications temporarily disabled | Resume, close |
| **`expired`** | Hidden from marketplace | Applications closed | Relist, archive |
| **`closed`** | Hidden from marketplace | Closed permanently | Archive |

---

## 👥 Candidate Pipeline & Screening (`ApplicantsTable.jsx`)

- **Screening Cards**: Review applicant name, email, contact, applied date, and status.
- **Inline CV Inspection**: Inspect candidate resumes directly in the browser with `ResumeViewer`.
- **Status Progression**: Update applicant status between `pending`, `accepted`, and `rejected`.
- **Interview Scheduling**: Schedule remote video calls with meeting URLs and calendar reminders.

### ATS Integration (v2.1)
- **ATS Score Column**: Each applicant row displays a computed ATS compatibility score retrieved from the `Application.atsScore` field.
- **ATS Analysis Modal (`ATSAnalysisModal.jsx`)**: Click on an applicant's ATS score to view a full breakdown modal showing:
  - Dual scores (ATS Compatibility + Job Match)
  - 6-category score breakdown
  - Matched and missing skills comparison
  - Formatting issues and recommendations
  - Algorithm version and analysis timestamp
- **On-the-Fly Computation**: If an applicant has no pre-computed ATS score, the recruiter endpoint `GET /api/ats/application/:appId` triggers real-time analysis using the candidate's stored resume against the job description.

---

## 📊 Talent Analytics Funnel (`RecruiterDashboard.jsx`)

Powered by **Recharts**:
- **Total Views**: Impression counts across active listings.
- **Application Conversion Rate**: Percentage of viewers who completed applications.
- **Applicant Pipeline Distribution**: Bar chart comparing candidates across screening stages.
- **Location Demographics**: Geographic breakdown of applicants.