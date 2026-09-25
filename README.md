<div align="center">

# 💼 FOREWORK

### Enterprise MERN Stack Job Portal & Talent Acquisition Platform

An end-to-end recruitment platform connecting **Job Seekers**, **Recruiters**, and **Platform Administrators**. Features an explainable ATS Resume Predictor with pre-apply checks, military-grade AES-256-GCM PII encryption, Bearer token auth & 30-day mobile sessions, real-time funnel analytics, and multi-domain CORS support.

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-forework.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=white)](https://forework.vercel.app)
[![API Service](https://img.shields.io/badge/API_Service-forework.onrender.com-4682b4?style=for-the-badge&logo=render&logoColor=white)](https://forework.onrender.com)
[![Tests Passing](https://img.shields.io/badge/Tests-291%20Passing-2ea44f?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Jashan-randhawa/FOREWORK)
[![Version](https://img.shields.io/badge/Version-v2.1.0-6B3AC2?style=for-the-badge)](./CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.5-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_8.8-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20CDN-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

---

## 👥 Three Operational Portals

| Portal | Core Functionality |
| :--- | :--- |
| **👩‍💼 Candidate Hub** | Run ATS Compatibility & Job Match scans, evaluate pre-apply resume compatibility directly on job detail pages, browse & filter jobs across 14 tech categories, apply with Cloudinary-backed PDF/DOCX resumes, track real-time application stages, save jobs, and configure periodic email alerts |
| **🏢 Recruiter Suite** | Manage verified company identities, post jobs across a 5-stage lifecycle (`draft` → `published` → `paused` → `expired` → `closed`), screen applicants with real-time ATS match scores and modal breakdown dialog (`ATSAnalysisModal`), review CVs, schedule video calls, and inspect Recharts funnel analytics |
| **🛡️ Admin Console** | Platform governance: suspend/reinstate users, moderate listings, verify enterprise organizations, and inspect immutable forensic audit logs |

---

## ✨ Key Capabilities & Security

- 🎯 **Explainable ATS Predictor (v2.1)** — Dual deterministic scoring (**ATS Compatibility** 0–100 and **Job Match** 0–100) using the `ats_v1.0` 100-point rubric. Features in-memory PDF/DOCX parsing, canonical skill taxonomy (60+ mappings), layout hazard detection, pre-apply compatibility checks on job pages, authenticated Cloudinary resume downloads, and prioritized recommendations.
- 🔐 **Zero-Trust Data Protection** — Sensitive PII (National IDs: PAN, Aadhaar) encrypted at rest using **AES-256-GCM** with blind indexing (HMAC-SHA256) for rapid queries without exposing plaintext.
- 🛡️ **Hardened Auth & Mobile Sessions** — Dual-source authentication accepting `HttpOnly` JWT cookies or `Authorization: Bearer <token>` header. Supports `X-Client: mobile` for extended **30-day sessions** with tokens returned in response bodies for secure mobile storage. Optional registration photo with UI-Avatars branded fallback.
- 🌐 **Multi-Domain CORS Architecture** — Multi-origin support with trailing-slash normalization, allowing multiple comma-separated `FRONTEND_URL` endpoints and automatic `*.vercel.app` preview wildcard matching.
- 🚦 **Server Boot Guard** — Refuses to launch in production if cryptographic keys (`FIELD_ENCRYPTION_KEY`, `JWT_SECRET`) are absent or using default placeholders.
- 📂 **Cloud File Pipeline** — In-memory Multer buffering with streaming to Cloudinary for avatars, corporate logos, and PDF/DOCX resumes.
- 📊 **Talent Analytics** — Recharts dashboard tracking listing views, application conversion rates, and candidate pipeline distribution.
- 📧 **Transactional Mailer & Job Alerts** — Automated email verification, anti-enumeration password resets, interview invitations, and cron-scheduled job alerts (Daily & Weekly) via Nodemailer.
- ⚡ **Production Ready** — Gzip compression, graceful `SIGTERM`/`SIGINT` connection draining, multi-stage Alpine Dockerfile, and **291/291 passing Vitest tests** across Frontend and Backend.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Redux Toolkit, React Router v7, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Vercel Speed Insights |
| **Backend** | Node.js (ESM), Express 4.21, MongoDB Atlas, Mongoose 8.8, JWT, Multer, Cloudinary, Nodemailer, pdf-parse, mammoth |
| **DevOps & QA** | Docker (Multi-stage), Vitest (30 suites, 291 tests: 152 backend + 139 frontend), GitHub Actions CI, Vercel, Render |

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd Backend
cp .env.example .env     # Add MONGO_URI, JWT_SECRET, and run `openssl rand -hex 32` for FIELD_ENCRYPTION_KEY
npm install
npm run dev              # Server starts on http://localhost:5001
```

### 2. Frontend Setup
```bash
# In a separate terminal
cd Frontend
echo "VITE_API_URL=http://localhost:5001" > .env
npm install
npm run dev              # Client starts on http://localhost:5173
```

### 🐳 Docker Container Run
```bash
docker build -t forework-backend .
docker run -d -p 5001:5001 --env-file Backend/.env forework-backend
```

---

## 🔑 Demo Sandbox Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Job Seeker (Student)** | `jashan@gmail.com` | `password123` | Search, bookmark, apply, upload resume, run ATS checks, view status |
| **Corporate Recruiter** | `recruiter@company.com` | `password123` | Post jobs, update status, screen applicants with ATS modal, schedule calls |
| **Platform Administrator** | `admin@forework.com` | `admin123` | Moderate jobs, approve companies, audit forensic logs |

---

## 📚 In-Depth Technical Documentation & Wiki

Explore our comprehensive [**Project Wiki**](./wiki/Home.md) or dive into specific architectural blueprints:

| Architecture & Security | Features & Workflows | API & Deployment |
| :--- | :--- | :--- |
| • [Security Architecture](./wiki/Security-&-Encryption.md)<br/>• [Architecture Overview](./wiki/Architecture-Overview.md)<br/>• [ATS Predictor Architecture](./docs/ATS_ARCHITECTURE.md)<br/>• [ATS Scoring Rubric](./docs/ATS_SCORING.md) | • [ATS Predictor Wiki](./wiki/ATS-Predictor.md)<br/>• [Candidate Experience](./wiki/Candidate-Portal.md)<br/>• [Employer & Analytics](./wiki/Recruiter-Suite.md)<br/>• [Admin Moderation](./wiki/Admin-Console.md) | • [API Reference](./wiki/API-Reference.md)<br/>• [ATS API Reference](./docs/ATS_API.md)<br/>• [Mobile & PWA Guide](./wiki/Mobile-&-PWA.md)<br/>• [Docker & Production Guide](./wiki/Deployment-Guide.md) |

---

## 👨‍💻 Creator & Maintainer

<div align="center">

**Jashanpreet Singh**  
*Full Stack Developer & Systems Architect*

[![Portfolio](https://img.shields.io/badge/Live_Demo-forework.vercel.app-00dfa2?style=flat-square&logo=vercel&logoColor=white)](https://forework.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Jashan--randhawa-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Jashan-randhawa)

<br/>

<sub>Distributed under the [MIT License](./LICENSE). Engineered with precision for modern hiring teams and ambitious talent.</sub>

</div>
