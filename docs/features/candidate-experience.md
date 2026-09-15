# Candidate Experience Features

## 1. Saved Jobs (CAND-001)
Candidates can bookmark jobs directly from listing cards (`Job1.jsx`) or the job detail view (`Description.jsx`) and review them in a dedicated view (`/saved-jobs`).

### Data Model (`SavedJob`)
- `user`: ObjectId (ref: `User`)
- `job`: ObjectId (ref: `Job`)
- Compound unique index: `{ user: 1, job: 1 }` prevents duplicate bookmarks.

### API Endpoints
- `POST /api/job/:id/save`: Save a job bookmark (Student role required).
- `POST /api/job/:id/unsave` & `DELETE /api/job/:id/unsave`: Remove bookmark.
- `GET /api/job/saved`: Retrieve all saved jobs with populated company and job details.

---

## 2. Saved Searches & Job Alerts (CAND-002)
Candidates can configure search criteria alerts to receive notifications on matching opportunities.

### Data Model (`JobAlert`)
- `user`: ObjectId (ref: `User`)
- `title`: String
- `criteria`: Object (`keyword`, `location`, `jobType`, `minSalary`, `maxSalary`, `experienceLevel`)
- `frequency`: Enum (`daily`, `weekly`)
- `lastSentAt`: Date
- `isActive`: Boolean

### API Endpoints
- `POST /api/job/alerts`: Create a search alert.
- `GET /api/job/alerts`: List user's active alerts.
- `DELETE /api/job/alerts/:id`: Delete an alert.

---

## 3. Resume Upload Validation UX (CAND-003)
In `EditProfileModal.jsx`, client-side pre-flight checks are enforced before network submission:
- **Format Validation**: Ensures file is `application/pdf` or has a `.pdf` extension; provides instant inline error messaging.
- **Size Validation**: Ensures file size is strictly under 5MB; rejects oversized files instantly with clear size calculation.
