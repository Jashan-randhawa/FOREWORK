# 💼 Job Portal — MERN Stack

A full-stack job portal web application built with the **MERN** stack (MongoDB, Express.js, React, Node.js). 
The platform connects **job seekers**, **job providers (employers)**, and **admins** in one unified system.

## ✨ Features

### 👤 Job Seekers
- Browse and search for job listings
- Apply for jobs with resume upload
- Track applied jobs and application status

### 🏢 Job Providers (Employers)
- Post and manage job listings
- Review applicants and their resumes
- Shortlist and manage candidates
- View reports and analytics

### 🛠️ Admin
- Manage all users (job seekers & providers)
- Oversee all job listings
- Platform-wide dashboard and reports

## 🧰 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 17, React Router, Redux, Tailwind CSS, Bootstrap |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT (JSON Web Tokens), bcryptjs         |
| Forms      | Formik + Yup validation                 |
| File Upload| Multer (resume PDF uploads)             |
| UI Extras  | AG Grid, React Toastify, React Slick    |

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)

### Installation
```bash
# Clone the repo
git clone https://github.com/your-username/job-portal.git

# Install frontend dependencies
cd job-frontend
npm install -f

# Install backend dependencies
cd ../job-backend
npm install -f
```

### Running the App
```bash
# Start the frontend (from job-frontend/)
npm start

# Start the backend (from job-backend/)
npm start
```

Create a `.env` file in `Backend/` based on `.env.example` with your settings for local development:

```
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<your JWT secret>
PORT=5001
CLOUD_NAME=<cloudinary cloud name>
CLOUD_API=<cloudinary api key>
API_SECRET=<cloudinary api secret>
FRONTEND_URL=<your frontend URL>
```

> **Deploying to Render:** Do **not** rely on a `.env` file in production. Set all environment variables directly in the Render dashboard under **Environment → Environment Variables**. The `MONGO_URI` must point to a remote MongoDB instance (e.g., [MongoDB Atlas](https://www.mongodb.com/atlas)) — `localhost` will not work inside a cloud container.

## 📁 Project Structure
```
job-portal-project/
├── job-frontend/       # React frontend
│   ├── src/
│   │   ├── pages/      # Page components (Admin, Provider, Seeker)
│   │   ├── JobSeeker/  # Job seeker components
│   │   ├── Job Provider/ # Employer components
│   │   └── login/      # Auth components & Redux
└── job-backend/        # Express REST API
    ├── controllers/    # Route logic (admin, auth, provider, user)
    ├── models/         # Mongoose schemas
    ├── routes/         # API routes
    └── middleware/     # Auth & authorization middleware
```
