# 💼 FOREWORK — Job Portal

A full-stack **Job Portal Web Application** built with the MERN stack (MongoDB, Express, React, Node.js). FOREWORK connects job seekers and recruiters in one unified platform, featuring secure authentication, resume upload, company management, job listings, and applicant tracking.

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

FOREWORK is a role-based job portal that serves two types of users:

- **Students / Job Seekers** — browse job listings, apply with a resume, track application status, and manage their profile
- **Recruiters** — register companies, post jobs, review applicants, and update application statuses

Authentication is handled via **JWT tokens stored in HTTP-only cookies**, and file uploads (profile photos, resumes, company logos) are managed through **Multer + Cloudinary**.

---

## Features

### 👩‍💼 Job Seekers
- Register and login securely with role-based access
- Upload a profile photo during registration (stored on Cloudinary)
- Browse, search, and filter job listings by location, technology, experience, and salary
- Explore jobs by category using a carousel-based browser (14 tech categories)
- View detailed job descriptions including requirements, salary, job type, and location
- Apply for jobs with an uploaded resume (PDF via Cloudinary)
- Track all applied jobs and view live application status (Pending / Accepted / Rejected)
- Edit profile: update name, bio, skills, phone number, and resume

### 🏢 Recruiters
- Register and manage company profiles (name, description, website, location, logo)
- Post new job listings with full details (title, description, requirements, salary, location, job type, experience level, number of open positions)
- View all jobs posted under their account in a management table
- Review the full list of applicants for each job
- Update individual applicant status (Accepted / Rejected)

### 🔒 Security
- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens with 1-day expiry, stored in HTTP-only cookies
- Cookie settings adapt for environment: `SameSite: None; Secure` in production, `SameSite: Lax` in development
- Recruiter-only admin routes protected by `<ProtectedRoute>` on the frontend
- All sensitive API routes protected by `authenticateToken` JWT middleware on the backend
- Duplicate checks on email, PAN card, and Aadhaar card during registration

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
| Lucide React + React Icons | — | Icon sets |
| Sonner | 1.7.1 | Toast notifications |
| Embla Carousel | 8.5.1 | Job category carousel |
| next-themes | 0.4.4 | Dark/light theme support |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js + Express | 4.21.2 | REST API server |
| MongoDB + Mongoose | 8.8.4 | Database and ODM |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT token generation and verification |
| Multer | 1.4.5-lts.1 | Multipart file upload (memory storage) |
| Cloudinary | 2.5.1 | Cloud storage for images and files |
| datauri | 4.1.0 | Convert file buffer to data URI for Cloudinary |
| cookie-parser | 1.4.7 | Parse cookies from requests |
| cors | 2.8.5 | Cross-origin resource sharing |
| dotenv | 16.4.7 | Environment variable management |
| nodemon | 3.1.7 | Auto-reload in development |

### DevOps & Deployment

| Tool | Purpose |
|------|---------|
| Docker | Backend containerization (Node 20 Alpine) |
| Render | Backend hosting |
| Vercel | Frontend hosting with SPA rewrite config |

---

## Project Structure

