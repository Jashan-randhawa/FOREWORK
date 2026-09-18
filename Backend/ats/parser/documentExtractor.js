import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import AppError from "../../utils/AppError.js";
import cloudinary from "../../utils/cloud.js";

/**
 * Validates document buffer, size, and MIME type/extension.
 * Extracts clean machine-readable text, structure, and detects scanned/image PDFs.
 */
export class DocumentExtractor {
  static MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  /**
   * Generates authenticated and signed download candidate URLs for Cloudinary assets.
   * Resolves 401 Unauthorized errors caused by Cloudinary's default PDF delivery restrictions.
   * @param {string} url
   * @returns {string[]}
   */
  static getCloudinaryCandidates(url) {
    if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
      return [];
    }

    const config = cloudinary.config();
    const hasCredentials = Boolean(config.api_key && config.api_secret);
    const candidates = [];

    try {
      const match = url.match(
        /\/res\.cloudinary\.com\/([^/]+)\/(image|raw|video|auto)\/upload\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+?)(?:\.([a-zA-Z0-9]+))?$/
      );

      if (match) {
        const [, cloudName, resType, publicId, format] = match;

        if (hasCredentials) {
          // 1. Authenticated download URL with HMAC signature (designed for private/restricted downloads)
          candidates.push(
            cloudinary.utils.private_download_url(publicId, format || "pdf", {
              resource_type: resType || "image",
              type: "upload",
            })
          );

          if (resType !== "raw") {
            candidates.push(
              cloudinary.utils.private_download_url(publicId, format || "pdf", {
                resource_type: "raw",
                type: "upload",
              })
            );
          }

          // 2. Signed delivery URL
          candidates.push(
            cloudinary.url(format ? `${publicId}.${format}` : publicId, {
              resource_type: resType || "image",
              type: "upload",
              sign_url: true,
              secure: true,
            })
          );
        }

        // 3. Fallback direct URLs with explicit extension
        if (!format) {
          candidates.push(
            `https://res.cloudinary.com/${cloudName}/${resType}/upload/${publicId}.pdf`
          );
        }
      }
    } catch {
      // ignore regex/config errors
    }

    return candidates;
  }

  /**
   * Fetches a remote document from a URL into a Buffer.
   * @param {string} url
   * @returns {Promise<{ buffer: Buffer, mimeType: string, filename: string }>}
   */
  static async fetchFromUrl(url) {
    if (!url || typeof url !== "string") {
      throw new AppError("Invalid document URL provided", 400);
    }

    const config = cloudinary.config();
    const isCloudinary = url.includes("res.cloudinary.com") || url.includes("api.cloudinary.com");
    const basicAuth =
      isCloudinary && config.api_key && config.api_secret
        ? `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString("base64")}`
        : null;

    const urlsToTry = [
      ...this.getCloudinaryCandidates(url),
      url,
    ];
    const uniqueUrls = [...new Set(urlsToTry)];

    let lastError = null;

    for (const targetUrl of uniqueUrls) {
      try {
        const headers = {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ForeWork-ATS/2.0",
          Accept:
            "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,*/*",
        };

        if (basicAuth && targetUrl.includes("cloudinary.com")) {
          headers["Authorization"] = basicAuth;
        }

        const response = await fetch(targetUrl, {
          headers,
          signal: AbortSignal.timeout(20000),
        });

        if (!response.ok) {
          lastError = new AppError(
            `Failed to download resume from storage (${response.status}: ${response.statusText})`,
            400
          );
          continue;
        }

        const contentType = response.headers.get("content-type") || "";
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
          lastError = new AppError("The fetched resume file is empty (0 bytes)", 400);
          continue;
        }

        let filename = "resume";
        try {
          const parsedUrl = new URL(url);
          const pathParts = parsedUrl.pathname.split("/");
          filename = pathParts[pathParts.length - 1] || "resume";
        } catch {
          // use default
        }

        return { buffer, mimeType: contentType, filename };
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError instanceof AppError) throw lastError;
    throw new AppError(
      `Could not retrieve resume from storage: ${lastError?.message || "Storage access restricted (401)"}`,
      400
    );
  }

  /**
   * Main entry point to extract text from a file buffer or remote URL.
   * @param {Object} params
   * @param {Buffer} [params.buffer]
   * @param {string} [params.url]
   * @param {string} [params.mimeType]
   * @param {string} [params.filename]
   * @returns {Promise<Object>}
   */
  static async extract({ buffer, url, mimeType, filename = "" }) {
    if (!buffer && url) {
      const fetched = await this.fetchFromUrl(url);
      buffer = fetched.buffer;
      mimeType = mimeType || fetched.mimeType;
      filename = filename || fetched.filename;
    }

    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new AppError("No valid document buffer or URL provided for analysis", 400);
    }

    if (buffer.length === 0) {
      throw new AppError("The uploaded resume file is empty (0 bytes)", 400);
    }

    if (buffer.length > this.MAX_FILE_SIZE_BYTES) {
      throw new AppError("Resume file exceeds the maximum 5MB size limit", 400);
    }

    const detectedType = this.determineType(filename, mimeType, buffer);

    switch (detectedType) {
      case "pdf":
        return await this.extractPdf(buffer, filename);
      case "docx":
        return await this.extractDocx(buffer, filename);
      case "txt":
        return await this.extractTxt(buffer, filename);
      default:
        throw new AppError(
          "Unsupported document format. Please upload a PDF (.pdf), Word Document (.docx), or Text file (.txt)",
          400
        );
    }
  }

  /**
   * Determines document type from filename extension, mimetype, or magic bytes.
   */
  static determineType(filename = "", mimeType = "", buffer = null) {
    const lowerName = filename.toLowerCase();
    const lowerMime = (mimeType || "").toLowerCase();

    if (lowerName.endsWith(".pdf") || lowerMime.includes("pdf")) return "pdf";
    if (
      lowerName.endsWith(".docx") ||
      lowerMime.includes("wordprocessingml") ||
      lowerMime.includes("officedocument")
    ) {
      return "docx";
    }
    if (lowerName.endsWith(".txt") || lowerMime.includes("text/plain")) return "txt";

    // Magic bytes detection
    if (buffer && buffer.length >= 4) {
      // PDF standard allows %PDF- anywhere within the first 1024 bytes
      const headerSnippet = buffer.subarray(0, Math.min(buffer.length, 1024)).toString("binary");
      if (headerSnippet.includes("%PDF")) {
        return "pdf";
      }

      // DOCX / ZIP magic bytes (PK\x03\x04 or PK\x05\x06 or PK\x07\x08)
      if (
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07)
      ) {
        return "docx";
      }
    }

    if (lowerName.includes(".pdf")) return "pdf";
    if (lowerName.includes(".docx") || lowerName.includes(".doc")) return "docx";

    return "unknown";
  }

  /**
   * Extracts text from PDF buffer using pdf-parse.
   */
  static async extractPdf(buffer, filename) {
    try {
      const parser = new PDFParse({ data: Uint8Array.from(buffer), verbosity: 0 });
      const textResult = await parser.getText();

      const rawText = textResult?.text || "";
      const pageCount = textResult?.total || textResult?.pages?.length || 1;
      const cleanText = this.sanitizeText(rawText);

      const wordCount = this.countWords(cleanText);
      const charCount = cleanText.replace(/\s+/g, "").length;

      const avgCharsPerPage = pageCount > 0 ? charCount / pageCount : charCount;
      const isScannedOrImagePdf = avgCharsPerPage < 60 || wordCount < 20;

      const extractionWarnings = [];
      let extractionConfidence = 0.95;

      if (isScannedOrImagePdf) {
        extractionConfidence = 0.15;
        extractionWarnings.push(
          "Potential parsing risk detected: Document appears to be a scanned image or image-only PDF with minimal machine-readable text."
        );
      } else if (wordCount < 100) {
        extractionConfidence = 0.6;
        extractionWarnings.push(
          "Document contains unusually short text content (< 100 words). Extraction confidence is reduced."
        );
      }

      if (pageCount > 4) {
        extractionWarnings.push(
          `Document is ${pageCount} pages long. Standard industry resumes are typically 1–2 pages.`
        );
      }

      return {
        format: "pdf",
        filename,
        rawText,
        cleanText,
        pageCount,
        wordCount,
        charCount,
        isScannedOrImagePdf,
        extractionConfidence,
        extractionWarnings,
        headings: this.detectPotentialHeadings(cleanText),
        links: this.extractUrls(rawText),
      };
    } catch (err) {
      throw new AppError(
        `Failed to parse PDF document. The file may be password protected or corrupted: ${err.message}`,
        400
      );
    }
  }

  /**
   * Extracts text and structure from DOCX buffer using mammoth.
   */
  static async extractDocx(buffer, filename) {
    try {
      const rawTextResult = await mammoth.extractRawText({ buffer });
      const htmlResult = await mammoth.convertToHtml({ buffer });

      const rawText = rawTextResult?.value || "";
      const html = htmlResult?.value || "";
      const cleanText = this.sanitizeText(rawText);

      const wordCount = this.countWords(cleanText);
      const charCount = cleanText.replace(/\s+/g, "").length;

      const extractionWarnings = [];
      let extractionConfidence = 0.95;

      if (wordCount < 30) {
        extractionConfidence = 0.4;
        extractionWarnings.push(
          "Document contains very little readable text. Please ensure content is not embedded solely in shapes or text boxes."
        );
      }

      const hasTables = /<table/i.test(html);
      if (hasTables) {
        extractionWarnings.push(
          "Potential parsing risk detected: Document contains tabular structures. Complex multi-column tables may disrupt reading order in some ATS engines."
        );
      }

      return {
        format: "docx",
        filename,
        rawText,
        cleanText,
        pageCount: Math.max(1, Math.ceil(wordCount / 400)),
        wordCount,
        charCount,
        isScannedOrImagePdf: false,
        extractionConfidence,
        extractionWarnings,
        headings: this.detectPotentialHeadings(cleanText),
        links: this.extractUrls(rawText),
        htmlStructure: {
          hasTables,
        },
      };
    } catch (err) {
      throw new AppError(
        `Failed to parse DOCX document. The file may be corrupted or invalid: ${err.message}`,
        400
      );
    }
  }

  /**
   * Extracts plain text from TXT buffer.
   */
  static async extractTxt(buffer, filename) {
    const rawText = buffer.toString("utf-8");
    const cleanText = this.sanitizeText(rawText);
    const wordCount = this.countWords(cleanText);

    return {
      format: "txt",
      filename,
      rawText,
      cleanText,
      pageCount: Math.max(1, Math.ceil(wordCount / 400)),
      wordCount,
      charCount: cleanText.length,
      isScannedOrImagePdf: false,
      extractionConfidence: 0.9,
      extractionWarnings: [],
      headings: this.detectPotentialHeadings(cleanText),
      links: this.extractUrls(rawText),
    };
  }

  /**
   * Clean unwanted control characters while preserving meaningful whitespace & newlines.
   */
  static sanitizeText(text = "") {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\t/g, "    ")
      .replace(/[ \u00A0\u1680\u2000-\u200B\u202F\u205F\u3000]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  static countWords(text = "") {
    const tokens = text.match(/\b[A-Za-z0-9+#.-]+\b/g);
    return tokens ? tokens.length : 0;
  }

  static detectPotentialHeadings(text = "") {
    const lines = text.split("\n");
    const headings = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (
        line.length >= 3 &&
        line.length <= 45 &&
        !line.endsWith(".") &&
        !line.includes("@") &&
        (line === line.toUpperCase() || /^[A-Z][a-z0-9A-Z\s/&-]+$/.test(line))
      ) {
        headings.push(line);
      }
    }
    return headings;
  }

  static extractUrls(text = "") {
    const urlRegex = /https?:\/\/[^\s<>"')]+|(?:www\.)[^\s<>"')]+/gi;
    const matches = text.match(urlRegex) || [];
    return Array.from(new Set(matches.map((u) => (u.startsWith("http") ? u : `https://${u}`))));
  }
}

export default DocumentExtractor;
