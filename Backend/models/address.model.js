import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required for an address"],
    },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
      trim: true,
    },
    line1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
    },
    line2: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

addressSchema.index({ user: 1 });

export const Address = mongoose.model("Address", addressSchema);
export default Address;
