import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is missing from environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for admin seeding");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@forework.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@Forework2026";

    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { role: "Admin" }],
    });

    if (existingAdmin) {
      console.log(`Admin account already exists: ${existingAdmin.email} (Role: ${existingAdmin.role})`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await User.create({
      fullname: "System Administrator",
      email: adminEmail,
      phoneNumber: "9999999999",
      password: hashedPassword,
      pancard: "ADMIN0000A",
      adharcard: "000011112222",
      role: "Admin",
      isEmailVerified: true,
      profile: {
        bio: "Primary system administrator for FOREWORK platform",
      },
    });

    console.log(`Admin seeded successfully: ${adminUser.email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  }
};

seedAdmin();
