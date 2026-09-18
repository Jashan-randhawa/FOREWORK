import multer from "multer";

const storage = multer.memoryStorage();

export const createUpload = ({
  allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxSizeMB = 5,
} = {}) => {
  return multer({
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const err = new Error(
          `Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(
            ", "
          )}`
        );
        err.statusCode = 400;
        cb(err, false);
      }
    },
  });
};

export const photoUpload = createUpload({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB: 5,
}).single("file");

export const logoUpload = createUpload({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB: 5,
}).single("file");

export const resumeUpload = createUpload({
  allowedMimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ],
  maxSizeMB: 5,
}).single("file");

export const atsUpload = createUpload({
  allowedMimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ],
  maxSizeMB: 5,
}).single("file");

// General upload backward-compatibility
export const singleUpload = createUpload({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxSizeMB: 5,
}).single("file");