```
FOREWORK-main/
│
├── Backend/
│   ├── controllers/
│   │   ├── user.controller.js        # Register, login, logout, update profile
│   │   ├── job.controller.js         # Post job, get all jobs, get by ID, admin jobs
│   │   ├── company.controller.js     # Register, get all, get by ID, update company
│   │   └── application.controller.js # Apply, get applied jobs, get applicants, update status
│   ├── models/
│   │   ├── user.model.js             # User schema (Student/Recruiter roles, PAN, Aadhaar)
│   │   ├── job.model.js              # Job schema with company ref and applications array
│   │   ├── company.model.js          # Company schema with Cloudinary logo URL
│   │   └── application.model.js      # Application schema (job + applicant + status)
│   ├── routes/
│   │   ├── user.route.js             # /api/user/*
│   │   ├── job.route.js              # /api/job/*
│   │   ├── company.route.js          # /api/company/*
│   │   └── application.route.js      # /api/application/*
│   ├── middleware/
│   │   ├── isAuthenticated.js        # JWT cookie verification, sets req.id
│   │   └── multer.js                 # Memory-storage single file upload
│   ├── utils/
│   │   ├── db.js                     # MongoDB connection via Mongoose
│   │   ├── cloud.js                  # Cloudinary SDK setup
│   │   └── datauri.js                # Buffer → data URI converter
│   ├── .env.example
│   ├── index.js                      # Express app entry point, route mounting, CORS
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── App.jsx                   # All route definitions with React.lazy loading
│   │   ├── main.jsx                  # Entry point — Redux Provider + PersistGate
│   │   ├── index.css                 # Global Tailwind styles
│   │   │
│   │   ├── components/
│   │   │   ├── authentication/
│   │   │   │   ├── Login.jsx             # Role-based login form (Student/Recruiter toggle)
│   │   │   │   └── Register.jsx          # Registration form with profile photo upload
│   │   │   │
│   │   │   ├── components_lite/          # Core user-facing pages and UI
│   │   │   │   ├── Home.jsx              # Landing page
│   │   │   │   ├── Navbar.jsx            # Nav bar with auth-aware menu
│   │   │   │   ├── Footer.jsx            # Site footer
│   │   │   │   ├── Header.jsx            # Hero section with keyword search
│   │   │   │   ├── Jobs.jsx              # Job listings page with filter sidebar
│   │   │   │   ├── Browse.jsx            # Search results page
│   │   │   │   ├── Description.jsx       # Full job detail with apply button
│   │   │   │   ├── Profile.jsx           # User profile display page
│   │   │   │   ├── EditProfileModal.jsx  # Profile editing modal dialog
│   │   │   │   ├── AppliedJob.jsx        # Table of user's applied jobs + status
│   │   │   │   ├── Job1.jsx              # Expanded job card component
│   │   │   │   ├── JobCards.jsx          # Compact job card component
│   │   │   │   ├── LatestJobs.jsx        # Latest jobs section (homepage)
│   │   │   │   ├── Categories.jsx        # Job category carousel (14 categories)
│   │   │   │   ├── Filtercard.jsx        # Filter panel (location/tech/exp/salary)
│   │   │   │   ├── PrivacyPolicy.jsx     # Privacy policy page
│   │   │   │   └── TermsofService.jsx    # Terms of service page
│   │   │   │
│   │   │   ├── admincomponent/           # Recruiter-only views (protected)
│   │   │   │   ├── ProtectedRoute.jsx        # Guards all /admin/* routes
│   │   │   │   ├── Companies.jsx             # Recruiter's company list page
│   │   │   │   ├── CompaniesTable.jsx         # Company management table
│   │   │   │   ├── CompanyCreate.jsx          # New company registration form
│   │   │   │   ├── CompanySetup.jsx           # Company profile update form + logo upload
│   │   │   │   ├── AdminJobs.jsx              # Recruiter's job listings page
│   │   │   │   ├── AdminJobsTable.jsx         # Job management table with actions
│   │   │   │   ├── PostJob.jsx                # Create new job listing form
│   │   │   │   ├── Applicants.jsx             # Applicants list for a specific job
│   │   │   │   └── ApplicantsTable.jsx        # Applicant table with status update dropdown
│   │   │   │
│   │   │   ├── creator/                  # About/team page with creator photos
│   │   │   │   ├── Creator.jsx
│   │   │   │   ├── amreshsir.jpg
│   │   │   │   ├── Ankit.jpg
│   │   │   │   ├── ritik.jpg
│   │   │   │   └── gaurav.jpg
│   │   │   │
│   │   │   └── ui/                       # shadcn/ui primitive components
│   │   │       └── avatar, badge, button, carousel, dialog, input, label,
│   │   │           popover, radio-group, select, sonner, table
│   │   │
│   │   ├── hooks/                        # Custom data-fetching hooks (auto-dispatch to Redux)
│   │   │   ├── useGetAllJobs.jsx
│   │   │   ├── useGetAllJAdminobs.jsx
│   │   │   ├── useGetAllAppliedJobs.jsx
│   │   │   ├── usegetAllCompanies.jsx
│   │   │   └── useGetCompanyById.jsx
│   │   │
│   │   ├── redux/
│   │   │   ├── store.js                  # Combined store with redux-persist
│   │   │   ├── authSlice.js              # user, loading
│   │   │   ├── jobSlice.js               # allJobs, singleJob, filters, appliedJobs
│   │   │   ├── companyslice.js           # companies, singleCompany
│   │   │   └── applicationSlice.js       # applicants
│   │   │
│   │   ├── utils/
│   │   │   ├── data.js                   # API endpoint constants (uses VITE_API_URL)
│   │   │   └── axiosInstance.js          # Axios instance with withCredentials: true
│   │   │
│   │   └── lib/utils.js                  # clsx + tailwind-merge utility
│   │
│   ├── vercel.json                       # SPA rewrite: all routes → /index.html
│   ├── vite.config.js                    # @ path alias for /src
│   ├── tailwind.config.js
│   ├── components.json                   # shadcn/ui config
│   └── package.json
│
├── Dockerfile                            # Backend Docker image (node:20-alpine)
├── start.sh                              # Quick start script (install + run backend)
├── .dockerignore
└── README.md
```

---

## Data Models

