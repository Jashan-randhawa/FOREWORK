import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import AppError from "../../utils/AppError.js";

/**
 * Validates document buffer, size, and MIME type/extension.
 * Extracts clean machine-readable text, structure, and detects scanned/image PDFs.
 */
export class DocumentExtractor {
  static MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  /**
   * Fetches a remote document from a URL into a Buffer.
   * @param {string} url
   * @returns {Promise<{ buffer: Buffer, mimeType: string, filename: string }>}
   */
  static async fetchFromUrl(url) {
    if (!url || typeof url !== "string") {
      throw new AppError("Invalid document URL provided", 400);
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        throw new AppError(`Failed to download resume from storage: ${response.statusText}`, 400);
      }

      const contentType = response.headers.get("content-type") || "";
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

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
      if (err instanceof AppError) throw err;
      throw new AppError(`Could not retrieve resume from URL: ${err.message}`, 400);
    }
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

    if (buffer && buffer.length >= 4) {
      if (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      ) {
        return "pdf";
      }
      if (
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04
      ) {
        return "docx";
      }
    }

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
