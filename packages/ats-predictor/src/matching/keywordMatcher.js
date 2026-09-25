import { SkillExtractor } from "../extraction/skillExtractor.js";

export class KeywordMatcher {
  /**
   * Evaluates skill overlap between normalized resume and job description.
   * @param {Object} params
   * @param {string[]} params.resumeSkills
   * @param {string[]} params.requiredSkills
   * @param {string[]} params.preferredSkills
   * @returns {Object}
   */
  static match({ resumeSkills = [], requiredSkills = [], preferredSkills = [] }) {
    // Canonicalize all skill sets
    const resumeSkillSet = new Set(resumeSkills.map((s) => SkillExtractor.normalizeSkill(s)));

    const matchedRequired = [];
    const missingRequired = [];

    for (const reqSkill of requiredSkills) {
      const canonical = SkillExtractor.normalizeSkill(reqSkill);
      if (resumeSkillSet.has(canonical)) {
        matchedRequired.push(canonical);
      } else {
        missingRequired.push(canonical);
      }
    }

    const matchedPreferred = [];
    const missingPreferred = [];

    for (const prefSkill of preferredSkills) {
      const canonical = SkillExtractor.normalizeSkill(prefSkill);
      if (resumeSkillSet.has(canonical)) {
        matchedPreferred.push(canonical);
      } else {
        missingPreferred.push(canonical);
      }
    }

    const requiredTotal = requiredSkills.length;
    const preferredTotal = preferredSkills.length;

    const requiredRatio = requiredTotal > 0 ? matchedRequired.length / requiredTotal : 1.0;
    const preferredRatio = preferredTotal > 0 ? matchedPreferred.length / preferredTotal : 1.0;

    // Weight required skills at 75% of Job Alignment (22.5 pts) and preferred at 25% (7.5 pts)
    let score = 0;
    if (requiredTotal > 0 && preferredTotal > 0) {
      score = requiredRatio * 22.5 + preferredRatio * 7.5;
    } else if (requiredTotal > 0) {
      score = requiredRatio * 30;
    } else if (preferredTotal > 0) {
      score = preferredRatio * 30;
    } else {
      // Resume-only or empty JD skills: baseline score from resume skill richness
      score = Math.min(30, resumeSkills.length * 3);
    }

    return {
      score: Math.round(score * 10) / 10,
      maxScore: 30,
      matchedRequired,
      missingRequired,
      matchedPreferred,
      missingPreferred,
      allMatched: Array.from(new Set([...matchedRequired, ...matchedPreferred])),
      allMissing: Array.from(new Set([...missingRequired, ...missingPreferred])),
      requiredRatio: Math.round(requiredRatio * 100) / 100,
      preferredRatio: Math.round(preferredRatio * 100) / 100,
    };
  }
}

export default KeywordMatcher;
