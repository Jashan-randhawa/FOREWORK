import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import config from "../config/index.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const COOKIE_OPTIONS = {
  maxAge: 1 * 24 * 60 * 60 * 1000,
  httpsOnly: true,
  httpOnly: true,
  sameSite: config.isProduction ? "none" : "lax",
  secure: config.isProduction,
};

export const register = asyncHandler(async (req, res) => {
  const { fullname, email, phoneNumber, password, avatarUrl } = req.body;

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(409, "A user with this email address already exists.");
  }

  const existingPhone = await User.findOne({ phoneNumber });
  if (existingPhone) {
    throw new ApiError(409, "A user with this phone number already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullname,
    email: email.toLowerCase(),
    phoneNumber,
    password: hashedPassword,
    role: "Customer",
    profile: {
      avatarUrl: avatarUrl || "",
    },
  });

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
    user: sanitizedUser,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const tokenData = {
    userId: user._id.toString(),
    role: user.role,
  };

  const token = jwt.sign(tokenData, config.jwtSecret, {
    expiresIn: "1d",
  });

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return res
    .status(200)
    .cookie("token", token, COOKIE_OPTIONS)
    .json({
      success: true,
      message: `Welcome back, ${user.fullname}`,
      user: sanitizedUser,
      token,
    });
});

export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .cookie("token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId)
    .select("-password")
    .populate("addresses")
    .populate("defaultAddressId");

  if (!user) {
    throw new ApiError(404, "User profile not found.");
  }

  return res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { fullname, phoneNumber, avatarUrl } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (phoneNumber && phoneNumber !== user.phoneNumber) {
    const existingPhone = await User.findOne({
      _id: { $ne: userId },
      phoneNumber,
    });
    if (existingPhone) {
      throw new ApiError(409, "Phone number is already in use by another account.");
    }
    user.phoneNumber = phoneNumber;
  }

  if (fullname) user.fullname = fullname;
  if (avatarUrl !== undefined) {
    user.profile.avatarUrl = avatarUrl;
  }

  await user.save();

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: sanitizedUser,
  });
});
