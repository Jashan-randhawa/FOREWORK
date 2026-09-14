import mongoose from "mongoose";
import Address from "../models/address.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: addresses.length,
    addresses,
  });
});

export const createAddress = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { label, line1, line2, city, state, postalCode, country, phone, isDefault } = req.body;

  const existingCount = await Address.countDocuments({ user: userId });
  // If this is the user's first address, make it default automatically
  const shouldBeDefault = isDefault || existingCount === 0;

  if (shouldBeDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  const address = await Address.create({
    user: userId,
    label: label || "home",
    line1,
    line2: line2 || "",
    city,
    state,
    postalCode,
    country,
    phone,
    isDefault: shouldBeDefault,
  });

  const userUpdate = { $push: { addresses: address._id } };
  if (shouldBeDefault) {
    userUpdate.$set = { defaultAddressId: address._id };
  }
  await User.findByIdAndUpdate(userId, userUpdate);

  return res.status(201).json({
    success: true,
    message: "Address created successfully",
    address,
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid address ID format");
  }

  const address = await Address.findById(id);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Strict ownership check
  if (address.user.toString() !== userId) {
    throw new ApiError(403, "Forbidden: You can only edit your own addresses");
  }

  if (req.body.isDefault) {
    await Address.updateMany({ user: userId, _id: { $ne: id } }, { isDefault: false });
    await User.findByIdAndUpdate(userId, { defaultAddressId: id });
  }

  Object.assign(address, req.body);
  await address.save();

  return res.status(200).json({
    success: true,
    message: "Address updated successfully",
    address,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid address ID format");
  }

  const address = await Address.findById(id);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  if (address.user.toString() !== userId) {
    throw new ApiError(403, "Forbidden: You can only delete your own addresses");
  }

  const wasDefault = address.isDefault;
  await Address.findByIdAndDelete(id);

  // Remove from User addresses array
  await User.findByIdAndUpdate(userId, { $pull: { addresses: id } });

  // If deleted address was default, promote another or clear defaultAddressId
  if (wasDefault) {
    const nextAddress = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
      await User.findByIdAndUpdate(userId, { defaultAddressId: nextAddress._id });
    } else {
      await User.findByIdAndUpdate(userId, { defaultAddressId: null });
    }
  }

  return res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid address ID format");
  }

  const address = await Address.findById(id);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  if (address.user.toString() !== userId) {
    throw new ApiError(403, "Forbidden: You can only set your own address as default");
  }

  await Address.updateMany({ user: userId }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  await User.findByIdAndUpdate(userId, { defaultAddressId: address._id });

  return res.status(200).json({
    success: true,
    message: "Default address updated",
    address,
  });
});
