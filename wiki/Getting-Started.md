# 🚀 Getting Started with FOREWORK

This guide covers everything you need to set up, run, and test the ForeWork repository locally on your machine.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:
- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **Git**: `v2.x`
- **MongoDB**: A running MongoDB instance locally or a connection string to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Docker** *(Optional)*: If running the containerized build.

---

## 📁 Repository Structure

```
FOREWORK/
├── Backend/               # Express + Node.js API server
│   ├── ats/               # ATS Resume Predictor engine (parser, extraction, matching, scoring)
│   ├── config/            # Database & Cloudinary configurations
│   ├── controllers/       # Route controllers (user, job, company, application, ats)
│   ├── middleware/        # Auth guards, role verification, multer, audit logger
│   ├── models/            # Mongoose schemas (User, Job, Company, Application, ATSAnalysis)
│   ├── routes/            # Express route definitions
│   ├── utils/             # Encryption, scheduler, email helpers
│   └── tests/             # Vitest backend integration & controller tests
├── Frontend/              # React 18 + Vite SPA client
│   ├── public/            # Manifest, icons, service worker (sw.js)
│   ├── src/
│   │   ├── components/    # UI components (shadcn, admin, shared, lite, ats)
│   │   ├── context/       # Theme context (Light/Dark mode)
│   │   ├── hooks/         # Custom hooks (useMediaQuery, useInstallPrompt, etc.)
│   │   ├── pages/         # Page components (ATSAnalysis, etc.)
│   │   ├── redux/         # Redux Toolkit slices & root store
│   │   ├── services/      # HTTP service layer
│   │   ├── utils/         # Axios instance, formatting helpers, nav config
│   │   └── test/          # Vitest component & responsive tests
├── docs/                  # In-depth technical architecture documentation
│   ├── ATS_API.md         # ATS REST API specification
│   ├── ATS_ARCHITECTURE.md # ATS system architecture blueprint
│   └── ATS_SCORING.md     # ATS scoring rubric & mathematical formulations
├── wiki/                  # GitHub Wiki documentation suite
├── Dockerfile             # Multi-stage Alpine containerization
└── CHANGELOG.md           # Version release log
```

---

## ⚙️ Environment Configuration

### 1. Backend (`Backend/.env`)

Create `Backend/.env` by copying `Backend/.env.example` or populating the following:

```env
# Core Application & Database
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/forework?retryWrites=true&w=majority

# Authentication & Security
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# Cryptographic Key for AES-256-GCM Field Encryption
# Generate with: openssl rand -hex 32 (MUST be exactly 64 hex characters / 32 bytes)
FIELD_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Client URL (for CORS validation)
# For multiple frontends (e.g. web and mobile web), comma-separate the URLs:
FRONTEND_URL=https://forework.vercel.app,https://forework-mobile.vercel.app

# Cloudinary CDN Configuration
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# SMTP / Email Service (Notifications & Password Resets)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_email@gmail.com
SMTP_PASS=your_smtp_app_password
EMAIL_FROM="ForeWork" <noreply@forework.com>
```

> **Multi-Domain Note**: `FRONTEND_URL` supports comma-separated values for serving multiple frontend deployments (web + mobile). The first URL is used as the primary for email links.

### 2. Frontend (`Frontend/.env`)

```env
VITE_API_URL=http://localhost:5001
```

---

## 🏃 Running the Application

### Option A: Standard Local Setup

1. **Start the Backend**:
   ```bash
   cd Backend
   npm install
   npm run dev
   # Server runs on http://localhost:5001
   ```

2. **Start the Frontend**:
   ```bash
   cd Frontend
   npm install
   npm run dev
   # Client runs on http://localhost:5173
   ```

### Option B: Docker Container

```bash
# Build the production image
docker build -t forework-backend .

# Run the container
docker run -d -p 5001:5001 --env-file Backend/.env forework-backend
```

---

## 🔑 Demo Sandbox Accounts

ForeWork comes pre-configured with role-based test users:

| Persona | Email | Password | Role & Permissions |
| :--- | :--- | :--- | :--- |
| **Candidate (Student)** | `jashan@gmail.com` | `password123` | Search, filter, apply with PDF resume, ATS compatibility checks, track status, set alerts |
| **Corporate Recruiter** | `recruiter@company.com` | `password123` | Post jobs, update company, review applicants with ATS scores, schedule calls |
| **Platform Administrator** | `admin@forework.com` | `admin123` | Moderate jobs, approve companies, audit forensic logs |

---

## 🧪 Running Test Suites

ForeWork maintains 100% passing test suites across both layers:

```bash
# Run backend test suite (152 tests across 10 suites)
cd Backend
npm test

# Run frontend test suite (139 tests across 20 suites)
cd Frontend
npm test

# Run frontend production build check
npm run build
```

> **Total**: 291 tests (152 backend + 139 frontend) all passing.