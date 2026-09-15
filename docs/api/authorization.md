# API Authorization & Endpoint Matrix

## Overview
All protected resources require an authenticated session via an HTTP-only JWT cookie (`token`). Role and ownership rules are enforced by backend middleware.

## Endpoint Permission Matrix

| Endpoint | Method | Authentication | Required Role | Ownership / Relationship Rule | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/user/register` | `POST` | Public | None | None | 400 (Validation / Duplicate), 429 |
| `/api/user/login` | `POST` | Public | None | Role match verification | 400, 403, 404, 429 |
| `/api/user/logout` | `POST` | Public | None | None | 200 |
| `/api/user/profile/update` | `POST` | Required | Any | Self (`req.id === user._id`) | 401, 404, 500 |
| `/api/company/register` | `POST` | Required | `Recruiter` | Created company owned by `req.id` | 400, 401, 403, 409 |
| `/api/company/get` | `GET` | Required | `Recruiter` | Scoped to recruiter's own companies | 401, 403 |
| `/api/company/get/:id` | `GET` | Required | `Recruiter` | Must own company (`userId === req.id`) | 400, 401, 403, 404 |
| `/api/company/update/:id` | `PUT` | Required | `Recruiter` | Must own company (`userId === req.id`) | 400, 401, 403, 404 |
| `/api/job/post` | `POST` | Required | `Recruiter` | Must own `companyId` referenced in body | 400, 401, 403, 404 |
| `/api/job/get` | `GET` | Public | None | Public listing | 200, 500 |
| `/api/job/getadminjobs` | `GET` | Required | `Recruiter` | Scoped to jobs created by `req.id` | 401, 403 |
| `/api/job/get/:id` | `GET` | Public | None | Public details | 200, 404 |
| `/api/application/apply/:id` | `POST` | Required | `Student` | Cannot be applicant's own job; no duplicate | 400, 401, 403, 404, 429 |
| `/api/application/get` | `GET` | Required | `Student` | Scoped to applications by `req.id` | 401, 403 |
| `/api/application/:id/applicants` | `GET` | Required | `Recruiter` | Must own job (`job.created_by === req.id`) | 400, 401, 403, 404 |
| `/api/application/status/:id/update` | `POST` | Required | `Recruiter` | Must own job of application | 400, 401, 403, 404 |
