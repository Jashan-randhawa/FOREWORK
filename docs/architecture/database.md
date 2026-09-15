# Database Architecture & Indexing Strategy

## 1. Overview
FOREWORK utilizes MongoDB via Mongoose. In Phase 2, schema types were strictly typed (converting `salary` from String to Number) and indexes were applied to guarantee query performance at scale.

## 2. Collections & Schema

### Job Collection
- `title`: String (required, indexed via text search)
- `description`: String (required, indexed via text search)
- `requirements`: [String]
- `salary`: Number (required, indexed, min: 0) — *Changed from String in Phase 2*
- `experienceLevel`: Number (required, indexed, min: 0)
- `location`: String (required, indexed)
- `jobType`: String (required, indexed)
- `position`: Number (required, min: 1)
- `company`: ObjectId (ref: `Company`, required, indexed)
- `created_by`: ObjectId (ref: `User`, required, indexed)
- `applications`: [ObjectId (ref: `Application`)]
- `timestamps`: true

### Application Collection
- `job`: ObjectId (ref: `Job`, required)
- `applicant`: ObjectId (ref: `User`, required)
- `status`: String (enum: `['pending', 'accepted', 'rejected']`, default: `'pending'`)
- `timestamps`: true

## 3. Database Indexes

### Performance & Text Indexes (`Job`)
1. **Full-Text Index**:
   `{ title: "text", description: "text" }`
   Enables high-performance text relevance searches over listing titles and job responsibilities.
2. **Compound Recruiter & Company Indexes**:
   `{ company: 1, createdAt: -1 }`
   `{ created_by: 1, createdAt: -1 }`
   Optimizes recruiter dashboard listing queries and company-specific job queries.
3. **Sorting & Filtering Indexes**:
   `{ createdAt: -1 }`, `{ salary: 1 }`, `{ experienceLevel: 1 }`, `{ location: 1 }`, `{ jobType: 1 }`
   Eliminates in-memory sorting bottlenecks during paginated queries.

### Integrity Indexes (`Application`)
1. **Compound Unique Index**:
   `{ job: 1, applicant: 1 }` (unique: true)
   Prevents race-condition duplicate applications at the database engine layer.

## 4. Migration Procedures

### `scripts/migrate-job-salary.js`
- Reads all documents in the `jobs` collection.
- Parses string representations (e.g. `"12 LPA"`, `"100000"`) into positive numbers.
- Flags unparseable entries for manual administrative review rather than silently dropping or defaulting.
