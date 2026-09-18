import { KeywordMatcher } from "../matching/keywordMatcher.js";
import { SemanticMatcher } from "../matching/semanticMatcher.js";

export const ALGORITHM_VERSION = "ats_v1.0";

export class ATSScoreEngine {
  /**
   * Calculates comprehensive deterministic scores and category breakdown.
   * @param {Object} params
   * @param {Object} params.normalizedResume
   * @param {Object} [params.parsedJd]
   * @returns {Object}
   */
  static evaluate({ normalizedResume, parsedJd = null }) {
    const { personal, experience, education, skills, sections_detected, metadata } = normalizedResume;

    // 1. Parseability Score (0–20)
    const parsingScore = this.calculateParsingScore(normalizedResume);

    // 2. Job Alignment Score (0–30)
    const { alignmentScore, keywordDetails, semanticDetails } = this.calculateAlignmentScore(
      normalizedResume,
      parsedJd
    );

    // 3. Experience Relevance Score (0–20)
    const experienceScore = this.calculateExperienceScore(normalizedResume, parsedJd, semanticDetails);

    // 4. Structure Score (0–10)
    const structureScore = this.calculateStructureScore(normalizedResume);

    // 5. Qualification Score (0–10)
    const qualificationScore = this.calculateQualificationScore(normalizedResume, parsedJd);

    // 6. Evidence / Quality Score (0–10)
    const qualityScore = this.calculateQualityScore(normalizedResume);

    // Total ATS Compatibility Score (measures parseability, structure, completeness, formatting, quality)
    // Normalized to 0-100
    const resumeCompleteness = Math.min(
      30,
      (skills.length >= 6 ? 12 : skills.length * 2) +
        (experience.length >= 2 ? 10 : experience.length * 5) +
        (education.length >= 1 ? 8 : 0)
    );
    const atsCompatibilityScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          parsingScore * 2.5 + // 0-50 pts
            structureScore * 2.0 + // 0-20 pts
            qualityScore * 1.5 + // 0-15 pts
            resumeCompleteness * 0.5 // 0-15 pts
        )
      )
    );

    // Job Match Score (measures required skills, preferred skills, experience, qualifications)
    let jobMatchScore = null;
    let overallScore = atsCompatibilityScore;

    if (parsedJd && (parsedJd.required_skills?.length > 0 || parsedJd.preferred_skills?.length > 0)) {
      // 0-100 Job Match: Alignment (30*2=60) + Experience (20*1.25=25) + Qualifications (10*1.5=15)
      jobMatchScore = Math.min(
        100,
        Math.max(
          0,
          Math.round(alignmentScore * 2.0 + experienceScore * 1.25 + qualificationScore * 1.5)
        )
      );

      // Product Overall Score (Parseability 20 + Alignment 30 + Experience 20 + Structure 10 + Quals 10 + Quality 10 = 100)
      overallScore = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            parsingScore +
              alignmentScore +
              experienceScore +
              structureScore +
              qualificationScore +
              qualityScore
          )
        )
      );
    }

    return {
      overall_score: overallScore,
      ats_compatibility_score: atsCompatibilityScore,
      job_match_score: jobMatchScore,
      breakdown: {
        parsing: Math.round(parsingScore * 10) / 10,
        job_match: Math.round(alignmentScore * 10) / 10,
        experience: Math.round(experienceScore * 10) / 10,
        sections: Math.round(structureScore * 10) / 10,
        qualifications: Math.round(qualificationScore * 10) / 10,
        quality: Math.round(qualityScore * 10) / 10,
      },
      skills: {
        matched: keywordDetails.allMatched,
        missing_required: keywordDetails.missingRequired,
        missing_preferred: keywordDetails.missingPreferred,
        all_missing: keywordDetails.allMissing,
      },
      semantic_overlap: semanticDetails.conceptOverlap,
      algorithm_version: ALGORITHM_VERSION,
    };
  }

  static calculateParsingScore(resume) {
    const meta = resume.metadata || {};
    let score = meta.formatting_score !== undefined ? meta.formatting_score : 20;

    // Contact completeness bonus/penalty
    const personal = resume.personal || {};
    let contactPoints = 0;
    if (personal.email) contactPoints += 1.5;
    if (personal.phone) contactPoints += 1.0;
    if (personal.name) contactPoints += 1.0;
    if (personal.linkedin || personal.github) contactPoints += 0.5;

    score = Math.min(20, Math.max(0, (score / 20) * 16 + contactPoints));
    return Math.round(score * 10) / 10;
  }

  static calculateAlignmentScore(resume, parsedJd) {
    if (!parsedJd) {
      // Baseline alignment based on skill diversity
      const count = resume.skills?.length || 0;
      const score = Math.min(30, Math.max(5, count * 2.5));
      return {
        alignmentScore: score,
        keywordDetails: {
          allMatched: resume.skills || [],
          missingRequired: [],
          missingPreferred: [],
          allMissing: [],
        },
        semanticDetails: {
          semanticScore: 0.8,
          conceptOverlap: [],
        },
      };
    }

    const keywordMatch = KeywordMatcher.match({
      resumeSkills: resume.skills || [],
      requiredSkills: parsedJd.required_skills || [],
      preferredSkills: parsedJd.preferred_skills || [],
    });

    const resumeBullets = (resume.experience || []).flatMap((e) => e.description || []);
    const semanticMatch = SemanticMatcher.compare({
      resumeBullets,
      jobResponsibilities: parsedJd.responsibilities || [],
      resumeSkills: resume.skills || [],
      jobSkills: [...(parsedJd.required_skills || []), ...(parsedJd.preferred_skills || [])],
    });

    // 80% Keyword overlap + 20% Semantic match boost
    const combinedScore = Math.min(30, keywordMatch.score * 0.85 + semanticMatch.semanticScore * 4.5);

    return {
      alignmentScore: combinedScore,
      keywordDetails: keywordMatch,
      semanticDetails: semanticMatch,
    };
  }

  static calculateExperienceScore(resume, parsedJd, semanticDetails) {
    const experiences = resume.experience || [];
    if (experiences.length === 0) return 3;

    let score = 0;

    // 1. Total duration (up to 8 points)
    const totalMonths = experiences.reduce((sum, e) => sum + (e.duration_months || 12), 0);
    const totalYears = totalMonths / 12;

    const requiredYears = parsedJd?.experience_requirements?.[0]?.minYears || 2;
    if (totalYears >= requiredYears) {
      score += 8;
    } else {
      score += Math.max(2, (totalYears / requiredYears) * 8);
    }

    // 2. Role titles & scope (up to 4 points)
    const hasClearRoles = experiences.some((e) => e.title && e.title !== "Role");
    if (hasClearRoles) score += 4;

    // 3. Technical responsibilities & semantic relevance (up to 5 points)
    score += (semanticDetails?.semanticScore || 0.7) * 5;

    // 4. Measurable outcomes present in experience (up to 3 points)
    const hasMetrics = experiences.some((e) => (e.achievements || []).length > 0);
    if (hasMetrics) score += 3;

    return Math.min(20, Math.max(0, score));
  }

  static calculateStructureScore(resume) {
    const detected = new Set(resume.sections_detected || []);
    let score = 0;

    if (resume.personal?.name && resume.personal?.email) score += 2; // Contact block
    if (detected.has("experience")) score += 3;
    if (detected.has("skills")) score += 2;
    if (detected.has("education")) score += 2;
    if (detected.has("projects") || detected.has("certifications") || detected.has("summary")) score += 1;

    return Math.min(10, Math.max(0, score));
  }

  static calculateQualificationScore(resume, parsedJd) {
    const education = resume.education || [];
    let score = 5; // default baseline

    if (education.length > 0) {
      const topDeg = education[0]?.degree?.toLowerCase() || "";
      if (topDeg.includes("ph.d") || topDeg.includes("doctor")) score = 10;
      else if (topDeg.includes("master") || topDeg.includes("m.s") || topDeg.includes("mba")) score = 9;
      else if (topDeg.includes("bachelor") || topDeg.includes("b.s") || topDeg.includes("b.tech")) score = 8;
      else score = 7;
    }

    // Certifications boost
    if ((resume.certifications || []).length > 0) {
      score = Math.min(10, score + 1);
    }

    return Math.min(10, Math.max(0, score));
  }

  static calculateQualityScore(resume) {
    const experiences = resume.experience || [];
    const allBullets = experiences.flatMap((e) => e.description || []);

    if (allBullets.length === 0) return 4;

    let score = 2; // baseline

    // Action verb presence (up to 3 points)
    const totalActionVerbs = experiences.reduce((sum, e) => sum + (e.action_verb_count || 0), 0);
    if (totalActionVerbs >= 5) score += 3;
    else if (totalActionVerbs >= 2) score += 2;
    else score += 1;

    // Measurable achievements (up to 3 points)
    const totalAchievements = experiences.reduce((sum, e) => sum + (e.achievements?.length || 0), 0);
    if (totalAchievements >= 3) score += 3;
    else if (totalAchievements >= 1) score += 2;

    // Bullet specificity & conciseness (up to 2 points)
    const wellFormedBullets = allBullets.filter((b) => b.length >= 30 && b.length <= 250);
    if (wellFormedBullets.length / allBullets.length > 0.6) {
      score += 2;
    } else {
      score += 1;
    }

    return Math.min(10, Math.max(0, score));
  }
}

export default ATSScoreEngine;
