import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";

dotenv.config({});
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// FRONTEND_URL must be set in Render's Environment tab, exactly matching
// the deployed frontend origin (no trailing slash), e.g.:
//   FRONTEND_URL=https://forework.vercel.app
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // allow non-browser requests (curl, Postman, server-to-server) with no Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`Blocked by CORS: ${origin} not in`, allowedOrigins);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 5001;

 
//api's

app.use("/api/user", userRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
