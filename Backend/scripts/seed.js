import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

dotenv.config();

const seedAll = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is missing from environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for database seeding");

    // 1. Seed Admin
    let admin = await User.findOne({ email: "admin@forework.com" });
    if (!admin) {
      admin = await User.create({
        fullname: "System Administrator",
        email: "admin@forework.com",
        phoneNumber: "9999999999",
        password: await bcrypt.hash("Admin@Forework2026", 10),
        pancard: "ADMIN0000A",
        adharcard: "000011112222",
        role: "Admin",
        isEmailVerified: true,
      });
      console.log("Seeded Admin: admin@forework.com");
    }

    // 2. Seed Recruiter
    let recruiter = await User.findOne({ email: "recruiter@forework.com" });
    if (!recruiter) {
      recruiter = await User.create({
        fullname: "Jane Recruiter",
        email: "recruiter@forework.com",
        phoneNumber: "9888888888",
        password: await bcrypt.hash("Recruiter@123", 10),
        pancard: "RECRU0000B",
        adharcard: "111100002222",
        role: "Recruiter",
        isEmailVerified: true,
      });
      console.log("Seeded Recruiter: recruiter@forework.com");
    }

    // 3. Seed Company
    let company = await Company.findOne({ name: "Forework Technologies" });
    if (!company) {
      company = await Company.create({
        name: "Forework Technologies",
        description: "Leading hiring & recruitment engineering platform.",
        website: "https://forework.vercel.app",
        location: "Bangalore, India",
        userId: recruiter._id,
        isVerified: true,
      });
      console.log("Seeded Company: Forework Technologies");
    }

    // 4. Seed Student / Candidate
    let student = await User.findOne({ email: "candidate@forework.com" });
    if (!student) {
      student = await User.create({
        fullname: "Alex Candidate",
        email: "candidate@forework.com",
        phoneNumber: "9777777777",
        password: await bcrypt.hash("Candidate@123", 10),
        pancard: "CANDI0000C",
        adharcard: "222211110000",
        role: "Student",
        isEmailVerified: true,
        profile: {
          skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript"],
        },
      });
      console.log("Seeded Candidate: candidate@forework.com");
    }

    // 5. Seed Sample Jobs
    let jobCount = await Job.countDocuments({ created_by: recruiter._id });
    if (jobCount === 0) {
      const job1 = await Job.create({
        title: "Senior Full Stack Engineer",
        description: "Build robust, scalable MERN architectures with clean separation of concerns.",
        requirements: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
        salary: 150000,
        experienceLevel: 4,
        location: "Bangalore",
        jobType: "Full-time",
        position: 3,
        company: company._id,
        created_by: recruiter._id,
        status: "published",
      });

      const job2 = await Job.create({
        title: "Frontend Architect",
        description: "Lead UI development with high accessibility, performance, and responsive design.",
        requirements: ["React", "Vite", "Redux Toolkit", "Tailwind"],
        salary: 135000,
        experienceLevel: 5,
        location: "Remote",
        jobType: "Full-time",
        position: 2,
        company: company._id,
        created_by: recruiter._id,
        status: "published",
      });

      // Sample application
      const application = await Application.create({
        job: job1._id,
        applicant: student._id,
        status: "pending",
      });
      job1.applications.push(application._id);
      await job1.save();

      console.log("Seeded Jobs and Application");
    }

    console.log("Seeding process completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedAll();
