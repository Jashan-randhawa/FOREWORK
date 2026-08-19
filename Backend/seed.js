/**
 * Seed script — populates the database with realistic dummy data:
 * 5 recruiters, 10 students, 5 companies, 14 jobs, and a batch of applications.
 *
 * WARNING - DESTRUCTIVE: this clears the User, Company, Job, and Application
 * collections before inserting fresh data. Don't run this against a database
 * that has real accounts you want to keep.
 *
 * Usage (from the Backend folder, with MONGO_URI set in your .env):
 *   node seed.js
 *   // or: npm run seed
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import { Application } from "./models/application.model.js";

dotenv.config({});

const DEFAULT_PASSWORD = "Password@123";

// ---------- small helpers ----------
const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256`;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

// Well-formed-looking but fake PAN / Aadhaar / phone, unique per index
// (the schema marks all three required + unique, so they must not collide)
const fakePan = (i) => `ABCPD${String(1000 + i).slice(-4)}${String.fromCharCode(65 + (i % 26))}`;
const fakeAadhar = (i) => String(100000000000 + i);
const fakePhone = (i) => `9${String(100000000 + i).padStart(9, "0")}`;

// ---------- source data ----------
const companiesData = [
  {
    name: "NimbusStack Technologies",
    description: "Cloud infrastructure and DevOps tooling for growing startups.",
    website: "https://nimbustack.example.com",
    location: "Bangalore",
  },
  {
    name: "PixelForge Innovations",
    description: "Product design and full-stack development studio building consumer apps.",
    website: "https://pixelforge.example.com",
    location: "Pune",
  },
  {
    name: "DataWave Analytics",
    description: "Data science and machine learning consultancy for enterprise clients.",
    website: "https://datawave.example.com",
    location: "Hyderabad",
  },
  {
    name: "CodeCrafters Solutions",
    description: "Enterprise software and systems integration services.",
    website: "https://codecrafters.example.com",
    location: "Delhi",
  },
  {
    name: "Zenith Softworks",
    description: "Fintech products for digital payments and personal banking.",
    website: "https://zenithsoftworks.example.com",
    location: "Mumbai",
  },
];

const recruitersData = [
  { fullname: "Ananya Sharma", email: "ananya.sharma@nimbustack.example.com" },
  { fullname: "Rohan Mehta", email: "rohan.mehta@pixelforge.example.com" },
  { fullname: "Kavya Reddy", email: "kavya.reddy@datawave.example.com" },
  { fullname: "Arjun Malhotra", email: "arjun.malhotra@codecrafters.example.com" },
  { fullname: "Simran Kaur", email: "simran.kaur@zenithsoftworks.example.com" },
];

const studentsData = [
  { fullname: "Aditya Verma", email: "aditya.verma@example.com", bio: "Frontend developer who loves clean UI and fast interfaces.", skills: ["React", "JavaScript", "Tailwind CSS", "HTML", "CSS"] },
  { fullname: "Priya Nair", email: "priya.nair@example.com", bio: "Aspiring data analyst with a knack for turning numbers into stories.", skills: ["Python", "Pandas", "NumPy", "Data Analysis", "SQL"] },
  { fullname: "Karan Singh", email: "karan.singh@example.com", bio: "Backend-focused developer, comfortable building REST APIs end to end.", skills: ["Node.js", "Express", "MongoDB", "REST APIs"] },
  { fullname: "Neha Gupta", email: "neha.gupta@example.com", bio: "Java developer with a strong grip on Spring Boot and relational databases.", skills: ["Java", "Spring Boot", "MySQL", "Hibernate"] },
  { fullname: "Vikram Rao", email: "vikram.rao@example.com", bio: "Mobile developer building cross-platform apps with React Native.", skills: ["React Native", "JavaScript", "Mobile Development", "Firebase"] },
  { fullname: "Ishita Bansal", email: "ishita.bansal@example.com", bio: "Full-stack developer working across the MERN stack and TypeScript.", skills: ["MongoDB", "Express", "React", "Node.js", "TypeScript"] },
  { fullname: "Rahul Chawla", email: "rahul.chawla@example.com", bio: "Python developer with a focus on backend services and automation.", skills: ["Python", "Django", "REST APIs", "PostgreSQL"] },
  { fullname: "Sneha Iyer", email: "sneha.iyer@example.com", bio: "Product-minded UI/UX designer who also codes her own prototypes.", skills: ["Figma", "UI/UX", "HTML", "CSS", "Design Systems"] },
  { fullname: "Aman Kapoor", email: "aman.kapoor@example.com", bio: "DevOps enthusiast focused on CI/CD and cloud infrastructure.", skills: ["Docker", "AWS", "CI/CD", "Linux"] },
  { fullname: "Divya Menon", email: "divya.menon@example.com", bio: "Android developer exploring Kotlin and modern app architecture.", skills: ["Java", "Kotlin", "Android", "Mobile Development"] },
];

// companyIndex maps each job back to companiesData / recruitersData (0-4)
const jobsData = [
  // NimbusStack Technologies — Bangalore
  {
    companyIndex: 0,
    title: "MERN Stack Developer",
    description:
      "NimbusStack Technologies is hiring a MERN Stack Developer for our Bangalore office. You'll build and ship features across MongoDB, Express, React and Node.js for our internal DevOps dashboard used by hundreds of engineering teams.",
    requirements: ["React", "Node.js", "MongoDB", "Express", "REST APIs", "Git"],
    salary: "₹8,00,000 - ₹14,00,000 per annum",
    experienceLevel: 2,
    location: "Bangalore",
    jobType: "Full-time",
    position: 3,
  },
  {
    companyIndex: 0,
    title: "DevOps Engineer",
    description:
      "Join our Bangalore infrastructure team to design and maintain CI/CD pipelines, container orchestration, and cloud infrastructure on AWS, working closely with backend engineers to keep deployments fast and reliable.",
    requirements: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
    salary: "₹10,00,000 - ₹18,00,000 per annum",
    experienceLevel: 3,
    location: "Bangalore",
    jobType: "Full-time",
    position: 2,
  },
  // PixelForge Innovations — Pune
  {
    companyIndex: 1,
    title: "Frontend Developer - React",
    description:
      "PixelForge Innovations in Pune is looking for a Frontend Developer to craft polished, accessible interfaces in React and Tailwind CSS for our consumer-facing products.",
    requirements: ["React", "JavaScript", "Tailwind CSS", "Responsive Design"],
    salary: "₹6,00,000 - ₹10,00,000 per annum",
    experienceLevel: 1,
    location: "Pune",
    jobType: "Full-time",
    position: 2,
  },
  {
    companyIndex: 1,
    title: "UI/UX Designer",
    description:
      "We're looking for a UI/UX Designer to join our Pune studio and own the design process end to end - research, wireframes, prototypes, and a growing design system used across the product line.",
    requirements: ["Figma", "Wireframing", "Prototyping", "Design Systems"],
    salary: "₹5,00,000 - ₹9,00,000 per annum",
    experienceLevel: 1,
    location: "Pune",
    jobType: "Full-time",
    position: 1,
  },
  {
    companyIndex: 1,
    title: "Full Stack Engineer (Fullstack)",
    description:
      "A Fullstack role based in Pune, working across React on the frontend and Node.js/Express on the backend to ship new product features end to end, from database schema to UI.",
    requirements: ["React", "Node.js", "Express", "MongoDB", "Fullstack"],
    salary: "₹9,00,000 - ₹15,00,000 per annum",
    experienceLevel: 2,
    location: "Pune",
    jobType: "Full-time",
    position: 2,
  },
  // DataWave Analytics — Hyderabad
  {
    companyIndex: 2,
    title: "Data Scientist",
    description:
      "DataWave Analytics is hiring a Data Scientist for our Hyderabad team to build predictive models and analytics pipelines for enterprise clients across retail and finance.",
    requirements: ["Python", "Machine Learning", "Pandas", "SQL", "Statistics"],
    salary: "₹12,00,000 - ₹20,00,000 per annum",
    experienceLevel: 3,
    location: "Hyderabad",
    jobType: "Full-time",
    position: 2,
  },
  {
    companyIndex: 2,
    title: "Python Backend Developer",
    description:
      "Backend role in Hyderabad building the data ingestion and API layer that powers our analytics dashboards, using Python and Django on top of a PostgreSQL data warehouse.",
    requirements: ["Python", "Django", "PostgreSQL", "REST APIs"],
    salary: "₹7,00,000 - ₹12,00,000 per annum",
    experienceLevel: 2,
    location: "Hyderabad",
    jobType: "Full-time",
    position: 2,
  },
  {
    companyIndex: 2,
    title: "Machine Learning Intern",
    description:
      "A hands-on internship in our Hyderabad office for someone learning the fundamentals of machine learning - you'll assist with data cleaning, model experiments, and evaluation under senior data scientists.",
    requirements: ["Python", "Machine Learning", "Pandas", "NumPy"],
    salary: "₹25,000 per month",
    experienceLevel: 0,
    location: "Hyderabad",
    jobType: "Internship",
    position: 3,
  },
  // CodeCrafters Solutions — Delhi
  {
    companyIndex: 3,
    title: "Java Developer",
    description:
      "CodeCrafters Solutions in Delhi is hiring a Java Developer to build backend services for enterprise clients using Java, Spring Boot, and MySQL.",
    requirements: ["Java", "Spring Boot", "MySQL", "Hibernate"],
    salary: "₹7,00,000 - ₹13,00,000 per annum",
    experienceLevel: 2,
    location: "Delhi",
    jobType: "Full-time",
    position: 3,
  },
  {
    companyIndex: 3,
    title: "Node.js Backend Engineer",
    description:
      "We need a backend engineer in Delhi to design and maintain REST APIs in Node.js and Express that power several of our client integration projects.",
    requirements: ["Node.js", "Express", "MongoDB", "REST APIs"],
    salary: "₹8,00,000 - ₹14,00,000 per annum",
    experienceLevel: 2,
    location: "Delhi",
    jobType: "Full-time",
    position: 2,
  },
  {
    companyIndex: 3,
    title: "Desktop Application Developer",
    description:
      "A contract role based in Delhi building a cross-platform desktop application in Java for one of our enterprise clients' internal tooling.",
    requirements: ["Java", "Desktop Applications", "Swing/JavaFX"],
    salary: "₹6,00,000 - ₹10,00,000 per annum",
    experienceLevel: 2,
    location: "Delhi",
    jobType: "Contract",
    position: 1,
  },
  // Zenith Softworks — Mumbai / Remote / Chennai
  {
    companyIndex: 4,
    title: "Mobile App Developer (React Native)",
    description:
      "A fully remote mobile role building our React Native app used by over a million customers for everyday digital payments.",
    requirements: ["React Native", "JavaScript", "Mobile Development", "Firebase"],
    salary: "₹9,00,000 - ₹16,00,000 per annum",
    experienceLevel: 2,
    location: "Remote",
    jobType: "Full-time",
    position: 2,
  },
  {
    companyIndex: 4,
    title: "Android Developer",
    description:
      "Join our Mumbai team building native Android features in Java and Kotlin for our core banking app.",
    requirements: ["Java", "Kotlin", "Android", "Mobile Development"],
    salary: "₹8,00,000 - ₹14,00,000 per annum",
    experienceLevel: 2,
    location: "Mumbai",
    jobType: "Full-time",
    position: 2,
  },
  {
    companyIndex: 4,
    title: "QA / Automation Engineer",
    description:
      "A Chennai-based QA role focused on backend test automation for our payments API, working closely with the backend engineering team.",
    requirements: ["Test Automation", "API Testing", "Backend", "Postman"],
    salary: "₹6,00,000 - ₹10,00,000 per annum",
    experienceLevel: 1,
    location: "Chennai",
    jobType: "Full-time",
    position: 1,
  },
];

// ---------- main ----------
async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Add it to Backend/.env before running this script.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding...");

  console.log("Clearing existing Users, Companies, Jobs, Applications...");
  await Promise.all([
    Application.deleteMany({}),
    Job.deleteMany({}),
    Company.deleteMany({}),
    User.deleteMany({}),
  ]);

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Recruiters
  const recruiters = [];
  for (let i = 0; i < recruitersData.length; i++) {
    const r = recruitersData[i];
    const user = await User.create({
      fullname: r.fullname,
      email: r.email,
      phoneNumber: fakePhone(i),
      password: hashedPassword,
      pancard: fakePan(i),
      adharcard: fakeAadhar(i),
      role: "Recruiter",
      profile: {
        bio: `Talent acquisition lead at ${companiesData[i].name}.`,
        profilePhoto: avatarUrl(r.fullname),
      },
    });
    recruiters.push(user);
  }
  console.log(`Created ${recruiters.length} recruiters.`);

  // Companies (one per recruiter, same order)
  const companies = [];
  for (let i = 0; i < companiesData.length; i++) {
    const c = companiesData[i];
    const company = await Company.create({
      ...c,
      logo: avatarUrl(c.name),
      userId: recruiters[i]._id,
    });
    companies.push(company);
  }
  console.log(`Created ${companies.length} companies.`);

  // Students
  const students = [];
  const offset = recruitersData.length;
  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    const user = await User.create({
      fullname: s.fullname,
      email: s.email,
      phoneNumber: fakePhone(offset + i),
      password: hashedPassword,
      pancard: fakePan(offset + i),
      adharcard: fakeAadhar(offset + i),
      role: "Student",
      profile: {
        bio: s.bio,
        skills: s.skills,
        profilePhoto: avatarUrl(s.fullname),
      },
    });
    students.push(user);
  }
  console.log(`Created ${students.length} students.`);

  // Jobs
  const jobs = [];
  for (const jt of jobsData) {
    const job = await Job.create({
      title: jt.title,
      description: jt.description,
      requirements: jt.requirements,
      salary: jt.salary,
      experienceLevel: jt.experienceLevel,
      location: jt.location,
      jobType: jt.jobType,
      position: jt.position,
      company: companies[jt.companyIndex]._id,
      created_by: recruiters[jt.companyIndex]._id,
    });
    jobs.push(job);
  }
  console.log(`Created ${jobs.length} jobs.`);

  // Applications — each student applies to 2-4 random, distinct jobs
  const statuses = ["pending", "accepted", "rejected"];
  let applicationCount = 0;
  for (const student of students) {
    const jobsToApply = shuffle(jobs).slice(0, randomInt(2, 4));
    for (const job of jobsToApply) {
      const application = await Application.create({
        job: job._id,
        applicant: student._id,
        status: randomFrom(statuses),
      });
      job.applications.push(application._id);
      await job.save();
      applicationCount++;
    }
  }
  console.log(`Created ${applicationCount} applications.`);

  console.log("\nSeed complete.");
  console.log(`  Log in with any seeded email + password: ${DEFAULT_PASSWORD}`);
  console.log(`  Recruiter example: ${recruiters[0].email}`);
  console.log(`  Student example:   ${students[0].email}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
