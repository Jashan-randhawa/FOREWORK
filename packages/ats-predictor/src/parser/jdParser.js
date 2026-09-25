import { SkillExtractor } from "../extraction/skillExtractor.js";

export class JobDescriptionParser {
  /**
   * Parses a raw job description text into structured requirements.
   * @param {string} jdText
   * @param {string} [knownTitle]
   * @returns {Object} Structured Job Description JSON
   */
  static parse(jdText = "", knownTitle = "") {
    if (!jdText || typeof jdText !== "string") {
      return {
        job_title: knownTitle || "Position",
        required_skills: [],
        preferred_skills: [],
        experience_requirements: [],
        education_requirements: [],
        certifications: [],
        responsibilities: [],
      };
    }

    const lines = jdText.split("\n").map((l) => l.trim()).filter(Boolean);

    const jobTitle = knownTitle || this.extractJobTitle(lines);
    const sections = this.segmentJdSections(lines);

    // Extract skills from required section vs preferred section
    const requiredText = sections.required.join("\n");
    const preferredText = sections.preferred.join("\n");
    const otherText = [...sections.responsibilities, ...sections.general].join("\n");

    const requiredSkillObj = SkillExtractor.extract(requiredText);
    const preferredSkillObj = SkillExtractor.extract(preferredText);
    const otherSkillObj = SkillExtractor.extract(otherText);

    const requiredSkillsSet = new Set(requiredSkillObj.skills);
    const preferredSkillsSet = new Set(preferredSkillObj.skills);

    // If an explicit required section exists, only add general skills that aren't already preferred
    if (sections.required.length > 0) {
      for (const skill of otherSkillObj.skills) {
        if (!preferredSkillsSet.has(skill)) {
          requiredSkillsSet.add(skill);
        }
      }
    } else {
      for (const skill of otherSkillObj.skills) {
        if (!preferredSkillsSet.has(skill)) {
          requiredSkillsSet.add(skill);
        }
      }
    }

    // Ensure preferred skills don't collide with required
    for (const skill of requiredSkillsSet) {
      preferredSkillsSet.delete(skill);
    }

    const experienceRequirements = this.extractExperienceRequirements(jdText);
    const educationRequirements = this.extractEducationRequirements(jdText);
    const certifications = this.extractCertifications(jdText);

    return {
      job_title: jobTitle,
      required_skills: Array.from(requiredSkillsSet).sort(),
      preferred_skills: Array.from(preferredSkillsSet).sort(),
      experience_requirements: experienceRequirements,
      education_requirements: educationRequirements,
      certifications,
      responsibilities: sections.responsibilities.slice(0, 10),
    };
  }

  static extractJobTitle(lines = []) {
    const titleRegex = /(?:software\s+engineer|frontend\s+developer|backend\s+developer|full\s*stack\s+developer|web\s+developer|devops\s+engineer|data\s+scientist|machine\s+learning\s+engineer|product\s+manager|system\s+architect|cloud\s+architect|qa\s+engineer|mobile\s+developer)/i;

    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (titleRegex.test(line) && line.length < 60) {
        return line.replace(/^job\s+title[:\s]*/i, "").trim();
      }
    }

    if (lines.length > 0 && lines[0].length < 50 && !lines[0].includes(".")) {
      return lines[0].replace(/^job\s+title[:\s]*/i, "").trim();
    }

    return "Role Opening";
  }

  static segmentJdSections(lines = []) {
    const sections = {
      required: [],
      preferred: [],
      responsibilities: [],
      general: [],
    };

    let currentSection = "general";

    for (const line of lines) {
      const lower = line.toLowerCase().replace(/[:\-–—\s]+$/, "");

      if (
        /(?:preferred|nice\s+to\s+have|bonus|desired|plus)/i.test(lower) &&
        lower.length < 40 &&
        !line.startsWith("-") &&
        !line.startsWith("*")
      ) {
        currentSection = "preferred";
        continue;
      }

      if (
        /(?:requirements?|qualifications?|must\s+have|required\s+skills|minimum\s+qualifications)/i.test(
          lower
        ) &&
        lower.length < 40 &&
        !line.startsWith("-") &&
        !line.startsWith("*")
      ) {
        currentSection = "required";
        continue;
      }

      if (
        /(?:responsibilities|what\s+you\s+(?:will\s+)?do|duties|role\s+overview)/i.test(lower) &&
        lower.length < 40 &&
        !line.startsWith("-") &&
        !line.startsWith("*")
      ) {
        currentSection = "responsibilities";
        continue;
      }

      sections[currentSection].push(line);
    }

    return sections;
  }

  static extractExperienceRequirements(text = "") {
    const expRegex = /\b(\d+)\+?\s*(?:to\s*(\d+))?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+[\w\-]+){0,5}\s+experience\b/gi;
    const matches = [];
    let match;

    while ((match = expRegex.exec(text)) !== null) {
      const minYears = parseInt(match[1], 10);
      const maxYears = match[2] ? parseInt(match[2], 10) : minYears;
      matches.push({
        raw: match[0],
        minYears,
        maxYears,
      });
    }

    return matches;
  }

  static extractEducationRequirements(text = "") {
    const eduRegex = /\b(?:bachelor'?s?|master'?s?|ph\.?d\.?|b\.?s\.?|b\.?tech|m\.?s\.?|degree\s+in\s+computer\s+science|equivalent\s+experience)\b[^\n.]*/gi;
    const matches = text.match(eduRegex) || [];
    return Array.from(new Set(matches.map((m) => m.trim()))).slice(0, 3);
  }

  static extractCertifications(text = "") {
    const certRegex = /\b(?:aws\s+certified|azure\s+certified|gcp\s+certified|pmp|cissp|cka|ckad|comptia)\b[^\n,.]*/gi;
    const matches = text.match(certRegex) || [];
    return Array.from(new Set(matches.map((m) => m.trim())));
  }
}

export default JobDescriptionParser;
