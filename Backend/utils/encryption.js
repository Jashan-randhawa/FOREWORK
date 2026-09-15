import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard GCM IV length

const getKey = () => {
  const rawKey =
    process.env.FIELD_ENCRYPTION_KEY ||
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  // Always derive a 32-byte key using SHA-256
  return crypto.createHash("sha256").update(rawKey).digest();
};

export const encrypt = (text) => {
  if (!text || typeof text !== "string") return text;
  // If already encrypted (format: hexIV:hexTag:hexCipher), don't double-encrypt
  if (text.split(":").length === 3 && text.length > 32) {
    const parts = text.split(":");
    if (parts[0].length === 24 && parts[1].length === 32) {
      return text;
    }
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

export const decrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== "string") return encryptedText;

  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // If not matching our encryption format, return as is (legacy fallback)
    return encryptedText;
  }

  const [ivHex, authTagHex, encryptedData] = parts;
  try {
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed for ciphertext:", error.message);
    return null;
  }
};

export const blindIndex = (text) => {
  if (!text || typeof text !== "string") return "";
  return crypto
    .createHmac("sha256", getKey())
    .update(text.trim().toUpperCase())
    .digest("hex");
};

export const maskValue = (value, unmaskedCount = 4) => {
  if (!value || typeof value !== "string") return "";
  const cleaned = value.trim();
  if (cleaned.length <= unmaskedCount) return cleaned;
  const masked = "X".repeat(cleaned.length - unmaskedCount) + cleaned.slice(-unmaskedCount);
  return masked;
};
