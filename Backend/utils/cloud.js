import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.API_SECRET,
});

/**
 * Generates an optimized Cloudinary delivery URL with automatic format and quality (f_auto, q_auto).
 * @param {string} publicIdOrUrl - Cloudinary public ID or existing URL
 * @param {object} options - Optional transformations like width, height, crop
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (publicIdOrUrl, options = {}) => {
  if (!publicIdOrUrl || typeof publicIdOrUrl !== "string") return "";

  // If it's a Cloudinary URL already, inject f_auto,q_auto if not present
  if (publicIdOrUrl.includes("res.cloudinary.com") && publicIdOrUrl.includes("/upload/")) {
    const parts = publicIdOrUrl.split("/upload/");
    const transformation = ["f_auto", "q_auto"];
    if (options.width) transformation.push(`w_${options.width}`);
    if (options.height) transformation.push(`h_${options.height}`);
    if (options.crop) transformation.push(`c_${options.crop}`);
    const transformStr = transformation.join(",");
    
    // Avoid double injecting
    if (!parts[1].startsWith("f_auto,q_auto")) {
      return `${parts[0]}/upload/${transformStr}/${parts[1]}`;
    }
    return publicIdOrUrl;
  }

  // If it's a public ID
  return cloudinary.url(publicIdOrUrl, {
    fetch_format: "auto",
    quality: "auto",
    ...options,
  });
};

export default cloudinary;

