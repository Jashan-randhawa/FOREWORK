import { SKILL_TAXONOMY, CANONICAL_ALIAS_MAP } from "./skillTaxonomy.js";

export class SkillExtractor {
  /**
   * Extracts canonical skills from any text block (resume or job description).
   * @param {string} text
   * @param {string} [skillsSectionText]
   * @returns {{ skills: string[], categorized: Record<string, string[]>, count: number }}
   */
  static extract(text = "", skillsSectionText = "") {
    const detectedCanonical = new Set();
    const normalizedText = ` ${text.toLowerCase()} `;
    const skillsSectionLower = skillsSectionText ? ` ${skillsSectionText.toLowerCase()} ` : "";

    for (const item of SKILL_TAXONOMY) {
      const canonicalName = item.name;
      const termsToSearch = [item.name, ...(item.aliases || [])];

      let found = false;

      for (const term of termsToSearch) {
        const lowerTerm = term.toLowerCase();

        // Special boundary handling for symbols: C++, C#, CI/CD
        if (lowerTerm === "c++") {
          if (/(?:^|[\s,;/()|])c\+\+(?:[\s,;/()|.]|$)/i.test(text)) {
            found = true;
            break;
          }
        } else if (lowerTerm === "c#") {
          if (/(?:^|[\s,;/()|])c#(?:[\s,;/()|.]|$)/i.test(text)) {
            found = true;
            break;
          }
        } else if (lowerTerm === "ci/cd" || lowerTerm === "cicd") {
          if (/(?:^|[\s,;()|])ci\/cd(?:[\s,;()|.]|$)/i.test(text) || /(?:^|[\s,;()|])cicd(?:[\s,;()|.]|$)/i.test(text)) {
            found = true;
            break;
          }
        } else if (lowerTerm === "c") {
          // Exact match for C language requires strict context
          if (
            /(?:^|[\s,;/()|])c(?:\s+programming|\s+language)?(?:[\s,;/()|.]|$)/i.test(
              skillsSectionText || text
            ) &&
            /(?:c\s*\/\s*c\+\+|c\s*,\s*c\+\+|c\s+and\s+c\+\+|c\s+programming)/i.test(text)
          ) {
            found = true;
            break;
          }
        } else if (lowerTerm === "go") {
          // Go programming language
          if (
            /(?:^|[\s,;/()|])golang(?:[\s,;/()|.]|$)/i.test(text) ||
            /(?:^|[\s,;/()|])go(?:\s+programming|\s+language)?(?:[\s,;/()|.]|$)/i.test(
              skillsSectionText
            )
          ) {
            found = true;
            break;
          }
        } else if (lowerTerm === "r") {
          if (/(?:^|[\s,;/()|])r(?:\s+programming|\s+language)?(?:[\s,;/()|.]|$)/i.test(skillsSectionText)) {
            found = true;
            break;
          }
        } else {
          // Multi-word or standard single-word terms: word boundary match allowing standard punctuation
          const escaped = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`(?:^|[\\s,;/:()!?"'\\-])` + escaped + `(?:[\\s,;/:()!?"'\\-.]|$)`, "i");

          if (regex.test(normalizedText) || (skillsSectionLower && regex.test(skillsSectionLower))) {
            found = true;
            break;
          }
        }
      }

      if (found) {
        detectedCanonical.add(canonicalName);
      }
    }

    // Also parse explicit comma/bullet separated items from skills section if present
    if (skillsSectionText) {
      const manualTokens = skillsSectionText
        .split(/[\n,;•|·]/)
        .map((t) => t.trim().replace(/^[-*•\s]+/, ""))
        .filter((t) => t.length >= 2 && t.length <= 40);

      for (const token of manualTokens) {
        const lower = token.toLowerCase();
        if (CANONICAL_ALIAS_MAP.has(lower)) {
          detectedCanonical.add(CANONICAL_ALIAS_MAP.get(lower));
        }
      }
    }

    const skillsArray = Array.from(detectedCanonical).sort();

    // Group into categories
    const categorized = {};
    for (const skillName of skillsArray) {
      const meta = SKILL_TAXONOMY.find((s) => s.name === skillName);
      const cat = meta ? meta.category : "General";
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(skillName);
    }

    return {
      skills: skillsArray,
      categorized,
      count: skillsArray.length,
    };
  }

  /**
   * Normalizes an individual skill query or alias to canonical form.
   * @param {string} skill
   * @returns {string}
   */
  static normalizeSkill(skill = "") {
    if (!skill) return "";
    const lower = skill.trim().toLowerCase();
    return CANONICAL_ALIAS_MAP.get(lower) || skill.trim();
  }
}

export default SkillExtractor;
