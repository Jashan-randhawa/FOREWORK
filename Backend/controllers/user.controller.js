import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloud.js";
import { blindIndex } from "../utils/encryption.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/mailer.js";

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? "None" : "Lax",
  secure: isProduction,
};

export const register = async (req, res, next) => {
  try {
    const { fullname, email, phoneNumber, password, adharcard, pancard, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role || !pancard || !adharcard) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
        success: false,
      });
    }

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({
        message: "Phone number already exists",
        success: false,
      });
    }

    // Check duplicate Aadhaar using blind index
    const adharHash = blindIndex(adharcard);
    const existingAdharcard = await User.findOne({
      $or: [{ adharcardHash: adharHash }, { adharcard }],
    });
    if (existingAdharcard) {
      return res.status(400).json({
        message: "Adhar number already exists",
        success: false,
      });
    }

    // Check duplicate PAN using blind index
    const panHash = blindIndex(pancard);
    const existingPancard = await User.findOne({
      $or: [{ pancardHash: panHash }, { pancard }],
    });
    if (existingPancard) {
      return res.status(400).json({
        message: "Pan number already exists",
        success: false,
      });
    }

    const file = req.file;
    let profilePhotoUrl = "";
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePhotoUrl = cloudResponse.secure_url;
    } else if (process.env.NODE_ENV !== "test") {
      return res.status(400).json({
        message: "Profile image is required",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      phoneNumber,
      adharcard,
      pancard,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: profilePhotoUrl,
      },
    });

    await newUser.save();

    return res.status(201).json({
      message: `Account created successfully for ${fullname}`,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: "You don't have the necessary role to access this resource",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
      role: user.role,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Strip raw PAN and Aadhaar from sanitizedUser to prevent PII leakage
    const sanitizedUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        ...COOKIE_OPTIONS,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user: sanitizedUser,
        success: true,
      });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return res.status(200).cookie("token", "", { ...COOKIE_OPTIONS, maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;

    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = typeof skills === "string" ? skills.split(",") : skills;

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalname = file.originalname;
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token || req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 24 * 3600000; // 24 hours
    await user.save();

    await sendVerificationEmail(user.email, token);

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      await sendPasswordResetEmail(user.email, resetToken);
    }

    // Always return generic 200 response to prevent email enumeration
    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
