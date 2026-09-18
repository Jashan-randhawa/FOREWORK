# FOREWORK ATS Predictor — REST API Reference

Base URLs:
- `/api/ats`
- `/api/v1/ats`

All endpoints require JWT authentication via `token` cookie or Bearer authorization header.

---

## 1. Primary Analysis Endpoint

### `POST /api/ats/analyze`
Runs comprehensive ATS parseability and job alignment analysis.

#### Request Formats:
- **`multipart/form-data`**:
  - `file`: Resume file (`.pdf`, `.docx`, `.txt`)
  - `job_id` (optional): FOREWORK Job ID
  - `job_description` (optional): Raw job description text
- **`application/json`**:
  ```json
  {
    "use_profile_resume": true,
    "job_id": "673abc1234567890abcdef12",
    "job_description": "We are seeking a Senior React Developer..."
  }
  ```

#### Successful Response (`200 OK`):
```json
{
  "success": true,
  "score": 82,
  "overall_score": 82,
  "ats_compatibility_score": 86,
  "job_match_score": 74,
  "breakdown": {
    "parsing": 17.5,
    "job_match": 24.0,
    "experience": 16.5,
    "sections": 9.0,
    "qualifications": 8.0,
    "quality": 8.0
  },
  "skills": {
    "matched": ["Python", "SQL", "FastAPI", "Git"],
    "missing": ["AWS", "Kubernetes"],
    "missing_required": ["AWS", "Kubernetes"],
    "missing_preferred": []
  },
  "confidence": {
    "extraction": 0.95,
    "matching": 0.90
  },
  "formatting_issues": [
    {
      "code": "MULTI_COLUMN_OR_TABLES",
      "severity": "MEDIUM",
      "message": "Potential parsing risk detected: Multiple columns may disrupt reading order.",
      "recommendation": "Use a single-column layout."
    }
  ],
  "recommendations": [
    {
      "priority": "HIGH",
      "category": "Required Skills",
      "title": "Demonstrate AWS Experience",
      "description": "AWS is listed as a required skill but was not detected.",
      "actionable_tip": "If you have verified AWS experience, add it to your skills and work history."
    }
  ],
  "explanation": "Your overall score is 82/100. Key positive factors include high text parseability...",
  "breakdown_explanations": {
    "parsing": "Text extraction is clean and machine-readable.",
    "job_match": "Matched key requirements (Python, SQL), but 2 requirements were missing (AWS, Kubernetes)."
  },
  "normalized_resume": {
    "personal": {
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "phone": "+1 555-234-5678",
      "linkedin": "https://linkedin.com/in/alexmorgan"
    },
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": ["Python", "SQL", "FastAPI", "Git"],
    "sections_detected": ["summary", "experience", "education", "skills"]
  },
  "analysis_id": "674000111222333444555666",
  "algorithm_version": "ats_v1.0",
  "created_at": "2026-09-18T10:00:00.000Z"
}
```

---

## 2. Lightweight Compatibility Scoring Endpoint

### `POST /api/ats/score`
Calculates quick normalized match score for automated applicant evaluation.

#### Request:
```json
{
  "jobId": "673abc1234567890abcdef12",
  "resumeUrl": "https://res.cloudinary.com/forework/raw/upload/resume.pdf"
}
```

#### Successful Response (`200 OK`):
```json
{
  "success": true,
  "score": 0.82,
  "scorePercentage": 82,
  "details": {
    "skillsMatch": "0.80",
    "experienceMatch": "0.85",
    "educationMatch": "0.80",
    "parsingScore": "0.88"
  },
  "matchedSkills": ["Python", "SQL", "FastAPI"],
  "missingSkills": ["AWS", "Kubernetes"]
}
```

---

## 3. Analysis History & Retrieval

### `GET /api/ats/history`
Returns up to 20 recent ATS analysis records for the authenticated user.

### `GET /api/ats/analysis/:id`
Retrieves a specific `ATSAnalysis` record by its MongoDB ObjectId.

### `GET /api/ats/application/:appId`
Recruiter and candidate endpoint: fetches or computes real-time ATS match for an active job application.

---

## Error Handling & Status Codes

| Status Code | Reason | Example Response |
| :---: | :--- | :--- |
| `400 Bad Request` | Empty file, corrupted document, or missing resume input | `{"success": false, "message": "The uploaded resume file is empty (0 bytes)"}` |
| `401 Unauthorized` | Missing or invalid JWT session cookie | `{"success": false, "message": "User not authenticated"}` |
| `404 Not Found` | Analysis or Job ID does not exist | `{"success": false, "message": "ATS analysis not found"}` |
| `500 Internal Error` | Server error (stack traces hidden from user) | `{"success": false, "message": "Internal server error"}` |
