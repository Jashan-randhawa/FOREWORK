import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Job } from '../models/job.model.js';

dotenv.config();

const migrateJobStatus = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing from environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const result = await Job.updateMany(
      { $or: [{ status: { $exists: false } }, { status: null }] },
      { $set: { status: 'published' } }
    );

    console.log(`Migration completed successfully. Matched & modified ${result.modifiedCount} jobs to 'published'.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateJobStatus();
