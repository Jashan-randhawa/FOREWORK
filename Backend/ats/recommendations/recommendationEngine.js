export class RecommendationEngine {
  /**
   * Produces evidence-based, prioritized, actionable suggestions.
   * @param {Object} params
   * @param {Object} params.normalizedResume
   * @param {Object} [params.parsedJd]
   * @param {Object} params.scoringResult
   * @returns {Array<{ priority: string, category: string, title: string, description: string, actionable_tip: string }>}
   */
  static generate({ normalizedResume, parsedJd = null, scoringResult }) {
    const recommendations = [];
    const meta = normalizedResume.metadata || {};
    const missingRequired = scoringResult.skills?.missing_required || [];
    const missingPreferred = scoringResult.skills?.missing_preferred || [];
    const breakdown = scoringResult.breakdown || {};

    // 1. Critical Formatting / Scanned Document Issues
    if (meta.is_scanned_pdf) {
      recommendations.push({
        priority: "CRITICAL",
        category: "Machine Readability",
        title: "Export Machine-Readable Resume",
        description: "The uploaded PDF appears to be an image scan. ATS parsers cannot extract selectable text from pure image documents.",
        actionable_tip: "Re-export your document directly from your word processor (Google Docs, Microsoft Word, or LaTeX) as a PDF with selectable text.",
      });
    }

    // 2. High Priority: Missing Required Skills
    if (missingRequired.length > 0) {
      const topMissing = missingRequired.slice(0, 4);
      recommendations.push({
        priority: "HIGH",
        category: "Required Qualifications",
        title: `Demonstrate Key Required Skills (${topMissing.join(", ")})`,
        description: `The job posting explicitly requires ${topMissing.join(", ")}, which were not detected in your resume.`,
        actionable_tip: `If you have genuine, hands-on experience with ${topMissing.join(", ")}, explicitly add them to your Skills section and highlight how you applied them in your experience bullet points. (Do not list skills you have not used).`,
      });
    }

    // 3. High Priority: Missing Contact Information
    if (!normalizedResume.personal?.email) {
      recommendations.push({
        priority: "HIGH",
        category: "Contact Details",
        title: "Add Direct Email Address",
        description: "An email address was not detected in your resume header.",
        actionable_tip: "Place your professional email clearly at the very top of page 1 so recruiter systems can link your profile.",
      });
    }

    // 4. Medium Priority: Measurable Outcomes & Metrics
    const totalAchievements = (normalizedResume.experience || []).flatMap((e) => e.achievements || []).length;
    if (totalAchievements < 2) {
      recommendations.push({
        priority: "MEDIUM",
        category: "Impact & Evidence",
        title: "Quantify Experience Achievements",
        description: "Your experience bullets describe responsibilities well, but contain few quantified business or technical outcomes.",
        actionable_tip: "Incorporate metrics such as percentage performance improvements (e.g. 'reduced latency by 25%'), scale (e.g. 'serving 50k DAUs'), or cost savings where factual.",
      });
    }

    // 5. Medium Priority: Action Verbs
    const totalActionVerbs = (normalizedResume.experience || []).reduce(
      (acc, e) => acc + (e.action_verb_count || 0),
      0
    );
    if (totalActionVerbs < 4) {
      recommendations.push({
        priority: "MEDIUM",
        category: "Content Quality",
        title: "Start Bullets with Strong Action Verbs",
        description: "Experience bullet points benefit from active, outcome-oriented phrasing rather than passive task descriptions.",
        actionable_tip: "Begin each bullet with verbs like 'Architected', 'Spearheaded', 'Optimized', 'Engineered', or 'Delivered'.",
      });
    }

    // 6. Low Priority: Missing Preferred Skills
    if (missingPreferred.length > 0) {
      const topPref = missingPreferred.slice(0, 3);
      recommendations.push({
        priority: "LOW",
        category: "Bonus Skills",
        title: `Optional Alignment: ${topPref.join(", ")}`,
        description: `These skills are listed as preferred or 'nice-to-have' for the role: ${topPref.join(", ")}.`,
        actionable_tip: "If you have project or academic exposure to these technologies, consider noting them in your projects or continuous learning section.",
      });
    }

    // 7. Low Priority: Layout / Multi-column Warnings
    const hasColumnRisk = (meta.formatting_risks || []).some((r) => r.code === "MULTI_COLUMN_OR_TABLES");
    if (hasColumnRisk) {
      recommendations.push({
        priority: "LOW",
        category: "Layout Optimization",
        title: "Simplify Multi-Column Formatting",
        description: "Complex table grids or side-by-side columns can occasionally cause older ATS engines to merge lines in the wrong order.",
        actionable_tip: "A clean single-column format with clear heading breaks provides the safest compatibility across all ATS software vendors.",
      });
    }

    // Default recommendation if resume is already top-notch
    if (recommendations.length === 0) {
      recommendations.push({
        priority: "LOW",
        category: "General Optimization",
        title: "Excellent Profile Alignment",
        description: "Your resume demonstrates high machine-readability and strong skill alignment.",
        actionable_tip: "Review role-specific keywords periodically to ensure recent technologies and achievements remain up to date.",
      });
    }

    return recommendations;
  }
}

export default RecommendationEngine;
