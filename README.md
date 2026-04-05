---

## Getting Started Locally

### Prerequisites

- Node.js and npm
- MongoDB Atlas account
- Cloudinary account

### Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` folder:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobport
JWT_SECRET=your_jwt_secret
PORT=5011
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```
```bash
npm start
```

### Frontend Setup
```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend/` folder:
```env
VITE_API_URL=http://localhost:5011
```
```bash
npm run dev
```

---

## 🌍 Environment Variables for Deployment

### Backend (Render)

| Key | Description |
| --- | --- |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT tokens |
| PORT | Server port 5011 |
| CLOUD_NAME | Cloudinary cloud name |
| CLOUD_API | Cloudinary API key |
| API_SECRET | Cloudinary API secret |
| FRONTEND_URL | https://forework.vercel.app |

### Frontend (Vercel)

| Key | Description |
| --- | --- |
| VITE_API_URL | https://forework.onrender.com |

---

## 📬 API Endpoints

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/user/register | Register new user |
| POST | /api/user/login | Login user |
| GET | /api/user/logout | Logout user |

### Jobs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/job/get | Get all jobs (public) |
| GET | /api/job/get/:id | Get job by ID (public) |
| POST | /api/job/post | Post a job (recruiter) |
| GET | /api/job/getadminjobs | Get recruiter jobs |

### Companies

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/company/register | Register company |
| GET | /api/company/get | Get all companies |
| PUT | /api/company/update/:id | Update company |

### Applications

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/application/apply/:id | Apply for job |
| GET | /api/application/get | Get applied jobs |
| GET | /api/application/:id/applicants | Get applicants |

---

## 🔐 Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Job Seeker | jashan@gmail.com | password123 |
| Recruiter | ankit@company.com | password123 |

---

## ⚠️ Known Issues

- Free tier on Render spins down after 15 mins of inactivity. First request may take 30 seconds to wake up.
- Cookie-based auth may have limitations on some browsers cross-origin.

---

## 🤝 Contributing

Pull requests are welcome. For major changes please open an issue first.

---

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ by [Jashan Randhawa](https://github.com/Jashan-randhawa)
