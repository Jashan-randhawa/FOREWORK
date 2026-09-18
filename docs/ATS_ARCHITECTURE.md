# FOREWORK ATS Predictor — System Architecture

## Overview
The FOREWORK Applicant Tracking System (ATS) Resume Analyzer and Predictor is a production-ready, explainable evaluation pipeline built natively inside the existing FOREWORK MERN platform. It provides candidates and recruiters with transparent, deterministic scoring, granular parseability analysis, skill gap detection, and actionable optimization guidance.

---

## Architectural Pipeline

```text
                  Resume Upload (PDF / DOCX / TXT / Cloudinary URL)
                                        │
                                        ▼
                               File Validation
                       (Size <= 5MB, format integrity)
                                        │
                                        ▼
                           Document Text Extraction
                     (PDF via pdf-parse, DOCX via mammoth)
                                        │
                                        ▼
                            Quality & Scan Detection
                        (Machine-readable vs Image PDF)
                                        │
                                        ▼
                              Section Detection
                     (Canonical normalization of headings)
                                        │
                                        ▼
                         Entity & Contact Extraction
                    (Name, Email, Phone, Socials, Location)
                                        │
                                        ▼
                      Experience & Education Parsing
                  (Dates, metrics, verbs, degrees, majors)
                                        │
                                        ▼
                         Canonical Skill Extraction
                  (Boundary checking, alias normalization)
                                        │
                                        ▼
                        Formatting & Risk Analysis
                   (Multi-column, tables, encoding noise)
                                        │
                                        ▼
                          Deterministic Score Engine
                       (Algorithm Version: ats_v1.0)
                                        │
               ┌────────────────────────┴────────────────────────┐
               ▼                                                 ▼
      ATS Compatibility Score                             Job Description
             (0–100)                                             │
               │                                                 ▼
               │                                            JD Parser
               │                                  (Required vs Preferred skills)
               │                                                 │
               │                                                 ▼
               │                                    Keyword & Semantic Matcher
               │                                    (Overlap & conceptual ties)
               │                                                 │
               │                                                 ▼
               │                                          Job Match Score
               │                                              (0–100)
               └────────────────────────┬────────────────────────┘
                                        │
                                        ▼
                              Recommendation Engine
                           (Evidence-based, prioritized)
                                        │
                                        ▼
                              Explanation Engine
                         ("Why is my score X?" rationale)
                                        │
                                        ▼
                        Persistence & REST Endpoints
                     (Mongoose ATSAnalysis model & API)
                                        │
                                        ▼
                              Frontend Dashboards
                  (Candidate /ats page & Recruiter Table)
```

---

## Core Modules & Design Principles

> **Core Philosophy**: Rules should calculate. NLP should understand. Embeddings should match. LLMs should explain.

1. **`Backend/ats/parser/documentExtractor.js`**:
   - In-memory stream extraction for PDF (`pdf-parse`) and DOCX (`mammoth`).
   - Rejects empty buffers and oversized documents (> 5MB).
   - Identifies non-OCR or scanned image PDFs via character density metrics, emitting low extraction confidence (`0.15`) instead of assigning inaccurate scores.

2. **`Backend/ats/extraction/sectionDetector.js`**:
   - Maps arbitrary section titles into canonical categories (`summary`, `experience`, `education`, `skills`, `projects`, `certifications`, `awards`, `languages`, `publications`, `volunteer`).

3. **`Backend/ats/extraction/contactExtractor.js`**:
   - RFC 5322 regex for email, international phone parser, LinkedIn/GitHub/portfolio URL identification, and top-of-page name heuristics.

4. **`Backend/ats/extraction/skillTaxonomy.js` & `skillExtractor.js`**:
   - Comprehensive taxonomy covering Languages, Frameworks, Databases, Cloud/DevOps, AI/ML, and Testing.
   - Normalizes aliases (`ReactJS` -> `React`, `Postgres` -> `PostgreSQL`, `K8s` -> `Kubernetes`, `Golang` -> `Go`).
   - Word boundary constraints prevent false substring collisions (e.g. `go` in `algorithm` or `c` in `cat`).

5. **`Backend/ats/extraction/experienceExtractor.js`**:
   - Normalizes complex date ranges (`Jan 2022 - Present`, `2020 to 2023`).
   - Identifies action verbs (`Developed`, `Architected`, `Optimized`) and quantifiable achievements (percentages, revenue, throughput, scale).

6. **`Backend/ats/extraction/formattingAnalyzer.js`**:
   - Flags layout elements that create reading order hazards for ATS parsers (multi-column tables, excessive symbols, missing essential sections).
   - Employs non-defamatory phrasing: `"Potential parsing risk detected"`.

7. **`Backend/ats/scoring/atsScoreEngine.js`**:
   - Strict 100-point deterministic rubric with versioning (`ats_v1.0`).
   - Outputs dual scores: **ATS Compatibility** and **Job Match**.

---

## Security & PII Protection
- ATS analysis endpoints are protected by JWT authentication (`isAuthenticated`).
- Only parsed semantic entities and derived metadata are stored in MongoDB (`ATSAnalysis` collection).
- Sensitive PII (PAN and Aadhaar) continues to use AES-256-GCM encryption with HMAC blind indexing.
- Files are parsed entirely in memory without writing unencrypted temporary files to the disk.
