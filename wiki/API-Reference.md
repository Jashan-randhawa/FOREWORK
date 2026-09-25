# 📡 REST API Reference

All ForeWork API endpoints are dual-mounted under both `/api` and `/api/v1` for versioning compatibility, and support JSON request/response envelopes.

**Authentication**: All protected endpoints accept JWT tokens via `HttpOnly` cookies or `Authorization: Bearer <token>` header. Mobile clients sending `X-Client: mobile` receive tokens with 30-day expiry.

---

## 🔐 Authentication Endpoints (`/api/v1/user`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Register new user (Student or Recruiter). Profile photo optional — auto-generates branded avatar if omitted. | No |
| `POST` | `/login` | Authenticate and issue HttpOnly JWT cookie. Returns token in body for mobile clients (`X-Client: mobile`). | No |
| `POST` | `/logout` | Clear session cookie | Yes |
| `POST` | `/profile/update` | Update profile, bio, skills, resume | Yes |
| `POST` | `/forgot-password` | Trigger password reset email (anti-enumeration: always returns 200) | No |
| `POST` | `/reset-password/:token` | Reset password using verified token | No |
| `POST` | `/verify-email/:token` | Verify email address using token | No |
| `POST` | `/resend-verification` | Resend email verification link | Yes |

> **Mobile Clients**: Login with `X-Client: mobile` header to receive a 30-day JWT (vs default 1-day) and the token in the response body for secure local storage.

---

## 💼 Jobs Endpoints (`/api/v1/job`)

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/get` | Get all published jobs (with projection) | `keyword`, `location`, `salary`, `fields` |
| `GET` | `/get/:id` | Get single job details by ID | None |
| `POST` | `/post` | Post a new job (Recruiter only) | None |
| `GET` | `/getadminjobs` | Get jobs created by logged-in recruiter | `fields` |
| `PUT` | `/status/:id` | Update job lifecycle status | None |

> **Performance Tip**: Add `?fields=title,company,location,salary,jobType` to `/get` to omit heavy descriptions and optimize mobile network payloads.

---

## 🏢 Company Endpoints (`/api/v1/company`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Register new company identity | Recruiter |
| `GET` | `/get` | Get companies registered by user | Recruiter |
| `GET` | `/get/:id` | Get company details by ID | Yes |
| `PUT` | `/update/:id` | Update company details & logo | Recruiter |

---

## 📝 Application Endpoints (`/api/v1/application`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/apply/:id` | Apply for a job | Candidate |
| `GET` | `/get` | Get all applied jobs for current user | Candidate |
| `GET` | `/:id/applicants` | Get applicants for a specific job | Recruiter |
| `POST` | `/status/:id/update` | Update applicant status | Recruiter |

---

## 🛡️ Admin Governance Endpoints (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/users` | Paginated user management list | Admin |
| `POST` | `/users/:id/suspend` | Suspend user account | Admin |
| `GET` | `/audit-logs` | Paginated security audit logs | Admin |
| `POST` | `/companies/:id/verify` | Grant verified status to company | Admin |

---

## 🔔 Notification Endpoints (`/api/v1/notification`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Get user notifications | Yes |
| `PUT` | `/:id/read` | Mark notification as read | Yes |
| `DELETE` | `/:id` | Delete a notification | Yes |

---

## 🎯 ATS Predictor Endpoints (`/api/v1/ats`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/analyze` | Full ATS analysis: resume buffer, profile resume, or Cloudinary URL against optional JD | Yes |
| `POST` | `/score` | Lightweight normalized match score (0.0–1.0) for quick applicant ranking | Yes |
| `GET` | `/history` | Fetch user's last 20 ATS analysis records | Yes |
| `GET` | `/analysis/:id` | Retrieve saved ATS analysis by MongoDB ObjectId | Yes |
| `GET` | `/application/:appId` | Get or compute ATS score for a specific job application | Yes |

### `POST /api/ats/analyze` — Input Formats

**Multipart Upload**:
```
Content-Type: multipart/form-data
file: <resume.pdf|.docx|.txt>
job_id: <optional MongoDB ObjectId>
```

**JSON Body**:
```json
{
  "use_profile_resume": true,
  "job_id": "673abc1234567890abcdef12",
  "job_description": "We are seeking a Senior React Developer..."
}
```

### `POST /api/ats/analyze` — Response Schema

```json
{
  "success": true,
  "score": 82,
  "overall_score": 82,
  "ats_compatibility_score": 86,
  "job_match_score": 74,
  "breakdown": {
    "parsing": 17.5,
    "job_match": 24.0,
    "experience": 16.5,
    "sections": 9.0,
    "qualifications": 8.0,
    "quality": 8.0
  },
  "skills": {
    "matched": ["Python", "SQL", "FastAPI"],
    "missing_required": ["AWS", "Kubernetes"],
    "missing_preferred": []
  },
  "formatting_issues": [...],
  "recommendations": [...],
  "explanation": "Your overall score is 82/100...",
  "analysis_id": "674000111222333444555666",
  "algorithm_version": "ats_v1.0"
}
```

---

## 🚦 Rate Limiting

| Scope | Window | Max Requests |
| :--- | :--- | :--- |
| Global API (`/api/*`) | 15 minutes | 300 |
| Auth endpoints (`login`, `register`, `forgot-password`, `reset-password`) | 15 minutes | 15 |
| Application submit (`/apply`) | 15 minutes | 30 |

Rate limiting is automatically skipped during test environments (`NODE_ENV=test`).

---

## 🏥 Health Check

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Returns `{ status: "healthy", timestamp: "..." }` — no auth required |