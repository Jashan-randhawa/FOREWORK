/**
 * @jashan-randhawa/ats-predictor
 * Enterprise-grade, deterministic, and explainable ATS resume parser and job match predictor.
 */

// Parsers
export { ResumeParser } from "./src/parser/resumeParser.js";
export { JobDescriptionParser } from "./src/parser/jdParser.js";
export { DocumentExtractor } from "./src/parser/documentExtractor.js";

// Extraction
export { SectionDetector, CANONICAL_SECTIONS } from "./src/extraction/sectionDetector.js";
export { ContactExtractor } from "./src/extraction/contactExtractor.js";
export { ExperienceExtractor } from "./src/extraction/experienceExtractor.js";
export { EducationExtractor } from "./src/extraction/educationExtractor.js";
export { SkillExtractor } from "./src/extraction/skillExtractor.js";
export { CANONICAL_SKILLS, CANONICAL_ALIAS_MAP } from "./src/extraction/skillTaxonomy.js";
export { FormattingAnalyzer } from "./src/extraction/formattingAnalyzer.js";

// Matching & Scoring
export { KeywordMatcher } from "./src/matching/keywordMatcher.js";
export { SemanticMatcher } from "./src/matching/semanticMatcher.js";
export { ATSScoreEngine } from "./src/scoring/atsScoreEngine.js";

// Recommendations & Explanations
export { RecommendationEngine } from "./src/recommendations/recommendationEngine.js";
export { ExplanationEngine } from "./src/explanations/explanationEngine.js";

// Errors
export { ATSError } from "./src/errors/AppError.js";

/**
 * Convenience all-in-one analysis helper.
 * @param {Object} options
 * @param {Buffer} [options.resumeBuffer] - PDF, DOCX, or TXT buffer
 * @param {string} [options.resumeText] - Raw text of resume
 * @param {string} [options.resumeUrl] - URL of resume document
 * @param {string} [options.jobDescription] - Target job description text
 * @returns {Promise<Object>} Full evaluation score, breakdown, skill comparison, and recommendations
 */
export async function analyzeResume({ resumeBuffer, resumeText, resumeUrl, jobDescription } = {}) {
  const { ResumeParser } = await import("./src/parser/resumeParser.js");
  const { JobDescriptionParser } = await import("./src/parser/jdParser.js");
  const { ATSScoreEngine } = await import("./src/scoring/atsScoreEngine.js");
  const { RecommendationEngine } = await import("./src/recommendations/recommendationEngine.js");
  const { ExplanationEngine } = await import("./src/explanations/explanationEngine.js");

  const normalizedResume = await ResumeParser.parse({
    buffer: resumeBuffer,
    rawText: resumeText,
    url: resumeUrl,
  });

  const parsedJd = jobDescription
    ? JobDescriptionParser.parse(
        typeof jobDescription === "string" ? jobDescription : jobDescription.rawText || ""
      )
    : null;
  const evaluation = ATSScoreEngine.evaluate({ normalizedResume, parsedJd });
  const recommendations = RecommendationEngine.generate({
    normalizedResume,
    parsedJd,
    scoringResult: evaluation,
  });
  const explanation = await ExplanationEngine.explain({
    normalizedResume,
    parsedJd,
    scoringResult: evaluation,
  });

  return {
    ...evaluation,
    normalized_resume: normalizedResume,
    recommendations,
    explanation: explanation.overall,
    breakdown_reasons: explanation.breakdown_reasons,
  };
}
