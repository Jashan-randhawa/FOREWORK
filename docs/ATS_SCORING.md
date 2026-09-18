# FOREWORK ATS Scoring Specification & Rubric

## Scoring Model Overview
The FOREWORK ATS scoring engine employs a deterministic, transparent mathematical model calibrated to version `ats_v1.0`. It calculates two distinct scores:

1. **ATS Compatibility Score (0–100)**: Evaluates machine readability, formatting safety, structural completeness, and general resume content quality.
2. **Job Match Score (0–100)**: Evaluates alignment between candidate capabilities and a specific target job posting.

---

## Component Rubric Weights

| Component | Maximum Points | What It Measures |
| :--- | :---: | :--- |
| **Parseability** | **20** | Text machine-readability, contact completeness, encoding clarity, layout risk deductions |
| **Job Alignment** | **30** | Required (75% weight) and preferred (25% weight) skill overlap, semantic conceptual alignment |
| **Experience Relevance** | **20** | Total career duration vs job requirements, role titles, responsibility semantic relevance, metrics |
| **Structure** | **10** | Standard section headers, chronological progression, and logical section order |
| **Qualifications** | **10** | Degree level (Bachelor, Master, PhD) and professional certifications alignment |
| **Evidence / Quality** | **10** | Active action verbs, measurable outcomes (% and numbers), bullet conciseness |
| **TOTAL** | **100** | Full FOREWORK ATS Evaluation Score |

---

## Mathematical Formulations

### 1. Parseability Score (Max: 20 pts)
$$\text{Parseability} = \text{Base}(20) - \sum \text{Deductions} + \text{ContactBonus}$$
- **Scanned / Image PDF**: -15 pts (Critical risk)
- **Missing Email**: -4 pts
- **Missing Experience Heading**: -5 pts
- **Missing Education Heading**: -3 pts
- **Missing Skills Heading**: -3 pts
- **Multi-column / Tables**: -3 pts
- **Encoding Noise (>25 non-ASCII)**: -2 pts
- **Excessive Length (>1500 words)**: -2 pts

### 2. Job Alignment Score (Max: 30 pts)
$$\text{Alignment} = (\text{RequiredRatio} \times 22.5) + (\text{PreferredRatio} \times 7.5)$$
Where:
- $\text{RequiredRatio} = \frac{|\text{Matched Required Skills}|}{|\text{Total Required Skills}|}$
- $\text{PreferredRatio} = \frac{|\text{Matched Preferred Skills}|}{|\text{Total Preferred Skills}|}$
- Added semantic boost of up to $+4.5$ points for conceptual cluster matches (e.g. `FastAPI` covering `RESTful APIs`).

### 3. Experience Relevance Score (Max: 20 pts)
- **Duration Match**: Up to 8 points based on years of documented experience versus target requirements.
- **Title Alignment**: Up to 4 points for recognized engineering/domain job titles.
- **Semantic Responsibility Alignment**: Up to 5 points based on Jaccard token overlap between experience bullets and job duties.
- **Measurable Outcomes**: Up to 3 points for achievements with metrics.

### 4. Structure Score (Max: 10 pts)
- Contact block present: +2 pts
- Experience section present: +3 pts
- Skills section present: +2 pts
- Education section present: +2 pts
- Projects / Certifications present: +1 pt

### 5. Qualifications Score (Max: 10 pts)
- Ph.D. / Doctorate: 10 pts
- Master's Degree (M.S., M.Tech, MBA): 9 pts
- Bachelor's Degree (B.S., B.Tech, B.E.): 8 pts
- Associate Degree: 7 pts
- Professional Certification boost: +1 pt (capped at 10)

### 6. Evidence & Quality Score (Max: 10 pts)
- Action Verbs ($\ge 5$ verbs): 3 pts; ($\ge 2$ verbs): 2 pts
- Quantified Achievements ($\ge 3$ metrics): 3 pts; ($\ge 1$ metric): 2 pts
- Bullet conciseness and clarity: 2 pts
- Baseline descriptive quality: 2 pts

---

## Dual Score Synthesis

### ATS Compatibility Score (0–100)
$$\text{ATS Compatibility} = \min\left(100, (\text{Parsing} \times 2.5) + (\text{Structure} \times 2.0) + (\text{Quality} \times 1.5) + (\text{Completeness} \times 0.5)\right)$$

### Job Match Score (0–100)
$$\text{Job Match} = \min\left(100, (\text{Alignment} \times 2.0) + (\text{Experience} \times 1.25) + (\text{Qualifications} \times 1.5)\right)$$

---

## Example Calculation

**Inputs**: Clean 1-page PDF, 4 years experience, Bachelor of Science, Python + PostgreSQL + Docker, targeting Senior Backend Engineer (Requires: Python, PostgreSQL, AWS, Docker).

- **Parsing**: 18.5 / 20 (Clean single-column layout, verified contact info)
- **Job Match**: 24.5 / 30 (3 of 4 required skills matched; AWS missing)
- **Experience**: 17.0 / 20 (4 years exceeds 3-year requirement, strong action verbs)
- **Structure**: 10.0 / 10 (All standard sections present)
- **Qualifications**: 8.0 / 10 (Bachelor's in Computer Science verified)
- **Evidence / Quality**: 8.5 / 10 (Quantifiable metrics: 40% throughput, 35% latency)
- **Resulting Overall Score**: **87 / 100** (ATS Compatibility: 91 / 100, Job Match: 81 / 100)
