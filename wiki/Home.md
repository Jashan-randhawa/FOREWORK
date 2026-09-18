# 💼 Welcome to the FOREWORK Official Wiki

Welcome to the technical knowledge base and architecture wiki for **FOREWORK** — the modern, telemetry-driven career marketplace and talent acquisition platform built on the MERN stack (MongoDB, Express, React, Node.js).

---

## 🧭 Quick Navigation

`
FOREWORK Wiki
├── 🚀 Getting Started               -> Developer onboarding, env setup & docker
├── 🏗️ Architecture Overview          -> System design, MERN architecture & data flow
├── 🎯 ATS Resume Predictor (v2.1)    -> Explainable ATS scoring, skill matching & recommendations
├── 📱 Mobile & PWA Guide (v2.0)     -> Responsive carousels, app shell & offline caching
├── 👩‍💼 Candidate Experience          -> Discovery, telemetry tracking, resumes & alerts
├── 🏢 Recruiter Suite               -> 5-stage job lifecycle, applicant screening & analytics
├── 🛡️ Admin Governance              -> User moderation, audit logs & verification
├── 🔐 Security & Encryption         -> AES-256-GCM, blind indexing & auth hardening
├── 📡 API Reference                 -> Endpoints, auth guards & request/response specs
└── 🚢 Deployment Guide              -> Production setup on Vercel, Render & Docker
```

---

## 🌟 What is ForeWork?

ForeWork bridges ambitious engineering candidates and vetted tech employers with zero ambiguity and **zero ghosting**. 

Traditional hiring platforms suffer from "black hole" application tracking, fraudulent job postings, and clumsy desktop-only interfaces. ForeWork solves this with:

1. **Deterministic ATS Resume Predictor**: Dual scoring (ATS Compatibility + Job Match) with granular parseability diagnostics, canonical skill matching, and prioritized recommendations.
2. **Real-Time Telemetry Tracking**: Candidates know the exact second an application is reviewed, shortlisted, or scheduled for an interview.
3. **100% Employer Verification**: Every corporate entity undergoes manual administrative validation before publishing jobs.
4. **Mobile-First & PWA Ergonomics**: Fully responsive touch design with offline caching, bottom navigation, and swipeable carousels.
5. **Military-Grade Data Protection**: Sensitive PII is encrypted at rest using **AES-256-GCM** with blind indexing.

---

## 📊 High-Level System Architecture

`mermaid
flowchart TD
    subgraph Clients["Client Layer (Frontend)"]
        Web[Desktop Web Browser]
        PWA[Mobile App / PWA]
    end

    subgraph CDN["Edge & Storage"]
        Vercel[Vercel CDN - Frontend SPA]
        Cloudinary[Cloudinary CDN - Resumes & Logos]
    end

    subgraph Core["Backend Application Layer"]
        API[Express 4.21 API Server]
        AuthGuard[JWT Cookie Auth Middleware]
        Crypto[AES-256-GCM Encryption Engine]
        Scheduler[Node Cron Background Scheduler]
    end

    subgraph Data["Database & External"]
        Mongo[(MongoDB Atlas 8.8)]
        Mail[Nodemailer SMTP Transporter]
    end

    Web --> Vercel
    PWA --> Vercel
    Vercel --> API
    API --> AuthGuard
    AuthGuard --> Crypto
    Crypto --> Mongo
    API --> Cloudinary
    API --> Mail
    Scheduler --> Mongo
`

---

## 📌 Wiki Articles Directory

| Section | Description |
| :--- | :--- |
| [🚀 Getting Started](Getting-Started) | Local development setup, prerequisites, environment variables, and Docker. |
| [🏗️ Architecture Overview](Architecture-Overview) | Deep dive into codebase structure, state management, and request lifecycle. |
| [📱 Mobile & PWA Guide](Mobile-&-PWA) | Details on the v2.0 mobile adaptation, touch ergonomics, and Service Worker. |
| [👩‍💼 Candidate Portal](Candidate-Portal) | Search filters, application telemetry, resume streaming, and periodic job alerts. |
| [🏢 Recruiter Suite](Recruiter-Suite) | Multi-stage job lifecycle, applicant review, interview coordination, and Recharts analytics. |
| [🛡️ Admin Console](Admin-Console) | Forensic audit logs, user suspension, and company verification workflows. |
| [🔐 Security & Encryption](Security-&-Encryption) | Zero-trust cryptographic architecture, blind indexing, and OWASP defenses. |
| [📡 API Reference](API-Reference) | REST API endpoints, query projections, rate limiting, and response schemas. |
| [🚢 Deployment Guide](Deployment-Guide) | Containerized deployment using Docker, Render backend, and Vercel frontend. |
