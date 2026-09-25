/**
 * Canonical section types supported by FOREWORK ATS
 */
export const CANONICAL_SECTIONS = {
  SUMMARY: "summary",
  EXPERIENCE: "experience",
  EDUCATION: "education",
  SKILLS: "skills",
  PROJECTS: "projects",
  CERTIFICATIONS: "certifications",
  AWARDS: "awards",
  LANGUAGES: "languages",
  PUBLICATIONS: "publications",
  VOLUNTEER: "volunteer",
};

/**
 * Common variations and aliases mapping to canonical sections
 */
const SECTION_PATTERNS = [
  {
    type: CANONICAL_SECTIONS.SUMMARY,
    regex: /^(?:professional\s+summary|career\s+summary|executive\s+summary|summary\s+of\s+qualifications|profile|about\s+me|personal\s+statement|career\s+objective|objective|summary)$/i,
  },
  {
    type: CANONICAL_SECTIONS.EXPERIENCE,
    regex: /^(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|experience|career\s+history|professional\s+background|relevant\s+experience|internships|internship\s+experience)$/i,
  },
  {
    type: CANONICAL_SECTIONS.EDUCATION,
    regex: /^(?:education|academic\s+background|educational\s+qualifications|academics|degrees|academic\s+history)$/i,
  },
  {
    type: CANONICAL_SECTIONS.SKILLS,
    regex: /^(?:technical\s+skills|skills\s*(?:&|and)\s*technologies|core\s+competencies|technologies|skills\s*(?:&|and)\s*tools|key\s+skills|programming\s+languages|technical\s+expertise|skills)$/i,
  },
  {
    type: CANONICAL_SECTIONS.PROJECTS,
    regex: /^(?:personal\s+projects|academic\s+projects|key\s+projects|technical\s+projects|notable\s+projects|portfolio\s+projects|projects)$/i,
  },
  {
    type: CANONICAL_SECTIONS.CERTIFICATIONS,
    regex: /^(?:certifications\s*(?:&|and)\s*licenses|certifications|certificates|licenses|courses\s*(?:&|and)\s*certifications)$/i,
  },
  {
    type: CANONICAL_SECTIONS.AWARDS,
    regex: /^(?:honors\s*(?:&|and)\s*awards|awards\s*(?:&|and)\s*achievements|awards|honors|accomplishments|achievements)$/i,
  },
  {
    type: CANONICAL_SECTIONS.LANGUAGES,
    regex: /^(?:languages\s+known|languages|language\s+proficiencies)$/i,
  },
  {
    type: CANONICAL_SECTIONS.PUBLICATIONS,
    regex: /^(?:publications|research\s+papers|patents|published\s+works)$/i,
  },
  {
    type: CANONICAL_SECTIONS.VOLUNTEER,
    regex: /^(?:volunteer\s+experience|community\s+service|leadership\s*(?:&|and)\s*activities|extracurricular\s+activities|volunteering)$/i,
  },
];

export class SectionDetector {
  /**
   * Identifies sections, detects headings, and splits document text into section blocks.
   * @param {string} text
   * @returns {{ sectionsDetected: string[], sections: Record<string, string>, rawBlocks: Array<{ title: string, type: string, content: string }> }}
   */
  static detect(text = "") {
    if (!text || typeof text !== "string") {
      return {
        sectionsDetected: [],
        sections: {},
        rawBlocks: [],
      };
    }

    const lines = text.split("\n");
    const detectedHeadings = [];

    // Identify candidate heading lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Clean line for match: strip leading symbols, bullets, numbers, trailing colons or dashes
      const cleanLine = line
        .replace(/^[\d#.*•\-–—\s]+/, "")
        .replace(/[:\-–—\s]+$/, "")
        .trim();

      if (cleanLine.length < 3 || cleanLine.length > 50) continue;

      // Check if matches a known section pattern
      for (const pattern of SECTION_PATTERNS) {
        if (pattern.regex.test(cleanLine)) {
          detectedHeadings.push({
            index: i,
            rawHeading: line,
            cleanHeading: cleanLine,
            type: pattern.type,
          });
          break;
        }
      }
    }

    // Deduplicate consecutive identical types or near headings
    const filteredHeadings = [];
    for (let i = 0; i < detectedHeadings.length; i++) {
      const current = detectedHeadings[i];
      const prev = filteredHeadings[filteredHeadings.length - 1];
      if (!prev || prev.type !== current.type) {
        filteredHeadings.push(current);
      }
    }

    const sections = {};
    const rawBlocks = [];
    const sectionsDetected = [];

    // Header block (before first detected section)
    const firstSectionIndex = filteredHeadings.length > 0 ? filteredHeadings[0].index : lines.length;
    const headerContent = lines.slice(0, firstSectionIndex).join("\n").trim();
    if (headerContent) {
      sections["header"] = headerContent;
    }

    // Extract content under each detected heading
    for (let i = 0; i < filteredHeadings.length; i++) {
      const curr = filteredHeadings[i];
      const next = filteredHeadings[i + 1];
      const startLine = curr.index + 1;
      const endLine = next ? next.index : lines.length;

      const blockContent = lines.slice(startLine, endLine).join("\n").trim();

      if (!sectionsDetected.includes(curr.type)) {
        sectionsDetected.push(curr.type);
      }

      sections[curr.type] = sections[curr.type]
        ? `${sections[curr.type]}\n\n${blockContent}`
        : blockContent;

      rawBlocks.push({
        title: curr.rawHeading,
        type: curr.type,
        content: blockContent,
      });
    }

    return {
      sectionsDetected,
      sections,
      rawBlocks,
    };
  }
}

export default SectionDetector;
