import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["Customer", "Admin"],
      default: "Customer",
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    defaultAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      default: null,
    },
    profile: {
      avatarUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

// Method to compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
export default User;