### User
```js
{
  fullname:    String (required)
  email:       String (required, unique)
  phoneNumber: String (required, unique)
  password:    String (required, bcrypt hashed)
  pancard:     String (required, unique)
  adharcard:   String (required, unique)
  role:        Enum["Student", "Recruiter"]  // default: "Student"
  profile: {
    bio:                String
    skills:             [String]
    resume:             String    // Cloudinary URL
    resumeOriginalName: String
    company:            ObjectId → Company
    profilePhoto:       String    // Cloudinary URL, default: ""
  }
  createdAt, updatedAt (timestamps)
}
```

### Job
```js
{
  title:           String (required)
  description:     String (required)
  requirements:    [String]           // comma-separated on input, stored as array
  salary:          String (required)
  experienceLevel: Number (required)
  location:        String (required)
  jobType:         String (required)  // e.g. "Full-time", "Part-time", "Remote"
  position:        Number (required)  // number of open positions
  company:         ObjectId → Company (required)
  created_by:      ObjectId → User (required)
  applications:    [ObjectId → Application]
  createdAt, updatedAt (timestamps)
}
```

### Company
```js
{
  name:        String (required, unique)
  description: String
  website:     String
  location:    String
  logo:        String     // Cloudinary URL
  userId:      ObjectId → User (required)
  createdAt, updatedAt (timestamps)
}
```

### Application
```js
{
  job:       ObjectId → Job (required)
  applicant: ObjectId → User (required)
  status:    Enum["pending", "accepted", "rejected"]  // default: "pending"
  createdAt, updatedAt (timestamps)
}
```

---

## API Reference

Base URL (production): `https://forework.onrender.com`

### User — `/api/user`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| POST | `/register` | ❌ | Register new user. Send as `multipart/form-data` with `file` field for profile photo |
| POST | `/login` | ❌ | Login. Returns JWT in HTTP-only cookie |
| POST | `/logout` | ❌ | Clears JWT cookie |
| POST | `/profile/update` | ✅ | Update profile. Optionally send `file` field for new resume |

**Register body fields:** `fullname`, `email`, `phoneNumber`, `password`, `role`, `pancard`, `adharcard`, `file`

**Login body fields:** `email`, `password`, `role`

---

### Jobs — `/api/job`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| GET | `/get` | ❌ | Get all jobs. Optional `?keyword=` query for title/description search |
| GET | `/get/:id` | ❌ | Get single job by ID (populates applications) |
| POST | `/post` | ✅ | Post a new job (recruiter only) |
| GET | `/getadminjobs` | ✅ | Get all jobs created by the authenticated recruiter |

**Post job body fields:** `title`, `description`, `requirements`, `salary`, `location`, `jobType`, `experience`, `position`, `companyId`

---

### Companies — `/api/company`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| POST | `/register` | ✅ | Register a new company (requires `companyName`) |
| GET | `/get` | ✅ | Get all companies owned by logged-in recruiter |
| GET | `/get/:id` | ✅ | Get single company by ID |
| PUT | `/update/:id` | ✅ | Update company details + logo. Send as `multipart/form-data` with `file` for logo |

---

### Applications — `/api/application`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| GET | `/apply/:id` | ✅ | Apply to a job by job ID |
| GET | `/get` | ✅ | Get all applications submitted by the logged-in user |
| GET | `/:id/applicants` | ✅ | Get all applicants for a job (recruiter) |
| POST | `/status/:id/update` | ✅ | Update application status (`{ status: "accepted" \| "rejected" \| "pending" }`) |

---

## Frontend Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` or `/Home` | `Home` | Public |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/Jobs` | `Jobs` | Public |
| `/Browse` | `Browse` | Public |
| `/description/:id` | `Description` | Public |
| `/Profile` | `Profile` | Public |
| `/PrivacyPolicy` | `PrivacyPolicy` | Public |
| `/TermsofService` | `TermsofService` | Public |
| `/Creator` | `Creator` | Public |
| `/admin/companies` | `Companies` | 🔒 Recruiter only |
| `/admin/companies/create` | `CompanyCreate` | 🔒 Recruiter only |
| `/admin/companies/:id` | `CompanySetup` | 🔒 Recruiter only |
| `/admin/jobs` | `AdminJobs` | 🔒 Recruiter only |
| `/admin/jobs/create` | `PostJob` | 🔒 Recruiter only |
| `/admin/jobs/:id/applicants` | `Applicants` | 🔒 Recruiter only |

All routes use **React.lazy** for code-splitting and are wrapped in a `<Suspense>` fallback.

---

## Redux State Management

State is persisted to `localStorage` via **redux-persist** (key: `"root"`, version: 1).

