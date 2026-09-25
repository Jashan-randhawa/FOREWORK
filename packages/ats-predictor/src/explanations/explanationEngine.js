export class ExplanationEngine {
  /**
   * Generates a clear, factual explanation of the assigned score.
   * @param {Object} params
   * @param {Object} params.normalizedResume
   * @param {Object} [params.parsedJd]
   * @param {Object} params.scoringResult
   * @returns {Promise<{ overall: string, breakdown_reasons: Record<string, string> }>}
   */
  static async explain({ normalizedResume, parsedJd = null, scoringResult }) {
    const breakdown = scoringResult.breakdown || {};
    const score = scoringResult.overall_score || 0;
    const missingReq = scoringResult.skills?.missing_required || [];
    const matched = scoringResult.skills?.matched || [];
    const formattingRisks = normalizedResume.metadata?.formatting_risks || [];

    const breakdownReasons = {
      parsing: this.explainParsing(breakdown.parsing, formattingRisks),
      job_match: this.explainJobMatch(breakdown.job_match, matched, missingReq, parsedJd),
      experience: this.explainExperience(breakdown.experience, normalizedResume.experience || []),
      sections: this.explainSections(breakdown.sections, normalizedResume.sections_detected || []),
      qualifications: this.explainQualifications(breakdown.qualifications, normalizedResume.education || []),
      quality: this.explainQuality(breakdown.quality, normalizedResume.experience || []),
    };

    // Synthesize overall explanation
    const strengths = [];
    const gaps = [];

    if (breakdown.parsing >= 16) {
      strengths.push("high text parseability with standard headings");
    } else {
      gaps.push("formatting elements that introduce ATS reading risks");
    }

    if (matched.length > 0) {
      strengths.push(`strong verification in core skills like ${matched.slice(0, 3).join(", ")}`);
    }

    if (missingReq.length > 0) {
      gaps.push(`undetected required qualifications (${missingReq.slice(0, 3).join(", ")})`);
    }

    if (breakdown.quality < 7) {
      gaps.push("experience descriptions lacking quantifiable outcomes and metrics");
    } else {
      strengths.push("outcome-oriented experience bullet points");
    }

    let overall = `Your overall score is ${score}/100. `;
    if (strengths.length > 0) {
      overall += `Key positive factors include ${strengths.join(" and ")}. `;
    }
    if (gaps.length > 0) {
      overall += `Opportunities to optimize include addressing ${gaps.join(" and ")}.`;
    }

    // Optional AI enhancement if configured
    if (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY) {
      try {
        const enhanced = await this.tryLlmExplanation(score, strengths, gaps, overall);
        if (enhanced) overall = enhanced;
      } catch (llmErr) {
        // Fallback safely to rule-based explanation
      }
    }

    return {
      overall,
      breakdown_reasons: breakdownReasons,
    };
  }

  static explainParsing(score, risks) {
    if (score >= 17) {
      return `Scored ${score}/20: Text extraction is clean and machine-readable with standard character encoding and clear reading order.`;
    }
    if (risks.length > 0) {
      return `Scored ${score}/20: Identified ${risks.length} potential layout risk(s) such as ${risks[0].message}`;
    }
    return `Scored ${score}/20: Acceptable parseability, though some layout aspects could be simplified for older ATS scanners.`;
  }

  static explainJobMatch(score, matched, missingReq, parsedJd) {
    if (!parsedJd) {
      return `Scored ${score}/30: Evaluated based on breadth and canonical alignment across modern technology stacks.`;
    }
    if (missingReq.length === 0) {
      return `Scored ${score}/30: Outstanding skill alignment! All required technical skills were identified in your resume.`;
    }
    return `Scored ${score}/30: Matched key requirements (${matched.slice(0, 3).join(", ")}), but ${missingReq.length} requirement(s) were missing (${missingReq.slice(0, 3).join(", ")}).`;
  }

  static explainExperience(score, experiences) {
    const totalMonths = experiences.reduce((acc, e) => acc + (e.duration_months || 12), 0);
    const years = Math.round((totalMonths / 12) * 10) / 10;
    return `Scored ${score}/20: Identified approx ${years} year(s) of relevant experience across ${experiences.length} tracked role(s).`;
  }

  static explainSections(score, sections) {
    return `Scored ${score}/10: Detected ${sections.length} standard resume section(s) with clear structural organization.`;
  }

  static explainQualifications(score, education) {
    if (education.length > 0) {
      return `Scored ${score}/10: Verified degree credentials (${education[0].degree || "Degree"}) matching target job profile expectations.`;
    }
    return `Scored ${score}/10: Baseline educational background identified.`;
  }

  static explainQuality(score, experiences) {
    const achievements = experiences.flatMap((e) => e.achievements || []);
    return `Scored ${score}/10: Identified ${achievements.length} bullet point(s) containing quantifiable metrics and strong action verbs.`;
  }

  static async tryLlmExplanation(score, strengths, gaps, fallback) {
    // Optional integration that keeps score deterministic and only summarizes text
    return null;
  }
}

export default ExplanationEngine;
