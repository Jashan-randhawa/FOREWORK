import { DocumentExtractor } from "./documentExtractor.js";
import { SectionDetector, CANONICAL_SECTIONS } from "../extraction/sectionDetector.js";
import { ContactExtractor } from "../extraction/contactExtractor.js";
import { ExperienceExtractor } from "../extraction/experienceExtractor.js";
import { EducationExtractor } from "../extraction/educationExtractor.js";
import { SkillExtractor } from "../extraction/skillExtractor.js";
import { FormattingAnalyzer } from "../extraction/formattingAnalyzer.js";

export class ResumeParser {
  /**
   * Parses document buffer, remote URL, or raw text into Normalized Resume JSON.
   * @param {Object} input
   * @param {Buffer} [input.buffer]
   * @param {string} [input.url]
   * @param {string} [input.rawText]
   * @param {string} [input.mimeType]
   * @param {string} [input.filename]
   * @returns {Promise<Object>} Normalized Resume JSON
   */
  static async parse(input = {}) {
    let extractionResult;

    if (input.buffer || input.url) {
      extractionResult = await DocumentExtractor.extract({
        buffer: input.buffer,
        url: input.url,
        mimeType: input.mimeType,
        filename: input.filename,
      });
    } else if (input.rawText) {
      extractionResult = {
        format: "text",
        filename: input.filename || "pasted_resume.txt",
        rawText: input.rawText,
        cleanText: DocumentExtractor.sanitizeText(input.rawText),
        pageCount: 1,
        wordCount: DocumentExtractor.countWords(input.rawText),
        charCount: input.rawText.length,
        isScannedOrImagePdf: false,
        extractionConfidence: 0.95,
        extractionWarnings: [],
        headings: DocumentExtractor.detectPotentialHeadings(input.rawText),
        links: DocumentExtractor.extractUrls(input.rawText),
      };
    } else {
      throw new Error("ResumeParser requires buffer, url, or rawText");
    }

    const { cleanText, rawText } = extractionResult;

    // 1. Detect sections
    const sectionData = SectionDetector.detect(cleanText);
    const { sections, sectionsDetected } = sectionData;

    // 2. Extract contact information
    const contact = ContactExtractor.extract(cleanText, sections.header);

    // 3. Extract experience
    const experienceText = sections[CANONICAL_SECTIONS.EXPERIENCE] || cleanText;
    const experience = ExperienceExtractor.extract(experienceText);

    // 4. Extract education
    const educationText = sections[CANONICAL_SECTIONS.EDUCATION] || cleanText;
    const education = EducationExtractor.extract(educationText);

    // 5. Extract skills
    const skillsSectionText = sections[CANONICAL_SECTIONS.SKILLS] || "";
    const skillData = SkillExtractor.extract(cleanText, skillsSectionText);

    // 6. Extract projects
    const projectsText = sections[CANONICAL_SECTIONS.PROJECTS] || "";
    const projects = this.parseProjects(projectsText);

    // 7. Extract certifications
    const certsText = sections[CANONICAL_SECTIONS.CERTIFICATIONS] || "";
    const certifications = this.parseSimpleList(certsText);

    // 8. Extract languages
    const languagesText = sections[CANONICAL_SECTIONS.LANGUAGES] || "";
    const languages = this.parseLanguages(languagesText);

    // 9. Extract summary / objective
    const summary = sections[CANONICAL_SECTIONS.SUMMARY] || "";

    // 10. Analyze formatting & parseability risks
    const formatting = FormattingAnalyzer.analyze({
      cleanText,
      rawText,
      contact,
      sectionsDetected,
      extractionMeta: extractionResult,
    });

    // Build Normalized Resume JSON
    const normalizedResume = {
      personal: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        linkedin: contact.linkedin,
        github: contact.github,
        portfolio: contact.portfolio,
        location: contact.location,
      },
      summary: summary.slice(0, 1000),
      experience,
      education,
      skills: skillData.skills,
      categorized_skills: skillData.categorized,
      projects,
      certifications,
      languages,
      sections_detected: sectionsDetected,
      metadata: {
        format: extractionResult.format,
        filename: extractionResult.filename,
        page_count: extractionResult.pageCount,
        word_count: extractionResult.wordCount,
        is_scanned_pdf: extractionResult.isScannedOrImagePdf,
        extraction_confidence: extractionResult.extractionConfidence,
        extraction_warnings: extractionResult.extractionWarnings,
        formatting_score: formatting.score,
        formatting_risks: formatting.risks,
      },
      _rawCleanText: cleanText,
    };

    return normalizedResume;
  }

  static parseProjects(text = "") {
    if (!text.trim()) return [];
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const projects = [];
    let curr = null;

    for (const line of lines) {
      const isBullet = /^[-*•·–—]/.test(line);
      if (!isBullet && line.length < 50 && !line.endsWith(".")) {
        if (curr) projects.push(curr);
        curr = {
          name: line.replace(/[:\-–—\s]+$/, ""),
          description: [],
          technologies: [],
        };
      } else if (curr) {
        curr.description.push(line.replace(/^[-*•·–—\s]+/, ""));
        const found = SkillExtractor.extract(line);
        for (const s of found.skills) {
          if (!curr.technologies.includes(s)) curr.technologies.push(s);
        }
      }
    }

    if (curr) projects.push(curr);
    return projects;
  }

  static parseSimpleList(text = "") {
    if (!text.trim()) return [];
    return text
      .split(/[\n,;•·]/)
      .map((item) => item.replace(/^[-*•·–—\s]+/, "").trim())
      .filter((item) => item.length > 2 && item.length < 100);
  }

  static parseLanguages(text = "") {
    if (!text.trim()) return [];
    const candidates = text
      .split(/[\n,;•·]/)
      .map((item) => item.replace(/^[-*•·–—\s]+/, "").trim())
      .filter((item) => item.length > 2 && item.length < 35);
    return candidates;
  }
}

export default ResumeParser;
