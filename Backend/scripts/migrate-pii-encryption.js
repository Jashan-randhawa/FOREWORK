import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { encrypt, blindIndex } from "../utils/encryption.js";

dotenv.config();

const migratePII = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable not set");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const users = await User.find({});
    console.log(`Found ${users.length} users to inspect.`);

    let updatedCount = 0;
    for (const user of users) {
      let modified = false;

      // Check pancard
      if (user.pancard && (!user.pancardHash || !user.pancard.includes(":"))) {
        const rawPan = user.pancard;
        user.pancardHash = blindIndex(rawPan);
        user.pancard = encrypt(rawPan);
        modified = true;
      }

      // Check adharcard
      if (user.adharcard && (!user.adharcardHash || !user.adharcard.includes(":"))) {
        const rawAdhar = user.adharcard;
        user.adharcardHash = blindIndex(rawAdhar);
        user.adharcard = encrypt(rawAdhar);
        modified = true;
      }

      if (modified) {
        // Use direct update to avoid re-triggering schema pre-save hooks if already encrypted
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              pancard: user.pancard,
              pancardHash: user.pancardHash,
              adharcard: user.adharcard,
              adharcardHash: user.adharcardHash,
            },
          }
        );
        updatedCount++;
      }
    }

    console.log(`Migration complete. Successfully encrypted and backfilled ${updatedCount} users.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

// If run directly
if (process.argv[1] && process.argv[1].endsWith("migrate-pii-encryption.js")) {
  migratePII();
}

export default migratePII;
