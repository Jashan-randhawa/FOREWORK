import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required (in smallest currency units, e.g. paise/cents)"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
      index: true,
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: "At least one product image must be provided",
      },
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user reference is required"],
    },
    avgRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating cannot be negative"],
      max: [5, "Average rating cannot exceed 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
  },
  { timestamps: true }
);

// Pre-validate hook for slug generation (synchronous for validateSync compatibility)
productSchema.pre("validate", function () {
  if (this.name && (!this.slug || this.isModified("name"))) {
    const baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    this.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }
});

// Text index for search
productSchema.index({ name: "text", description: "text" });

// Post-save hook to auto-create matching inventory document (Step 2.4)
productSchema.post("save", async function (doc) {
  try {
    if (mongoose.models.Inventory) {
      await mongoose.models.Inventory.findOneAndUpdate(
        { product: doc._id },
        { $setOnInsert: { product: doc._id, stock: 0, reserved: 0, lowStockThreshold: 5 } },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error(`[Inventory Hook] Failed to initialize inventory for product ${doc._id}:`, err.message);
  }
});

export const Product = mongoose.model("Product", productSchema);
export default Product;
