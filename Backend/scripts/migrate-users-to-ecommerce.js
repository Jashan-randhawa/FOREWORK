import mongoose from "mongoose";
import config from "../config/index.js";

const isDryRun = process.argv.includes("--dry-run");

async function migrateUsers() {
  console.log(`Starting user migration... [Mode: ${isDryRun ? "DRY RUN (no changes written)" : "LIVE WRITE"}]`);

  try {
    await mongoose.connect(config.mongoUri);
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    const usersCount = await usersCollection.countDocuments();
    console.log(`Found ${usersCount} total user records.`);

    if (usersCount === 0) {
      console.log("No user records found to migrate. Migration complete.");
      process.exit(0);
    }

    const cursor = usersCollection.find();
    let updatedCount = 0;

    for await (const doc of cursor) {
      const updates = {};
      const unsets = {};

      // Strip legacy job-portal fields
      const legacyFields = [
        "pancard",
        "adharcard",
        "profile.bio",
        "profile.skills",
        "profile.resume",
        "profile.resumeOriginalname",
        "profile.company",
      ];

      for (const field of legacyFields) {
        if (field.startsWith("profile.")) {
          const sub = field.split(".")[1];
          if (doc.profile && doc.profile[sub] !== undefined) {
            unsets[`profile.${sub}`] = "";
          }
        } else if (doc[field] !== undefined) {
          unsets[field] = "";
        }
      }

      // Convert legacy roles to e-commerce roles
      if (doc.role === "Student") {
        updates.role = "Customer";
      } else if (doc.role === "Recruiter") {
        updates.role = "Admin";
      } else if (!doc.role || !["Customer", "Admin"].includes(doc.role)) {
        updates.role = "Customer";
      }

      // Migrate profilePhoto to profile.avatarUrl
      if (doc.profile?.profilePhoto && !doc.profile?.avatarUrl) {
        updates["profile.avatarUrl"] = doc.profile.profilePhoto;
        unsets["profile.profilePhoto"] = "";
      }

      if (!Array.isArray(doc.addresses)) {
        updates.addresses = [];
      }

      const updateOp = {};
      if (Object.keys(updates).length > 0) updateOp.$set = updates;
      if (Object.keys(unsets).length > 0) updateOp.$unset = unsets;

      if (Object.keys(updateOp).length > 0) {
        updatedCount++;
        if (isDryRun) {
          console.log(`[Dry-Run] Would update user ${doc._id} (${doc.email}):`, JSON.stringify(updateOp));
        } else {
          await usersCollection.updateOne({ _id: doc._id }, updateOp);
          console.log(`[Updated] User ${doc._id} (${doc.email}) migrated.`);
        }
      }
    }

    console.log(`Migration finished. ${updatedCount} users processed.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateUsers();
