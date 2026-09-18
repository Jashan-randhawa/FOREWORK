# 📡 REST API Reference

All ForeWork API endpoints are prefixed with `/api/v1` and support JSON request/response envelopes.

---

## 🔐 Authentication Endpoints (`/api/v1/user`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Register new user (Student or Recruiter) | No |
| `POST` | `/login` | Authenticate and issue HttpOnly JWT cookie | No |
| `POST` | `/logout` | Clear session cookie | Yes |
| `POST` | `/profile/update` | Update profile, bio, skills, resume | Yes |
| `POST` | `/forgot-password` | Trigger password reset email | No |
| `POST` | `/reset-password/:token` | Reset password using verified token | No |

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

## 🎯 ATS Predictor Endpoints (`/api/v1/ats`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/analyze` | Analyze resume buffer or profile against optional JD | Yes |
| `POST` | `/score` | Lightweight normalized match score for given resume and job | Yes |
| `GET` | `/history` | Fetch user's recent ATS analysis records | Yes |
| `GET` | `/analysis/:id` | Retrieve saved ATS analysis by ID | Yes |
| `GET` | `/application/:appId` | Get or compute ATS score for job applicant | Yes |