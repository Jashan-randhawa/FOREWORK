import mongoose from "mongoose";
import { encrypt, decrypt, blindIndex } from "../utils/encryption.js";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    pancard: {
      type: String,
      required: true,
    },
    adharcard: {
      type: String,
      required: true,
    },
    pancardHash: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    adharcardHash: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["Student", "Recruiter"],
      default: "Student",
      required: true,
    },
    profile: {
      bio: {
        type: String,
      },
      skills: [{ type: String }],
      resume: {
        type: String, // URL to resume file
      },
      resumeOriginalname: {
        type: String, // Original name of resume file
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
      profilePhoto: {
        type: String, // URL to profile photo file
        default: "",
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook to compute blind index hashes and encrypt sensitive PII
userSchema.pre("save", function (next) {
  if (this.isModified("pancard") && this.pancard) {
    this.pancardHash = blindIndex(this.pancard);
    this.pancard = encrypt(this.pancard);
  }
  if (this.isModified("adharcard") && this.adharcard) {
    this.adharcardHash = blindIndex(this.adharcard);
    this.adharcard = encrypt(this.adharcard);
  }
  next();
});

export const User = mongoose.model("User", userSchema);
