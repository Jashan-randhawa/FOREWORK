# Core Job Portal & Structured Search

## 1. Overview
Phase 2 establishes high-performance, structured job searching, numeric salary data models, pagination across jobs and candidate views, and company population on job details.

## 2. Structured Filtering Query Parameters

The endpoint `GET /api/job/get` and versioned alias `GET /api/v1/job/get` accept the following query parameters:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `keyword` | String | Substring regex matching across job `title`, `description`, and `requirements` (case-insensitive) |
| `location` | String | Substring regex matching against job `location` |
| `jobType` | String | Substring regex matching against `jobType` (e.g. Remote, Full-time) |
| `experienceMin` | Number | Lower bound filter on `experienceLevel` (`$gte`) |
| `experienceMax` | Number | Upper bound filter on `experienceLevel` (`$lte`) |
| `salaryMin` | Number | Lower bound filter on `salary` in LPA (`$gte`) |
| `salaryMax` | Number | Upper bound filter on `salary` in LPA (`$lte`) |
| `page` | Number | Current pagination page (1-indexed, default: 1) |
| `limit` | Number | Number of results per page (default: 10, max: 50) |
| `sort` | String | Sorting criteria: `latest` (default), `oldest`, `salary_desc`, `salary_asc`, `experience_asc` |

## 3. Response Envelope

All job queries return a standardized envelope conforming to `API-001`:

```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "data": {
    "jobs": [
      {
        "_id": "67d5...",
        "title": "React Frontend Developer",
        "description": "...",
        "requirements": ["React", "Tailwind"],
        "salary": 14,
        "experienceLevel": 2,
        "location": "Bengaluru",
        "jobType": "Full-time",
        "position": 2,
        "company": {
          "_id": "67d4...",
          "name": "Acme Corp",
          "location": "Bengaluru",
          "website": "https://acme.example.com",
          "logo": "https://res.cloudinary.com/..."
        },
        "createdAt": "2026-09-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

## 4. Frontend State & Components
- **Redux Slice (`jobSlice.js`)**:
  - `filters`: Stores active selections for `location`, `technology`, `experienceMin`, `experienceMax`, `salaryMin`, `salaryMax`, and `jobType`.
  - `pagination`: Stores `page`, `limit`, `total`, `totalPages`, and `hasMore`.
- **Filter Card (`Filtercard.jsx`)**: Independent selection controls for location, technology, experience brackets, and salary ranges, with a quick "Clear all" button.
- **Jobs & Browse Views (`Jobs.jsx`, `Browse.jsx`)**: Responsive job grids paired with Previous / Next pagination controls and graceful empty-state handling.
