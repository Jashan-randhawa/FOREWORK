import path from "path";

/**
 * Converts a multer file object to a base64 data URI string.
 * Replaces the `datauri` npm package (which had high-severity image-size CVEs).
 * Cloudinary's uploader.upload() accepts this format directly.
 *
 * @param {Object} file - Multer file object with `originalname` and `buffer` fields
 * @returns {{ content: string }} Object with a `content` property matching datauri's API
 */
const getDataUri = (file) => {
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
  const base64 = file.buffer.toString("base64");
  return { content: `data:${mimeType};base64,${base64}` };
};

export default getDataUri;