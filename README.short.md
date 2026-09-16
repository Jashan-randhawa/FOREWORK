<div align="center">

# 💼 FOREWORK — Job Portal

### Production-Ready MERN Stack Talent Platform

Connecting Job Seekers, Recruiters, and Platform Admins with End-to-End Application Tracking, Hardened Security, and Real-Time Funnel Analytics.

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-forework.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=white)](https://forework.vercel.app)
[![API Status](https://img.shields.io/badge/API_Service-forework.onrender.com-4682b4?style=for-the-badge&logo=render&logoColor=white)](https://forework.onrender.com)
[![Full Documentation](https://img.shields.io/badge/Full_Docs-README.md-blueviolet?style=for-the-badge)](./README.md)
[![Tests](https://img.shields.io/badge/Tests-133%20Passing-2ea44f?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Jashan-randhawa/FOREWORK)

<br/>

[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)

</div>

---

## 👥 Three Specialized Portals

| Role | Key Capabilities |
| :--- | :--- |
| **Student / Job Seeker** | Browse & search 14 categories, apply with Cloudinary PDF resume, track status in real-time, save jobs, set automated alerts |
| **Recruiter** | Register company, post jobs, manage 5-stage lifecycle, review applicants, add notes, schedule video interviews, Recharts analytics |
| **Admin** | Suspend/reactivate users, moderate job postings, verify companies, review immutable security audit logs |

---

## ✨ Key Features

- 🔐 **Zero-Trust Security** — JWT in HTTP-only cookies, bcrypt password hashing, AES-256-GCM encrypted PII (PAN & Aadhaar) with blind indexing
- 📂 **Cloud Storage** — Cloudinary CDN for profile pictures, company logos, and PDF resumes
- 🔍 **Discovery Engine** — Real-time keyword, location, job type, experience, and salary filtering
- 📊 **Talent Analytics** — Real-time listing view counts, conversion rates, and pipeline status charts
- 📧 **Transactional Mail** — Verification tokens, password resets, and interview reminders via Nodemailer
- 🐳 **Production Hardened** — Multi-stage Alpine Docker build, graceful connection draining, gzip compression, and 133/133 passing Vitest tests

---

## 🛠️ Tech Stack Overview

- **Frontend:** React 18, Vite 6, Redux Toolkit, React Router v7, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- **Backend:** Node.js, Express (ESM), MongoDB Atlas, Mongoose, JWT, Multer, Cloudinary, Nodemailer
- **Testing & DevOps:** Vitest (10 suites, 133 tests), Docker, GitHub Actions CI, Vercel, Render

---

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Jashan-randhawa/FOREWORK.git
cd FOREWORK

# 2. Start Backend
cd Backend
cp .env.example .env
npm install
npm run dev        # Runs on http://localhost:5001

# 3. Start Frontend (separate terminal)
cd ../Frontend
echo "VITE_API_URL=http://localhost:5001" > .env
npm install
npm run dev        # Runs on http://localhost:5173
```

---

## 🔑 Demo Sandbox Accounts

| Persona | Email | Password | Access |
| :--- | :--- | :---: | :--- |
| **Candidate** | `jashan@gmail.com` | `password123` | Search, apply, bookmark, tracker |
| **Recruiter** | `recruiter@company.com` | `password123` | Post jobs, screen resumes, interview setup |

---

## 👨‍💻 Creator

**Jashanpreet Singh** — Full Stack Developer ([@Jashan-randhawa](https://github.com/Jashan-randhawa))  
📖 For the full technical reference, see [**README.md**](./README.md).
