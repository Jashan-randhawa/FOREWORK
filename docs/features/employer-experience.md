# Employer / Recruiter Experience (Phase 4)

## 1. Company Profile Edit Flow & Ownership Enforcement (EMP-001)

### Security & Access Control
- Object-level authorization is enforced on both `GET /api/company/get/:id` and `PUT /api/company/update/:id`.
- Requesters must be the registered owner of the company (`company.userId === req.id`). Unaffiliated recruiters or students attempting access receive `403 Forbidden`.

### Frontend Experience (`CompanySetup.jsx`)
- Pre-flight fetch retrieves company details for the authorized recruiter.
- If a `403 Forbidden` or `404 Not Found` response is returned, a dedicated error UI displays:
  - Clear header: "Access Denied: Company Not Yours" / "Company Not Found".
  - Informative copy explaining permissions.
  - Return button: "Back to My Companies" redirecting to `/admin/companies`.

---

## 2. Job Status Lifecycle & Management (EMP-002)

### Status States
Jobs support 5 lifecycle states:
- `published`: Visible to all job seekers on public search. Default state.
- `draft`: Saved by recruiter, excluded from public job search.
- `paused`: Temporarily suspended from public search, visible to owner.
- `closed`: Position filled or closed, excluded from public search.
- `expired`: Job listing expired.

### Data Model & Migration
- Schema: `status: { type: String, enum: ["draft", "published", "paused", "expired", "closed"], default: "published", index: true }`.
- Backward compatibility migration: `Backend/scripts/migrate-job-status.js` updates legacy jobs lacking the status field to `"published"`.

### API Endpoints
- `PUT /api/job/:id/status` & `POST /api/job/:id/status`:
  - Requires `Recruiter` role and job ownership (`created_by === req.id`).
  - Request body: `{ status: "published" | "draft" | "paused" | "expired" | "closed" }`.
- `GET /api/job/get`: Public job listings automatically filter to `status: "published"` by default.
- `GET /api/job/getadminjobs`: Recruiter job table returns all jobs with status, and supports optional `?status=` query filter.

### Frontend Controls (`AdminJobsTable.jsx`)
- Dedicated **Status** column displaying color-coded badges:
  - Green for `published`
  - Gray for `draft`
  - Yellow/Amber for `paused`
  - Red for `closed`
  - Orange for `expired`
- In the actions menu, status controls allow switching states immediately with optimistic local updates and toast alerts.

---

## 3. Recruiter Notes on Applications (EMP-003)

### Data Model
- `Application.recruiterNotes`:
  ```js
  [
    {
      author: ObjectId (ref: "User", required),
      text: String (required, trimmed),
      createdAt: Date (default: Date.now)
    }
  ]
  ```

### API Endpoint
- `POST /api/application/:id/notes`:
  - Restricted to Recruiter owning the job.
  - Request body: `{ text: "Candidate has strong React skills." }`.
  - Response: `{ success: true, message, data: { recruiterNotes } }`.

### Frontend Experience (`ApplicantsTable.jsx`)
- Notes button in each applicant row displays note count.
- Clicking opens a dialog displaying note history with timestamps, recruiter names, and a form to add new notes.

---

## 4. Interview Scheduling (EMP-004)

### Data Model
- `Application.scheduledAt`: Date
- `Application.meetingLink`: String

### API Endpoint
- `POST /api/application/:id/schedule`:
  - Restricted to Recruiter owning the job.
  - Request body: `{ scheduledAt: "2026-09-20T14:30:00.000Z", meetingLink: "https://meet.google.com/xyz" }`.
  - Automatically triggers transactional email notification via `Backend/utils/mailer.js` (`sendInterviewInvitationEmail`) to the applicant with interview date, time, and meeting URL.

### Frontend Experience (`ApplicantsTable.jsx`)
- Shows interview status badge with calendar date and clickable meeting link.
- Recruiter can schedule or reschedule an interview via an intuitive modal form with datetime picker and link input.
