# FOREWORK - Job Portal

A full-stack job portal web application built with the MERN stack.
The platform connects job seekers, recruiters, and admins in one unified system.

Live Demo: https://forework.vercel.app

Backend API: https://forework.onrender.com

---

## Features

### Job Seekers
- Browse and search for job listings
- Register and login securely
- Apply for jobs with resume upload
- Track applied jobs and application status

### Recruiters
- Post and manage job listings
- Create and manage company profile
- Review applicants and their resumes
- Shortlist and manage candidates

---

## Tech Stack

- Frontend: React, Vite, Redux, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Auth: JWT, bcryptjs
- File Upload: Multer and Cloudinary
- Deployment: Vercel (Frontend), Render (Backend)

---

## Project Structure

```
FOREWORK/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
└── Backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── utils/
```

---

## Getting Started Locally

### Prerequisites
- Node.js and npm
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

```
cd Backend
npm install
```

Create a .env file in the Backend folder:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobport
JWT_SECRET=your_jwt_secret
PORT=5011
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

```
npm start
```

### Frontend Setup

```
cd Frontend
npm install
```

Create a .env file in the Frontend folder:

```
VITE_API_URL=http://localhost:5011
```

```
npm run dev
```

---

## Environment Variables for Deployment

### Backend on Render

```
MONGO_URI        MongoDB Atlas connection string
JWT_SECRET       Secret key for JWT tokens
PORT             5011
CLOUD_NAME       Cloudinary cloud name
CLOUD_API        Cloudinary API key
API_SECRET       Cloudinary API secret
FRONTEND_URL     https://forework.vercel.app
```

### Frontend on Vercel

```
VITE_API_URL     https://forework.onrender.com
```

---

## API Endpoints

### Auth
- POST /api/user/register - Register new user
- POST /api/user/login - Login user
- GET /api/user/logout - Logout user

### Jobs
- GET /api/job/get - Get all jobs (public)
- GET /api/job/get/:id - Get job by ID (public)
- POST /api/job/post - Post a job (recruiter)
- GET /api/job/getadminjobs - Get recruiter jobs

### Companies
- POST /api/company/register - Register company
- GET /api/company/get - Get all companies
- PUT /api/company/update/:id - Update company

### Applications
- POST /api/application/apply/:id - Apply for job
- GET /api/application/get - Get applied jobs
- GET /api/application/:id/applicants - Get applicants

---

## Demo Credentials

Job Seeker
- Email: jashan@gmail.com
- Password: password123

Recruiter
- Email: ankit@company.com
- Password: password123

---

## Known Issues

- Free tier on Render spins down after 15 mins of inactivity. First request may take 30 seconds to wake up.
- Cookie based auth may have limitations on some browsers cross origin.

---

## Contributing

Pull requests are welcome. For major changes please open an issue first.

---

## License

This project is open source and available under the MIT License.

---

Built with love by Jashan Randhawa
https://github.com/Jashan-randhawa
