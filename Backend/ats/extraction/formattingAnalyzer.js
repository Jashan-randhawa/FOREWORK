import { CANONICAL_SECTIONS } from "./sectionDetector.js";

export class FormattingAnalyzer {
  /**
   * Analyzes document for potential ATS parsing hazards.
   * @param {Object} params
   * @param {string} params.cleanText
   * @param {string} params.rawText
   * @param {Object} params.contact
   * @param {string[]} params.sectionsDetected
   * @param {Object} [params.extractionMeta]
   * @returns {{ score: number, risks: Array<{ code: string, severity: string, message: string, recommendation: string }>, summary: string }}
   */
  static analyze({ cleanText = "", rawText = "", contact = {}, sectionsDetected = [], extractionMeta = {} }) {
    const risks = [];
    let deductions = 0;

    // 1. Check for Image-only / Scanned PDF
    if (extractionMeta.isScannedOrImagePdf) {
      risks.push({
        code: "SCANNED_IMAGE_PDF",
        severity: "CRITICAL",
        message: "Potential parsing risk detected: Document appears to be a scanned image or non-OCR PDF with little or no machine-readable text.",
        recommendation: "Re-export your resume directly from Word, Google Docs, or LaTeX to ensure all text is selectable and machine-readable.",
      });
      deductions += 15;
    }

    // 2. Check for missing essential contact details
    if (!contact.email) {
      risks.push({
        code: "MISSING_EMAIL",
        severity: "HIGH",
        message: "Potential parsing risk detected: No valid email address was identified.",
        recommendation: "Ensure your primary email is clearly placed in the top header without embedding it inside graphics or non-standard symbols.",
      });
      deductions += 4;
    }

    if (!contact.phone) {
      risks.push({
        code: "MISSING_PHONE",
        severity: "MEDIUM",
        message: "Potential parsing risk detected: No phone number was recognized.",
        recommendation: "Add a standard formatted phone number (e.g. +1 555-123-4567) to your contact header.",
      });
      deductions += 2;
    }

    // 3. Check for essential core sections
    const hasExperience = sectionsDetected.includes(CANONICAL_SECTIONS.EXPERIENCE);
    const hasEducation = sectionsDetected.includes(CANONICAL_SECTIONS.EDUCATION);
    const hasSkills = sectionsDetected.includes(CANONICAL_SECTIONS.SKILLS);

    if (!hasExperience) {
      risks.push({
        code: "MISSING_EXPERIENCE_SECTION",
        severity: "HIGH",
        message: "Potential parsing risk detected: No standard 'Experience' or 'Work History' heading was identified.",
        recommendation: "Use standard headings like 'Work Experience' or 'Professional Experience' so ATS parsers can categorize your employment timeline.",
      });
      deductions += 5;
    }

    if (!hasEducation) {
      risks.push({
        code: "MISSING_EDUCATION_SECTION",
        severity: "MEDIUM",
        message: "Potential parsing risk detected: No standard 'Education' heading was identified.",
        recommendation: "Include an 'Education' section detailing your degree, institution, and completion date.",
      });
      deductions += 3;
    }

    if (!hasSkills) {
      risks.push({
        code: "MISSING_SKILLS_SECTION",
        severity: "MEDIUM",
        message: "Potential parsing risk detected: Dedicated 'Skills' or 'Technical Skills' section was not found.",
        recommendation: "Add a dedicated 'Skills' section listing your canonical programming languages, tools, and platforms.",
      });
      deductions += 3;
    }

    // 4. Multi-column and table layout detection heuristics
    // Lines with multiple spaced columns e.g. "Software Engineer          Jan 2022 - Present"
    const columnLikeLines = cleanText
      .split("\n")
      .filter((line) => /\S\s{6,}\S/.test(line));

    if (columnLikeLines.length > 5 || extractionMeta?.htmlStructure?.hasTables) {
      risks.push({
        code: "MULTI_COLUMN_OR_TABLES",
        severity: "MEDIUM",
        message: "Potential parsing risk detected: Multiple columns or table cells may disrupt ATS reading order.",
        recommendation: "Consider a single-column, top-to-bottom layout for maximum compatibility across older ATS parsers.",
      });
      deductions += 3;
    }

    // 5. Check for unusual characters / font encoding artifacts
    // Excess replacement characters (), strange bullet encodings, etc.
    const nonAsciiCount = (rawText.match(/[^\x20-\x7E\t\n\r•·–—]/g) || []).length;
    if (nonAsciiCount > 25) {
      risks.push({
        code: "ENCODING_NOISE",
        severity: "LOW",
        message: "Potential parsing risk detected: Unusual Unicode characters or symbols detected that may not translate well in plain text parsing.",
        recommendation: "Stick to standard fonts (Arial, Calibri, Helvetica) and standard bullet points.",
      });
      deductions += 2;
    }

    // 6. Word count checks (too short or excessively long)
    const wordCount = extractionMeta.wordCount || cleanText.split(/\s+/).length;
    if (wordCount > 1500) {
      risks.push({
        code: "EXCESSIVE_LENGTH",
        severity: "LOW",
        message: "Potential parsing risk detected: Document exceeds 1,500 words and may be too long for standard review.",
        recommendation: "Keep your resume concise (typically 1–2 pages) by focusing on recent and relevant accomplishments.",
      });
      deductions += 2;
    }

    const calculatedScore = Math.max(0, 20 - deductions);

    return {
      score: calculatedScore,
      maxScore: 20,
      risks,
      deductions,
      hasCriticalRisks: risks.some((r) => r.severity === "CRITICAL"),
    };
  }
}

export default FormattingAnalyzer;
