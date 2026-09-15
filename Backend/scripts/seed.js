/**
 * Seed Script – FOREWORK
 * ─────────────────────
 * Populates the database with realistic dummy data:
 *   • 1 Admin
 *   • 3 Recruiters  (one per company)
 *   • 6 Students
 *   • 3 Companies
 *   • 12 Jobs       (4 per company, mix of types / locations)
 *   • 18 Applications (each student applies to 3 jobs)
 *
 * Usage:
 *   node scripts/seed.js              # reads MONGO_URI from .env
 *   MONGO_URI=mongodb://... node scripts/seed.js
 *
 * ⚠️  WARNING: clears Users, Companies, Jobs, and Applications before seeding.
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { encrypt, blindIndex } from "../utils/encryption.js";

// ─── helpers ──────────────────────────────────────────────────────────────────
const hash = (pwd) => bcrypt.hashSync(pwd, 10);
const log  = (msg) => console.log(`\x1b[36m[seed]\x1b[0m ${msg}`);
const ok   = (msg) => console.log(`\x1b[32m  ✔\x1b[0m ${msg}`);

// Build a raw user doc: encrypt PAN + Aadhaar manually so the pre-save hook
// doesn't double-encrypt when we use insertMany().
const buildUser = ({ _pan, _aadhaar, ...rest }) => ({
  pancard:      encrypt(_pan),
  pancardHash:  blindIndex(_pan),
  adharcard:    encrypt(_aadhaar),
  adharcardHash: blindIndex(_aadhaar),
  isEmailVerified: true,
  ...rest,
});

// ─── connect ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/forework";
await mongoose.connect(MONGO_URI);
log(`Connected → ${MONGO_URI}`);

// ─── clear ────────────────────────────────────────────────────────────────────
log("Clearing collections …");
await Application.deleteMany({});
await Job.deleteMany({});
await Company.deleteMany({});
await User.deleteMany({});
ok("Collections cleared");

// ─── admin ────────────────────────────────────────────────────────────────────
log("Creating admin …");
const [admin] = await User.insertMany([
  buildUser({
    fullname: "Super Admin",
    email:    "admin@forework.dev",
    phoneNumber: "9000000000",
    password: hash("Admin@1234"),
    role: "Admin",
    _pan:    "ADMPA0001A",
    _aadhaar:"900000000001",
    profile: { bio: "Platform administrator" },
  }),
]);
ok(`Admin: ${admin.email}  /  password: Admin@1234`);

// ─── recruiters ───────────────────────────────────────────────────────────────
log("Creating recruiters …");
const recruiters = await User.insertMany([
  buildUser({
    fullname: "Priya Sharma",
    email:    "priya.sharma@techcorp.in",
    phoneNumber: "9111111101",
    password: hash("Recruiter@1"),
    role: "Recruiter",
    _pan:    "RECPA0001A",
    _aadhaar:"111100000001",
    profile: { bio: "Talent acquisition @ TechCorp" },
  }),
  buildUser({
    fullname: "Rahul Verma",
    email:    "rahul.verma@infinitesolutions.in",
    phoneNumber: "9111111102",
    password: hash("Recruiter@2"),
    role: "Recruiter",
    _pan:    "RECPA0002B",
    _aadhaar:"111100000002",
    profile: { bio: "HR Lead @ Infinite Solutions" },
  }),
  buildUser({
    fullname: "Sneha Patel",
    email:    "sneha.patel@growthstartup.in",
    phoneNumber: "9111111103",
    password: hash("Recruiter@3"),
    role: "Recruiter",
    _pan:    "RECPA0003C",
    _aadhaar:"111100000003",
    profile: { bio: "People ops @ GrowthStartup" },
  }),
]);
recruiters.forEach((r, i) => ok(`Recruiter ${i + 1}: ${r.email}  /  password: Recruiter@${i + 1}`));

// ─── students ─────────────────────────────────────────────────────────────────
log("Creating students …");
const students = await User.insertMany([
  buildUser({
    fullname: "Aarav Mehta",
    email:    "aarav.mehta@student.dev",
    phoneNumber: "9222222201",
    password: hash("Student@1"),
    role: "Student",
    _pan:    "STUPA0001A",
    _aadhaar:"222200000001",
    profile: {
      bio: "Final-year CS student passionate about backend dev.",
      skills: ["Node.js", "MongoDB", "Express", "REST APIs"],
    },
  }),
  buildUser({
    fullname: "Diya Nair",
    email:    "diya.nair@student.dev",
    phoneNumber: "9222222202",
    password: hash("Student@2"),
    role: "Student",
    _pan:    "STUPA0002B",
    _aadhaar:"222200000002",
    profile: {
      bio: "Frontend enthusiast who loves React and pixel-perfect UIs.",
      skills: ["React", "Tailwind CSS", "JavaScript", "Figma"],
    },
  }),
  buildUser({
    fullname: "Karan Singh",
    email:    "karan.singh@student.dev",
    phoneNumber: "9222222203",
    password: hash("Student@3"),
    role: "Student",
    _pan:    "STUPA0003C",
    _aadhaar:"222200000003",
    profile: {
      bio: "DevOps learner. Comfortable with Linux, Docker & CI/CD.",
      skills: ["Docker", "Linux", "CI/CD", "Python"],
    },
  }),
  buildUser({
    fullname: "Ananya Roy",
    email:    "ananya.roy@student.dev",
    phoneNumber: "9222222204",
    password: hash("Student@4"),
    role: "Student",
    _pan:    "STUPA0004D",
    _aadhaar:"222200000004",
    profile: {
      bio: "Data science graduate exploring ML pipelines.",
      skills: ["Python", "Pandas", "Scikit-learn", "SQL"],
    },
  }),
  buildUser({
    fullname: "Rohan Gupta",
    email:    "rohan.gupta@student.dev",
    phoneNumber: "9222222205",
    password: hash("Student@5"),
    role: "Student",
    _pan:    "STUPA0005E",
    _aadhaar:"222200000005",
    profile: {
      bio: "Mobile developer with Flutter & Android experience.",
      skills: ["Flutter", "Dart", "Android", "Firebase"],
    },
  }),
  buildUser({
    fullname: "Ishaan Kapoor",
    email:    "ishaan.kapoor@student.dev",
    phoneNumber: "9222222206",
    password: hash("Student@6"),
    role: "Student",
    _pan:    "STUPA0006F",
    _aadhaar:"222200000006",
    profile: {
      bio: "Full-stack learner building MERN projects.",
      skills: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    },
  }),
]);
students.forEach((s, i) => ok(`Student ${i + 1}: ${s.email}  /  password: Student@${i + 1}`));

// ─── companies ────────────────────────────────────────────────────────────────
log("Creating companies …");
const companies = await Company.insertMany([
  {
    name: "TechCorp India",
    description:
      "A leading product-based technology company building SaaS tools for the global market. Known for its engineering-first culture and open-source contributions.",
    website:  "https://techcorp.in",
    location: "Bengaluru, Karnataka",
    logo: "https://ui-avatars.com/api/?name=TechCorp&background=0D8ABC&color=fff&size=128",
    userId: recruiters[0]._id,
    isVerified: true,
  },
  {
    name: "Infinite Solutions",
    description:
      "An IT services and consulting firm with expertise in cloud migrations, enterprise integrations, and digital transformation projects.",
    website:  "https://infinitesolutions.in",
    location: "Hyderabad, Telangana",
    logo: "https://ui-avatars.com/api/?name=Infinite&background=8B5CF6&color=fff&size=128",
    userId: recruiters[1]._id,
    isVerified: true,
  },
  {
    name: "GrowthStartup",
    description:
      "An early-stage startup disrupting edtech with AI-powered personalised learning. Backed by top-tier VCs; fast-paced and remote-friendly.",
    website:  "https://growthstartup.in",
    location: "Pune, Maharashtra",
    logo: "https://ui-avatars.com/api/?name=Growth&background=10B981&color=fff&size=128",
    userId: recruiters[2]._id,
    isVerified: false,
  },
]);
companies.forEach((c) => ok(`Company: ${c.name}`));

// Link recruiters to their companies
await Promise.all(
  recruiters.map((r, i) =>
    User.findByIdAndUpdate(r._id, { "profile.company": companies[i]._id })
  )
);
ok("Recruiter ↔ Company links set");

// ─── jobs ─────────────────────────────────────────────────────────────────────
log("Creating jobs …");
const jobs = await Job.insertMany([
  // ── TechCorp India
  {
    title: "Senior Backend Engineer",
    description:
      "Design and maintain highly-scalable Node.js microservices. Own key APIs serving millions of requests per day and mentor junior engineers.",
    requirements: ["Node.js", "MongoDB", "REST APIs", "Docker", "AWS"],
    salary: 1800000,
    experienceLevel: 4,
    location: "Bengaluru, Karnataka",
    jobType: "Full-time",
    position: 2,
    company: companies[0]._id,
    created_by: recruiters[0]._id,
    status: "published",
    views: 342,
  },
  {
    title: "Frontend Engineer – React",
    description:
      "Build beautiful, accessible UIs using React and Tailwind CSS in close collaboration with designers and backend teams.",
    requirements: ["React", "TypeScript", "Tailwind CSS", "REST APIs", "Jest"],
    salary: 1400000,
    experienceLevel: 2,
    location: "Bengaluru, Karnataka",
    jobType: "Full-time",
    position: 3,
    company: companies[0]._id,
    created_by: recruiters[0]._id,
    status: "published",
    views: 215,
  },
  {
    title: "DevOps Engineer",
    description:
      "Own CI/CD pipelines, Kubernetes clusters, and AWS infrastructure. Drive reliability and cost-optimisation initiatives.",
    requirements: ["Kubernetes", "Docker", "AWS", "Terraform", "Linux"],
    salary: 1600000,
    experienceLevel: 3,
    location: "Remote",
    jobType: "Full-time",
    position: 1,
    company: companies[0]._id,
    created_by: recruiters[0]._id,
    status: "published",
    views: 178,
  },
  {
    title: "Backend Intern – Node.js",
    description:
      "6-month paid internship for final-year students. Work on real features under senior mentorship. Strong candidates receive a PPO.",
    requirements: ["Node.js", "JavaScript", "MongoDB", "Git"],
    salary: 25000,
    experienceLevel: 0,
    location: "Bengaluru, Karnataka",
    jobType: "Internship",
    position: 5,
    company: companies[0]._id,
    created_by: recruiters[0]._id,
    status: "published",
    views: 890,
  },

  // ── Infinite Solutions
  {
    title: "Cloud Solutions Architect",
    description:
      "Lead cloud migration projects for Fortune 500 clients. Architect AWS/Azure solutions and present roadmaps to CXO-level stakeholders.",
    requirements: ["AWS", "Azure", "Terraform", "Solution Design", "Python"],
    salary: 2500000,
    experienceLevel: 7,
    location: "Hyderabad, Telangana",
    jobType: "Full-time",
    position: 1,
    company: companies[1]._id,
    created_by: recruiters[1]._id,
    status: "published",
    views: 124,
  },
  {
    title: "Data Engineer",
    description:
      "Build and maintain large-scale data pipelines using Apache Spark and Databricks. Partner with data scientists to productionise ML models.",
    requirements: ["Python", "Spark", "SQL", "Databricks", "Airflow"],
    salary: 1700000,
    experienceLevel: 3,
    location: "Hyderabad, Telangana",
    jobType: "Full-time",
    position: 2,
    company: companies[1]._id,
    created_by: recruiters[1]._id,
    status: "published",
    views: 267,
  },
  {
    title: "Java Backend Developer",
    description:
      "Develop enterprise integrations and REST APIs using Spring Boot. Work with clients across BFSI and healthcare verticals.",
    requirements: ["Java", "Spring Boot", "Microservices", "SQL", "REST APIs"],
    salary: 1200000,
    experienceLevel: 2,
    location: "Hyderabad, Telangana",
    jobType: "Full-time",
    position: 4,
    company: companies[1]._id,
    created_by: recruiters[1]._id,
    status: "published",
    views: 198,
  },
  {
    title: "QA Automation Engineer",
    description:
      "Write and maintain automated test suites for web and mobile using Playwright and Appium.",
    requirements: ["Playwright", "JavaScript", "Appium", "CI/CD", "Selenium"],
    salary: 900000,
    experienceLevel: 2,
    location: "Remote",
    jobType: "Full-time",
    position: 2,
    company: companies[1]._id,
    created_by: recruiters[1]._id,
    status: "published",
    views: 143,
  },

  // ── GrowthStartup
  {
    title: "Full-Stack Engineer (MERN)",
    description:
      "Be an early engineer at a fast-growing edtech startup. Build features end-to-end and influence architecture decisions.",
    requirements: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
    salary: 1100000,
    experienceLevel: 2,
    location: "Pune, Maharashtra",
    jobType: "Full-time",
    position: 3,
    company: companies[2]._id,
    created_by: recruiters[2]._id,
    status: "published",
    views: 512,
  },
  {
    title: "Machine Learning Engineer",
    description:
      "Apply NLP and recommendation algorithms to personalise learning paths for 500 K+ learners using Python and FastAPI.",
    requirements: ["Python", "NLP", "Scikit-learn", "FastAPI", "SQL"],
    salary: 1500000,
    experienceLevel: 3,
    location: "Pune, Maharashtra",
    jobType: "Full-time",
    position: 2,
    company: companies[2]._id,
    created_by: recruiters[2]._id,
    status: "published",
    views: 389,
  },
  {
    title: "Mobile Developer – Flutter",
    description:
      "Build our cross-platform mobile app used by students across India. Work closely with design for smooth, native-feeling experiences.",
    requirements: ["Flutter", "Dart", "Firebase", "REST APIs", "Git"],
    salary: 1000000,
    experienceLevel: 1,
    location: "Remote",
    jobType: "Full-time",
    position: 2,
    company: companies[2]._id,
    created_by: recruiters[2]._id,
    status: "published",
    views: 441,
  },
  {
    title: "Product & Growth Intern",
    description:
      "3-month internship: run A/B experiments, analyse funnels, and collaborate with engineering and marketing to drive growth.",
    requirements: ["Excel / Sheets", "Analytics", "Communication", "SQL"],
    salary: 15000,
    experienceLevel: 0,
    location: "Pune, Maharashtra",
    jobType: "Internship",
    position: 2,
    company: companies[2]._id,
    created_by: recruiters[2]._id,
    status: "published",
    views: 730,
  },
]);
jobs.forEach((j) => ok(`Job: "${j.title}" @ ${j.location}`));

// ─── applications ─────────────────────────────────────────────────────────────
log("Creating applications …");

// [studentIdx, jobIdx, status]
const matrix = [
  [0, 0,  "pending"],
  [0, 4,  "accepted"],
  [0, 8,  "rejected"],
  [1, 1,  "pending"],
  [1, 5,  "pending"],
  [1, 9,  "accepted"],
  [2, 2,  "accepted"],
  [2, 6,  "pending"],
  [2, 10, "pending"],
  [3, 3,  "pending"],
  [3, 7,  "rejected"],
  [3, 11, "pending"],
  [4, 0,  "rejected"],
  [4, 8,  "pending"],
  [4, 2,  "accepted"],
  [5, 1,  "pending"],
  [5, 9,  "pending"],
  [5, 5,  "pending"],
];

const applications = await Application.insertMany(
  matrix.map(([sIdx, jIdx, status]) => ({
    job:       jobs[jIdx]._id,
    applicant: students[sIdx]._id,
    status,
  }))
);
ok(`${applications.length} applications created`);

// Push application IDs into their respective jobs
for (const app of applications) {
  await Job.findByIdAndUpdate(app.job, { $push: { applications: app._id } });
}
ok("Job.applications arrays updated");

// ─── summary ──────────────────────────────────────────────────────────────────
console.log("\n\x1b[32m───────── Seed complete ─────────────────────────────\x1b[0m");
console.log("  Role        Email                                Password");
console.log("  ──────────  ───────────────────────────────────  ───────────");
console.log(`  Admin       admin@forework.dev                   Admin@1234`);
recruiters.forEach((r, i) =>
  console.log(`  Recruiter   ${r.email.padEnd(36)} Recruiter@${i + 1}`)
);
students.forEach((s, i) =>
  console.log(`  Student     ${s.email.padEnd(36)} Student@${i + 1}`)
);
console.log("\n  Companies   : " + companies.length);
console.log("  Jobs        : " + jobs.length);
console.log("  Applications: " + applications.length);
console.log("\x1b[32m─────────────────────────────────────────────────────\x1b[0m\n");

await mongoose.disconnect();
