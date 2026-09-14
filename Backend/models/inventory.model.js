import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required for inventory"],
      unique: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    reserved: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Reserved stock cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low stock threshold cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for available units
inventorySchema.virtual("available").get(function () {
  return Math.max(0, this.stock - this.reserved);
});

export const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
