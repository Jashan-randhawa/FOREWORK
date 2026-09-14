import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files (JPEG, PNG, WEBP) are allowed"), false);
  }
};

const uploadConfig = {
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter,
};

export const singleUpload = multer(uploadConfig).single("file");
export const multiImageUpload = multer(uploadConfig).array("images", 5);

export default {
  singleUpload,
  multiImageUpload,
};
