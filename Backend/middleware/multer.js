import multer from "multer";

const storage = multer.memoryStorage();

export const createUpload = ({
  allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  allowedExtensions = [],
  maxSizeMB = 5,
} = {}) => {
  return multer({
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      const ext = file.originalname ? file.originalname.split(".").pop()?.toLowerCase() : "";
      const matchesMime = allowedMimeTypes.includes(file.mimetype);
      const matchesExt = allowedExtensions.length > 0 && allowedExtensions.includes(ext);

      // Support generic octet-stream from Windows/browsers when extension is valid
      const isGenericStreamWithValidExt =
        (file.mimetype === "application/octet-stream" || !file.mimetype) && matchesExt;

      if (matchesMime || matchesExt || isGenericStreamWithValidExt) {
        cb(null, true);
      } else {
        const err = new Error(
          `Invalid file type: ${file.mimetype || "unknown"}. Allowed types: ${allowedMimeTypes.join(
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
  allowedExtensions: ["jpg", "jpeg", "png", "webp"],
  maxSizeMB: 5,
}).single("file");

export const logoUpload = createUpload({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedExtensions: ["jpg", "jpeg", "png", "webp"],
  maxSizeMB: 5,
}).single("file");

export const resumeUpload = createUpload({
  allowedMimeTypes: [
    "application/pdf",
    "application/x-pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/x-zip-compressed",
  ],
  allowedExtensions: ["pdf", "docx", "doc"],
  maxSizeMB: 5,
}).single("file");

export const atsUpload = createUpload({
  allowedMimeTypes: [
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
    "applications/vnd.pdf",
    "text/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/x-msword",
    "application/x-zip-compressed",
    "text/plain",
    "text/markdown",
  ],
  allowedExtensions: ["pdf", "docx", "doc", "txt"],
  maxSizeMB: 5,
}).single("file");

// General upload backward-compatibility
export const singleUpload = createUpload({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  allowedExtensions: ["jpg", "jpeg", "png", "webp", "pdf"],
  maxSizeMB: 5,
}).single("file");
