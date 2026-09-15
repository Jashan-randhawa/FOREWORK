import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "../models/job.model.js";

dotenv.config();

/**
 * Safely parse a salary value (string or number) into a valid positive number.
 * Handles inputs like "12", "12 LPA", "100000", " 15 ", etc.
 * Returns null if the value cannot be parsed reliably.
 */
export const parseSalary = (value) => {
  if (typeof value === "number") {
    return isNaN(value) || value < 0 ? null : value;
  }
  if (!value || typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  // Extract leading digits or decimals (e.g., "12 LPA" -> 12, "15.5" -> 15.5)
  const match = cleaned.match(/^(\d+(?:\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    return isNaN(num) || num < 0 ? null : num;
  }
  return null;
};

const migrateJobSalary = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable not set");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const collection = mongoose.connection.db.collection("jobs");
    const jobs = await collection.find({}).toArray();
    console.log(`Found ${jobs.length} jobs to inspect for salary migration.`);

    let migratedCount = 0;
    let flaggedCount = 0;

    for (const job of jobs) {
      if (typeof job.salary === "string") {
        const numericSalary = parseSalary(job.salary);
        if (numericSalary !== null) {
          await collection.updateOne(
            { _id: job._id },
            { $set: { salary: numericSalary } }
          );
          migratedCount++;
        } else {
          console.warn(
            `[FLAGGED FOR REVIEW] Job ID ${job._id} has unparseable salary: "${job.salary}". Skipping silent default.`
          );
          flaggedCount++;
        }
      }
    }

    console.log(
      `Job salary migration complete. Successfully migrated: ${migratedCount}, Flagged for review: ${flaggedCount}.`
    );

    await mongoose.disconnect();
    return { migratedCount, flaggedCount };
  } catch (error) {
    console.error("Migration failed:", error);
    if (process.argv[1] && process.argv[1].endsWith("migrate-job-salary.js")) {
      process.exit(1);
    }
    throw error;
  }
};

if (process.argv[1] && process.argv[1].endsWith("migrate-job-salary.js")) {
  migrateJobSalary();
}

export default migrateJobSalary;
