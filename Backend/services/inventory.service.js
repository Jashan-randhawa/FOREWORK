import Inventory from "../models/inventory.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * Check if a product has at least `qty` available units (stock - reserved).
 */
export const checkAvailability = async (productId, qty) => {
  const inventory = await Inventory.findOne({ product: productId });
  if (!inventory) {
    return { available: false, currentStock: 0, availableUnits: 0 };
  }
  const availableUnits = Math.max(0, inventory.stock - inventory.reserved);
  return {
    available: availableUnits >= qty,
    currentStock: inventory.stock,
    reservedUnits: inventory.reserved,
    availableUnits,
  };
};

/**
 * Atomically reserves `qty` units using $expr to guarantee no race conditions.
 */
export const reserveStock = async (productId, qty, session = null) => {
  if (qty <= 0) {
    throw new ApiError(400, "Quantity to reserve must be greater than zero");
  }

  const query = {
    product: productId,
    $expr: {
      $gte: [{ $subtract: ["$stock", "$reserved"] }, qty],
    },
  };

  const options = { new: true };
  if (session) options.session = session;

  const updated = await Inventory.findOneAndUpdate(
    query,
    { $inc: { reserved: qty } },
    options
  );

  if (!updated) {
    throw new ApiError(409, "Insufficient stock available for product reservation");
  }

  return updated;
};

/**
 * Releases a previous reservation (e.g. checkout cancelled or payment failed).
 */
export const releaseReservation = async (productId, qty, session = null) => {
  const options = { new: true };
  if (session) options.session = session;

  const updated = await Inventory.findOneAndUpdate(
    { product: productId },
    { $inc: { reserved: -Math.abs(qty) } },
    options
  );

  return updated;
};

/**
 * Commits a reservation upon payment success: decrements both stock and reserved.
 */
export const commitReservation = async (productId, qty, session = null) => {
  const options = { new: true };
  if (session) options.session = session;

  const updated = await Inventory.findOneAndUpdate(
    { product: productId },
    { $inc: { stock: -Math.abs(qty), reserved: -Math.abs(qty) } },
    options
  );

  return updated;
};

/**
 * Updates absolute stock level (admin restocking).
 */
export const adjustStock = async (productId, newStock) => {
  if (newStock < 0) {
    throw new ApiError(400, "Stock quantity cannot be negative");
  }

  const inventory = await Inventory.findOneAndUpdate(
    { product: productId },
    { $set: { stock: newStock } },
    { new: true, upsert: true }
  );

  return inventory;
};

export default {
  checkAvailability,
  reserveStock,
  releaseReservation,
  commitReservation,
  adjustStock,
};