| Slice | State Shape | Purpose |
|-------|-------------|---------|
| `auth` | `{ user, loading }` | Logged-in user object and loading indicator |
| `job` | `{ allJobs, allAdminJobs, singleJob, searchJobByText, allAppliedJobs, searchedQuery }` | All job data and filter state |
| `company` | `{ companies, singleCompany }` | Recruiter's company list and active company |
| `application` | `{ applicants }` | Applicants list for recruiter job views |

**Filter categories available in `Filtercard`:**
- **Location:** Delhi, Mumbai, Kolhapur, Pune, Bangalore, Hyderabad, Chennai, Remote
- **Technology:** MERN, React, Data Scientist, Full Stack, Node, Python, Java, Frontend, Backend, Mobile, Desktop
- **Experience:** 0–3, 3–5, 5–7, 7+ years
- **Salary:** 0–50k, 50k–100k, 100k–200k, 200k+

**Job categories in carousel:** Frontend Developer, Backend Developer, Full Stack Developer, MERN Developer, Data Scientist, DevOps Engineer, Machine Learning Engineer, AI Engineer, Cybersecurity Engineer, Product Manager, UX/UI Designer, Graphics Engineer, Graphics Designer, Video Editor

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB Atlas** account (free tier works)
- **Cloudinary** account (free tier works — needed for photo/resume/logo uploads)

---

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/` (copy from `.env.example`):

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/forework
JWT_SECRET=your_strong_secret_key
PORT=5001
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

```bash
# Start with auto-reload (development)
npm run dev

# Start without nodemon (production)
npm start
```

API will be available at: `http://localhost:5001`

---

### Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file inside `Frontend/`:

```env
VITE_API_URL=http://localhost:5001
```

```bash
# Start dev server
npm run dev

# Build for production
npm run build
```

App will be available at: `http://localhost:5173`

---

### Docker Setup

```bash
# Build image
docker build -t forework-backend .

# Run container
docker run -p 5001:5001 \
  -e MONGO_URI=your_mongo_uri \
  -e JWT_SECRET=your_secret \
  -e CLOUD_NAME=your_cloudinary_name \
  -e CLOUD_API=your_cloudinary_api_key \
  -e API_SECRET=your_cloudinary_api_secret \
  -e FRONTEND_URL=http://localhost:5173 \
  forework-backend
```

Or use the quick-start shell script:

```bash
chmod +x start.sh
./start.sh
```

---

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret used to sign and verify JWT tokens |
| `PORT` | ✅ | Port for the Express server (default: 5001) |
| `CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUD_API` | ✅ | Cloudinary API key |
| `API_SECRET` | ✅ | Cloudinary API secret |
| `FRONTEND_URL` | ✅ | Allowed CORS origin (e.g., `https://forework.vercel.app`) |

### Frontend (`Frontend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_API_URL` | ✅ | Backend base URL (e.g., `https://forework.onrender.com`) |

---

## Deployment

### Frontend → Vercel

1. Push `Frontend/` to GitHub.
2. Import the project into [Vercel](https://vercel.com), set the root directory to `Frontend`.
3. Add `VITE_API_URL` environment variable pointing to your Render backend URL.
4. Deploy. The `vercel.json` SPA rewrite rule ensures React Router works for all paths.

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Set build command: `npm install` and start command: `node index.js`.
3. Set root directory to `Backend/`.
4. Add all backend environment variables in the Render dashboard.
5. Set `FRONTEND_URL` to your Vercel app URL to allow CORS.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Job Seeker (Student) | `jashan@gmail.com` | `password123` |
| Recruiter | `ankit@company.com` | `password123` |

---

## Known Issues

- **Render cold starts:** Free tier backend spins down after ~15 minutes of inactivity. The first request after idle may take 20–30 seconds to wake up.
- **Cross-origin cookies:** Cookie-based auth may behave differently across browsers, especially in stricter privacy modes. The app uses `SameSite: None; Secure` in production to mitigate this.
- **No email verification:** Accounts are activated immediately on registration without any email confirmation step.
- **Single file uploads only:** Multer is configured with `.single("file")` — multiple file uploads in one request are not supported.
- **No pagination:** All job listings and company records are fetched in a single request, which may slow down at large scale.
- **Keyword search only:** Job search uses MongoDB `$regex` on title and description — no full-text indexing or fuzzy matching.
- **No password reset flow:** There is currently no "forgot password" or email-based reset functionality.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Team

| Name | Role |
|------|------|
| **Jashan Randhawa** | Full Stack Developer & Project Lead |
| **Ankit** | Contributor |
| **Ritik** | Contributor |
| **Gaurav** | Contributor |

Special thanks to **Amresh Sir** for guidance and mentorship.

---

## License

This project is open source and available under the **MIT License**.

---

> 🔗 **GitHub:** [github.com/Jashan-randhawa](https://github.com/Jashan-randhawa)
