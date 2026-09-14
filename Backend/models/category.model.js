import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function () {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

export const Category = mongoose.model("Category", categorySchema);
export default Category;
