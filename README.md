# 💼 FOREWORK — Job Portal

A full-stack **Job Portal Web Application** built with the MERN stack (MongoDB, Express, React, Node.js). FOREWORK connects job seekers, recruiters, and platform admins in one unified platform, featuring secure authentication, resume upload, company management, job listings, real-time notifications, analytics dashboards, and full applicant tracking.

> 🌐 **Live Demo:** [https://forework.vercel.app](https://forework.vercel.app)
> ⚙️ **Backend API:** [https://forework.onrender.com](https://forework.onrender.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Redux State Management](#redux-state-management)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Demo Credentials](#demo-credentials)
- [Known Issues](#known-issues)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## Overview

FOREWORK is a role-based job portal that serves three types of users:

- **Students / Job Seekers** — browse and search job listings, apply with a resume, track application status, save jobs, receive in-app notifications, and manage their profile
- **Recruiters** — register companies, post jobs, review applicants, schedule interviews, add recruiter notes, and view per-job analytics dashboards
- **Admins** — moderate users, jobs, and companies across the platform with full audit logging

Authentication is handled via **JWT tokens stored in HTTP-only cookies**. Sensitive PII (PAN, Aadhaar) is encrypted at rest using **AES-256-GCM** with blind indexing. File uploads (profile photos, resumes, company logos) are managed through **Multer + Cloudinary**.

---

## Features

### 👩‍💼 Job Seekers
- Register and login securely with role-based access
- Upload a profile photo during registration (stored on Cloudinary)
- Browse, search, and filter job listings by keyword, location, technology, experience, and salary
- Explore jobs by category using a carousel-based browser (14 tech categories)
- View detailed job descriptions including requirements, salary, job type, and location
- Apply for jobs with an uploaded resume (PDF via Cloudinary)
- Track all applied jobs with live status updates, scheduled interview times, and meeting links
- Save jobs for later review and share job opportunities via 1-click clipboard / Web Share API
- Set custom job alerts (daily / weekly) to receive notifications when matching jobs are posted
- Edit profile: update name, bio, skills, phone number, and resume
- Receive in-app notifications (application status updates, interview scheduling, job alerts)
- Email verification flow and password reset via tokenized email links

### 🏢 Recruiters
- Register and manage company profiles (name, description, website, location, logo)
- Post new job listings with full details (title, description, requirements, salary, location, job type, experience level, number of open positions)
- Manage job lifecycle: `draft → published → paused → expired → closed`
- View all jobs posted under their account with real-time conversion rates and candidate analytics (Recharts-powered dashboards)
- Review applicants, download resumes, record recruiter notes, and schedule video interviews with email notifications
- Update individual applicant status: Accepted / Rejected / Interview

### 🛡️ Admin
- Platform-wide analytics dashboard: volume metrics, 30-day growth timelines, role/status distributions
- Paginated user management with search, role filter, and suspend/unsuspend actions
- Paginated job management with moderation (publish, pause, close, delete)
- Company management with verification workflow
- Full immutable audit log trail (actor, action, target, timestamp)

### 🔒 Security, Performance & Accessibility
- Passwords hashed with **bcryptjs** (salt rounds: 10)
- **AES-256-GCM** encryption with blind indexing for sensitive PII (PAN, Aadhaar)
- `FIELD_ENCRYPTION_KEY` guard: server refuses to start in production if the key is missing or matches the known placeholder — generate with `openssl rand -hex 32`
- JWT tokens with 1-day expiry, stored in HTTP-only cookies
- Cookie posture: `HttpOnly`, `SameSite: Lax` / `None` in production with `Secure: true`
- Gzip response compression (`compression` middleware) and Cloudinary delivery optimization (`f_auto,q_auto`)
- Automated CI vulnerability scans (`npm audit`) and weekly Dependabot dependency management
- Route-level React Error Boundary and WCAG accessibility improvements (skip links, ARIA labels, semantic landmarks)
- Docker multi-stage build with unprivileged `appuser` and HTTP health check
- Graceful shutdown: SIGTERM/SIGINT connection draining for HTTP and MongoDB

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 6.0.3 | Build tool and dev server |
| React Router DOM | 7.0.2 | Client-side routing with lazy loading |
| Redux Toolkit | 2.5.0 | Global state management |
| Redux Persist | 6.0.0 | Persist auth/session to localStorage |
| Axios | 1.7.9 | HTTP client |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| shadcn/ui + Radix UI | — | Accessible UI components |
| Framer Motion | 12.0.3 | Page and component animations |
| Recharts | 2.x | Analytics charts and dashboards |
| Lucide React + React Icons | — | Icon sets |
| Sonner | 1.7.1 | Toast notifications |
| Embla Carousel | 8.5.1 | Job category carousel |
| next-themes | 0.4.4 | Dark/light theme support |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js + Express | 4.21.2 | REST API server (ESM) |
| MongoDB + Mongoose | 8.8.4 | Database and ODM |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT token generation and verification |
| Multer | 1.4.5-lts.1 | Multipart file upload (memory storage) |
| Cloudinary | 2.5.1 | Cloud storage for images and files |
| datauri | 4.1.0 | Convert file buffer to data URI for Cloudinary |
| cookie-parser | 1.4.7 | Parse cookies from requests |
| cors | 2.8.5 | Cross-origin resource sharing |
| compression | — | Gzip response compression |
| dotenv | 16.4.7 | Environment variable management |
| nodemon | 3.1.7 | Auto-reload in development |
| nodemailer | — | Transactional email (email verify, password reset, interview notifications) |

### DevOps, Testing & Production Readiness

| Tool / Practice | Purpose |
|-----------------|---------|
| Docker (Multi-stage) | Hardened Node 20 Alpine containerization with unprivileged `appuser` & health check |
| Vitest (10 suites, 133 tests) | Unit, security, and end-to-end integration test automation — all passing |
| GitHub Actions CI | Automated linting, test suite execution, and critical security audits on every push |
| Graceful Shutdown | SIGTERM/SIGINT connection draining for HTTP and MongoDB connections |
| Render / Railway | Containerized backend hosting with health monitoring |
| Vercel | Frontend hosting with SPA rewrite configuration |

---

## Project Structure

```
FOREWORK/
│
├── Backend/
│   ├── controllers/
│   │   ├── user.controller.js          # Register, login, logout, update profile, email verify, password reset
│   │   ├── job.controller.js           # Post job, get all jobs, get by ID, admin jobs, saved jobs, alerts, stats
│   │   ├── company.controller.js       # Register, get all, get by ID, update company
│   │   ├── application.controller.js   # Apply, get applied jobs, get applicants, update status, notes, schedule
│   │   ├── admin.controller.js         # Platform stats, user/job/company moderation, audit logs
│   │   └── notification.controller.js  # CRUD for in-app notifications
│   ├── models/
│   │   ├── user.model.js               # User schema (Student/Recruiter/Admin, AES-256 PII, email verify)
│   │   ├── job.model.js                # Job schema with status lifecycle, views counter, applications array
│   │   ├── company.model.js            # Company schema with Cloudinary logo URL, verification flag
│   │   ├── application.model.js        # Application schema (status, recruiterNotes, scheduledAt, meetingLink)
│   │   ├── savedJob.model.js           # User bookmark (unique compound index)
│   │   ├── jobAlert.model.js           # Job alert criteria with frequency and lastSentAt
│   │   ├── notification.model.js       # In-app notifications with type enum and isRead flag
│   │   └── auditLog.model.js           # Immutable admin audit trail
│   ├── routes/
│   │   ├── user.route.js  job.route.js  company.route.js
│   │   ├── application.route.js  admin.route.js  notification.route.js
│   ├── middleware/
│   │   ├── isAuthenticated.js          # JWT cookie verification, sets req.id
│   │   └── multer.js                   # Memory-storage single file upload
│   ├── utils/
│   │   ├── db.js          cloud.js     datauri.js
│   │   ├── validateEnv.js              # Required env var guard + production encryption key check
│   │   └── mailer.js                   # Nodemailer transactional email dispatcher
│   ├── tests/
│   │   └── phase1–phase10.test.js      # 133 tests across 10 Vitest suites
│   ├── .env.example
│   ├── index.js                        # Express app: routes, CORS, compression, graceful shutdown
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── App.jsx                     # All routes (React.lazy) + ErrorBoundary
│   │   ├── main.jsx                    # Redux Provider + PersistGate
│   │   ├── components/
│   │   │   ├── authentication/         # Login.jsx, Register.jsx
│   │   │   ├── components_lite/        # Home, Jobs, Browse, Description, Profile, AppliedJob,
│   │   │   │                           # SavedJobs, ForgotPassword, ResetPassword, VerifyEmail, ...
│   │   │   ├── admincomponent/         # Recruiter & Admin dashboards, job/user/company moderation
│   │   │   ├── creator/                # About/team page
│   │   │   └── ui/                     # shadcn/ui primitives
│   │   ├── hooks/                      # Custom data-fetching hooks (auto-dispatch to Redux)
│   │   ├── redux/                      # store, authSlice, jobSlice, companySlice, applicationSlice
│   │   └── utils/                      # API endpoint constants, Axios instance
│   ├── vercel.json                     # SPA rewrite → /index.html
│   └── package.json
│
├── docs/                               # Extended reference documentation
│   ├── api/  architecture/  deployment/  features/
│
├── Dockerfile                          # Backend: node:20-alpine multi-stage
├── start.sh                            # Quick start script
└── README.md
```

---

## Data Models

### User
```js
{
  fullname, email, phoneNumber,
  password (bcrypt hashed),
  pancard (AES-256-GCM encrypted, pancardHash blind-indexed),
  adharcard (AES-256-GCM encrypted, adharcardHash blind-indexed),
  role: Enum["Student", "Recruiter", "Admin"],
  isSuspended, isEmailVerified,
  emailVerificationToken, emailVerificationExpires,
  passwordResetToken, passwordResetExpires,
  profile: { bio, skills[], resume (Cloudinary URL), resumeOriginalName, company (ref), profilePhoto (Cloudinary URL) }
}
```

### Job
```js
{
  title, description, requirements[],
  salary, experienceLevel, location, jobType, position,
  company (ref → Company), created_by (ref → User),
  status: Enum["draft", "published", "paused", "expired", "closed"],
  views: Number,     // incremented (awaited) on every getJobById call
  applications: [ref → Application]
}
```

### Application
```js
{
  job (ref), applicant (ref),
  status: Enum["pending", "accepted", "rejected", "interview"],
  recruiterNotes: [{ author, text, createdAt }],
  scheduledAt: Date,    // interview datetime
  meetingLink: String   // video call link
}
```

### Other Models
- **SavedJob** — unique { user, job } bookmark with compound index
- **JobAlert** — criteria object + frequency (daily/weekly) + lastSentAt
- **Notification** — type enum (APPLICATION_SUBMITTED, NEW_APPLICANT, APPLICATION_STATUS, INTERVIEW_SCHEDULED, JOB_ALERT, SYSTEM), isRead flag, compound index { recipient, isRead, createdAt }
- **Company** — name (unique), description, website, location, logo (Cloudinary URL), isVerified
- **AuditLog** — actor, action, targetType, targetId, details (immutable, indexed)

---

## API Reference

Base URL (production): `https://forework.onrender.com`

### User — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|:---:|-------------|
| POST | `/register` | ❌ | Register. Rate-limited. PII encrypted at rest. |
| POST | `/login` | ❌ | Login. Returns JWT in HTTP-only cookie. |
| POST | `/logout` | ❌ | Clears JWT cookie |
| POST | `/profile/update` | ✅ | Update profile (name, bio, skills, phone, resume) |
| POST | `/forgot-password` | ❌ | Request password reset token (anti-enumeration) |
| POST | `/reset-password` | ❌ | Reset password via token |
| GET/POST | `/verify-email` | ❌ | Verify email (query token or body payload) |
| POST | `/verify-email/resend` | ✅ | Resend verification email |

### Jobs — `/api/job`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|:---:|:----:|-------------|
| GET | `/get` | ❌ | Any | All jobs with filters: keyword, location, jobType, experienceMin/Max, salaryMin/Max, page, limit |
| GET | `/get/:id` | ❌ | Any | Single job — increments views counter |
| POST | `/post` | ✅ | Recruiter | Post new job |
| GET | `/getadminjobs` | ✅ | Recruiter | Recruiter's jobs (supports ?status=) |
| PUT | `/:id/status` | ✅ | Recruiter | Update job lifecycle status |
| POST | `/:id/save` | ✅ | Student | Bookmark a job |
| POST/DEL | `/:id/unsave` | ✅ | Student | Remove bookmark |
| GET | `/saved` | ✅ | Student | List saved jobs |
| POST/GET/DELETE | `/alerts` | ✅ | Student | Create / list / delete job alerts |
| GET | `/:id/stats` | ✅ | Recruiter | Per-job funnel analytics |

### Companies — `/api/company`

`POST /register` · `GET /get` · `GET /get/:id` · `PUT /update/:id` (all require Recruiter auth, ownership verified)

### Applications — `/api/application`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|:---:|:----:|-------------|
| POST | `/apply/:id` | ✅ | Student | Apply to job (duplicate prevention, rate-limited) |
| GET | `/get` | ✅ | Student | All applications submitted by candidate |
| GET | `/:id/applicants` | ✅ | Recruiter | Applicants for a job |
| POST | `/status/:id/update` | ✅ | Recruiter | Update applicant status |
| POST | `/:id/notes` | ✅ | Recruiter | Add recruiter note |
| POST | `/:id/schedule` | ✅ | Recruiter | Schedule interview + send email notification |

### Admin — `/api/admin` (Admin role required)

`GET /stats` · `GET|PATCH /users/:id/status` · `GET|PATCH|DELETE /jobs/:id`
`GET|PATCH /companies/:id/verify` · `GET /audit-logs`

### Notifications — `/api/notification`

`GET /` · `GET /unread-count` · `PATCH /:id/read` · `PATCH /read-all` · `DELETE /:id`

---

## Frontend Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` or `/Home` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/Jobs` | Jobs | Public |
| `/Browse` | Browse | Public |
| `/description/:id` | Description | Public |
| `/Profile` | Profile | Public |
| `/saved-jobs` | SavedJobs | 🔒 Student |
| `/forgot-password` | ForgotPassword | Public |
| `/reset-password` | ResetPassword | Public |
| `/verify-email` | VerifyEmail | Public |
| `/PrivacyPolicy` | PrivacyPolicy | Public |
| `/TermsofService` | TermsofService | Public |
| `/Creator` | Creator | Public |
| `/recruiter/companies` | Companies | 🔒 Recruiter |
| `/recruiter/companies/create` | CompanyCreate | 🔒 Recruiter |
| `/recruiter/companies/:id` | CompanySetup | 🔒 Recruiter |
| `/recruiter/jobs` | AdminJobs | 🔒 Recruiter |
| `/recruiter/jobs/create` | PostJob | 🔒 Recruiter |
| `/recruiter/jobs/:id/applicants` | Applicants | 🔒 Recruiter |
| `/admin/dashboard` | AdminDashboard | 🔒 Admin |
| `/admin/users` | AdminUsers | 🔒 Admin |
| `/admin/jobs` | AdminJobs | 🔒 Admin |
| `/admin/companies` | AdminCompanies | 🔒 Admin |
| `/admin/audit-logs` | AdminAuditLogs | 🔒 Admin |

All routes use **React.lazy** + **Suspense** + top-level **ErrorBoundary**.

---

## Redux State Management

Persisted to `localStorage` via redux-persist (key: `"root"`, version: 1).

| Slice | State Shape | Purpose |
|-------|-------------|---------|
| `auth` | `{ user, loading }` | Logged-in user object and loading indicator |
| `job` | `{ allJobs, allAdminJobs, singleJob, searchJobByText, allAppliedJobs, searchedQuery }` | All job data and filter state |
| `company` | `{ companies, singleCompany }` | Recruiter's company list and active company |
| `application` | `{ applicants }` | Applicants list for recruiter job views |

**Filter categories (Filtercard):**
- Location: Delhi, Mumbai, Kolhapur, Pune, Bangalore, Hyderabad, Chennai, Remote
- Technology: MERN, React, Data Scientist, Full Stack, Node, Python, Java, Frontend, Backend, Mobile, Desktop
- Experience: 0–3, 3–5, 5–7, 7+ years
- Salary: 0–50k, 50k–100k, 100k–200k, 200k+

**Job categories carousel (14 categories):** Frontend, Backend, Full Stack, MERN, Data Scientist, DevOps, Machine Learning, AI Engineer, Cybersecurity, Product Manager, UX/UI Designer, Graphics Engineer, Graphics Designer, Video Editor

---

## Getting Started

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- SMTP credentials (Gmail or similar)

### Backend Setup

```bash
cd Backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # development with nodemon → http://localhost:5001
npm test               # run all 133 tests
```

### Frontend Setup

```bash
cd Frontend
echo "VITE_API_URL=http://localhost:5001" > .env
npm install
npm run dev            # → http://localhost:5173
npm run build          # production build
```

### Docker Setup

```bash
# Build image
docker build -t forework-backend .

# Run container
docker run -p 5001:5001 \
  -e MONGO_URI=your_mongo_uri \
  -e JWT_SECRET=your_secret \
  -e FIELD_ENCRYPTION_KEY=$(openssl rand -hex 32) \
  -e CLOUD_NAME=your_cloudinary_name \
  -e CLOUD_API=your_cloudinary_api_key \
  -e API_SECRET=your_cloudinary_api_secret \
  -e FRONTEND_URL=http://localhost:5173 \
  -e EMAIL_USER=your@email.com \
  -e EMAIL_PASS=your_smtp_password \
  forework-backend
```

Or use the quick-start script:

```bash
chmod +x start.sh && ./start.sh
```

---

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret used to sign and verify JWT tokens |
| `PORT` | ✅ | Express server port (default: 5001) |
| `CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUD_API` | ✅ | Cloudinary API key |
| `API_SECRET` | ✅ | Cloudinary API secret |
| `FRONTEND_URL` | ✅ | Allowed CORS origin |
| `FIELD_ENCRYPTION_KEY` | ✅ | 32-byte hex key for AES-256-GCM PII encryption. Generate: `openssl rand -hex 32`. **Server refuses to start in production if missing or set to the placeholder.** |
| `EMAIL_USER` | ✅ | SMTP sender address (email verify, password reset, interview scheduling) |
| `EMAIL_PASS` | ✅ | SMTP app password |

### Frontend (`Frontend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_API_URL` | ✅ | Backend base URL |

---

## Deployment

### Frontend → Vercel
1. Push `Frontend/` to GitHub
2. Import into [Vercel](https://vercel.com), set root directory to `Frontend`
3. Add `VITE_API_URL` → your Render backend URL
4. Deploy — `vercel.json` SPA rewrite handles React Router

### Backend → Render
1. New **Web Service** on [Render](https://render.com)
2. Build: `npm install`, Start: `node index.js`, Root: `Backend/`
3. Add all env vars including `FIELD_ENCRYPTION_KEY`
4. Set `FRONTEND_URL` to your Vercel app URL

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Job Seeker (Student) | `jashan@gmail.com` | `password123` |
| Recruiter | `recruiter@company.com` | `password123` |

---

## Known Issues

- **Render cold starts:** Free tier spins down after ~15 min idle; first wake-up request may take 20–30 s.
- **Cross-origin cookies:** `SameSite: None; Secure` in production — may behave differently in strict browser privacy modes.
- **Single file uploads only:** Multer uses `.single("file")` — multiple file uploads per request are not supported.
- **Regex-based search only:** No full-text index or fuzzy matching; uses MongoDB `$regex` on title/description.
- **`FIELD_ENCRYPTION_KEY` must be a real secret:** Generate with `openssl rand -hex 32`. The server refuses to start in production if this is missing or set to the placeholder value in `.env.example`.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Creator & Maintainer

**Jashanpreet Singh** — Full Stack Developer & Project Lead ([@Jashan-randhawa](https://github.com/Jashan-randhawa))

---

## License

This project is open source and available under the **MIT License**.

---

> 🔗 **GitHub:** [github.com/Jashan-randhawa/FOREWORK](https://github.com/Jashan-randhawa/FOREWORK)
