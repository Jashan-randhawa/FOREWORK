import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Inventory from "../models/inventory.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/admin/stats
 * Aggregate dashboard statistics: totalRevenue, orderCountsByStatus, lowStockProducts
 */
export const getAdminStats = asyncHandler(async (req, res) => {
  // 1. Calculate total revenue from successful payments (amount - refundedAmount)
  const revenueAgg = await Payment.aggregate([
    {
      $match: {
        status: { $in: ["SUCCESS", "REFUNDED"] },
      },
    },
    {
      $group: {
        _id: null,
        totalNetRevenue: {
          $sum: { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] },
        },
      },
    },
  ]);

  const totalRevenue = revenueAgg.length > 0 ? Math.max(0, revenueAgg[0].totalNetRevenue) : 0;

  // 2. Count orders grouped by status
  const orderCountsAgg = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const orderCountsByStatus = {
    PENDING: 0,
    PAID: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    REFUND_INITIATED: 0,
    REFUNDED: 0,
    PAYMENT_FAILED: 0,
  };

  orderCountsAgg.forEach((item) => {
    orderCountsByStatus[item._id] = item.count;
  });

  // 3. Find low-stock inventory (stock - reserved <= lowStockThreshold)
  const lowStockAgg = await Inventory.aggregate([
    {
      $addFields: {
        available: { $max: [0, { $subtract: ["$stock", "$reserved"] }] },
      },
    },
    {
      $match: {
        $expr: {
          $lte: ["$available", "$lowStockThreshold"],
        },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: {
        path: "$productDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        productId: "$product",
        productName: "$productDetails.name",
        sku: "$productDetails.sku",
        stock: 1,
        reserved: 1,
        available: 1,
        lowStockThreshold: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      orderCountsByStatus,
      lowStockProducts: lowStockAgg,
    },
  });
});

/**
 * GET /api/admin/users
 * Paginated list of users for administration
 */
export const getAdminUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = [
      { fullname: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    },
  });
});

/**
 * PUT /api/admin/users/:id/role
 * Promote or demote user role with last-admin lockout protection
 */
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(new ApiError(404, "User not found"));
  }

  // If demoting an Admin to Customer, ensure we do not leave zero Admins
  if (targetUser.role === "Admin" && role === "Customer") {
    const adminCount = await User.countDocuments({ role: "Admin" });
    if (adminCount <= 1) {
      return next(
        new ApiError(
          403,
          "Cannot demote the last remaining administrator. At least one Admin must exist."
        )
      );
    }
  }

  const oldRole = targetUser.role;
  targetUser.role = role;
  await targetUser.save();

  console.log(
    `[ADMIN AUDIT] User ${targetUser._id} (${targetUser.email}) role changed from '${oldRole}' to '${role}' by Admin ${req.user.userId}`
  );

  res.status(200).json({
    success: true,
    message: `User role successfully updated to ${role}`,
    data: {
      id: targetUser._id,
      fullname: targetUser.fullname,
      email: targetUser.email,
      role: targetUser.role,
    },
  });
});
