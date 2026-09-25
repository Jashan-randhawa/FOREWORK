# 🎯 @jashan-randhawa/ats-predictor

[![npm version](https://img.shields.io/badge/version-1.0.0-6B3AC2?style=for-the-badge)](https://github.com/Jashan-randhawa/FOREWORK/packages)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

An enterprise-ready, deterministic, and explainable **Applicant Tracking System (ATS)** compatibility and job matching engine. Evaluates resume documents across parseability, standard headings, canonical skill taxonomy, experience relevance, and role qualifications using the `ats_v1.0` 100-point rubric.

---

## 📦 Installation

To install via **GitHub Packages npm Registry**:

1. Ensure your `.npmrc` has GitHub Packages configured:
   ```ini
   @jashan-randhawa:registry=https://npm.pkg.github.com
   ```

2. Install the package:
   ```bash
   npm install @jashan-randhawa/ats-predictor
   ```

---

## 🚀 Quick Start

### 1. Complete Resume & Job Match Analysis

```javascript
import { analyzeResume } from "@jashan-randhawa/ats-predictor";
import fs from "fs";

// Load resume buffer (PDF, Word DOCX, or TXT)
const resumeBuffer = fs.readFileSync("./resume.pdf");

// Job Description to match against
const jobDescription = `
We are looking for a Senior Backend Engineer with 4+ years of experience.
Required Skills: Node.js, Express, PostgreSQL, Redis, Docker.
Preferred Skills: Kubernetes, AWS, GraphQL.
`;

const result = await analyzeResume({
  resumeBuffer,
  jobDescription,
});

console.log("Overall ATS Score:", result.overall_score); // e.g. 85 / 100
console.log("ATS Compatibility:", result.ats_compatibility_score); // 0-100
console.log("Job Match Score:", result.job_match_score); // 0-100

// Granular 6-pillar breakdown (sums to 100)
console.log("Score Breakdown:", result.breakdown);
/*
{
  parsing: 18.5,        // max 20 pts
  job_match: 25.0,      // max 30 pts
  experience: 16.5,     // max 20 pts
  sections: 9.0,        // max 10 pts
  qualifications: 8.0,  // max 10 pts
  quality: 8.0          // max 10 pts
}
*/

// Matched vs Missing Skills
console.log("Matched Skills:", result.skills.matched);
console.log("Missing Required:", result.skills.missing_required);
console.log("Missing Preferred:", result.skills.missing_preferred);

// Prioritized Actionable Recommendations
console.log("Recommendations:", result.recommendations);

// Natural Language Explanation
console.log("Explanation:", result.explanation);
```

---

### 2. Standalone Parser & Scorer Usage

You can also use individual pipeline components independently:

```javascript
import {
  ResumeParser,
  JobDescriptionParser,
  ATSScoreEngine,
  SkillExtractor,
} from "@jashan-randhawa/ats-predictor";

// 1. Extract text, contact details, experiences, and canonical skills
const resume = await ResumeParser.parse({
  rawText: "John Doe | john@example.com | San Francisco, CA ...",
});

// 2. Parse job requirements (separates required vs preferred skills)
const jd = JobDescriptionParser.parse({
  rawText: "Required: React, TypeScript. Preferred: Next.js.",
});

// 3. Score against the deterministic 100-point rubric
const evaluation = ATSScoreEngine.evaluate(resume, jd);

// 4. Extract canonical skills directly from free text
const extractedSkills = SkillExtractor.extract("Experienced in ReactJS, Postgres, and K8s");
// => ['React', 'PostgreSQL', 'Kubernetes']
```

---

## 📊 100-Point Scoring Rubric (`ats_v1.0`)

| Metric | Max Pts | What It Measures |
| :--- | :---: | :--- |
| **Parseability** | **20** | Text machine-readability, contact completeness, encoding clarity, layout risk deductions |
| **Job Alignment** | **30** | Required (75% weight) and preferred (25% weight) skill overlap, semantic conceptual alignment |
| **Experience Relevance** | **20** | Total career duration vs job requirements, role titles, responsibility semantic relevance, metrics |
| **Structure** | **10** | Standard section headers, chronological progression, and logical section order |
| **Qualifications** | **10** | Degree level (Bachelor, Master, PhD) and professional certifications alignment |
| **Evidence / Quality** | **10** | Active action verbs, measurable outcomes (% and numbers), bullet conciseness |
| **TOTAL** | **100** | Full Deterministic ATS Evaluation Score |

---

## 🛡️ Privacy & Fairness
- **Zero Protected Demographic Attributes**: Ignores age, gender, race, religion, photos, and personal demographics.
- **In-Memory Buffering**: Parses documents entirely in memory without writing unencrypted temporary files to disk.
- **Anti-Stuffing Guarantee**: Encourages truthful, evidence-based accomplishments and penalizes keyword stuffing.

---

## 📄 License
MIT © [Jashanpreet Singh](https://github.com/Jashan-randhawa)
