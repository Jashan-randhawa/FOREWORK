import { SkillExtractor } from "./skillExtractor.js";

const ACTION_VERBS = new Set([
  "accelerated", "achieved", "architected", "automated", "built", "championed",
  "collaborated", "constructed", "created", "decreased", "delivered", "deployed",
  "designed", "developed", "directed", "engineered", "enhanced", "established",
  "executed", "expanded", "expedited", "formulated", "founded", "generated",
  "guided", "implemented", "improved", "increased", "initiated", "innovated",
  "instituted", "integrated", "launched", "lead", "led", "managed", "maximized",
  "migrated", "minimized", "modernized", "negotiated", "optimized", "orchestrated",
  "overhauled", "pioneered", "planned", "produced", "programmed", "reduced",
  "refactored", "resolved", "revamped", "scaled", "simplified", "spearheaded",
  "standardized", "streamlined", "strengthened", "supervised", "transformed",
  "unified", "upgraded",
]);

const MONTH_NAMES = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export class ExperienceExtractor {
  /**
   * Extracts structured experience entries from experience section text or full text.
   * @param {string} experienceText
   * @returns {Array<Object>}
   */
  static extract(experienceText = "") {
    if (!experienceText || experienceText.trim().length === 0) {
      return [];
    }

    const lines = experienceText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Identify candidate job entry start lines (lines that contain date ranges)
    const entryIndices = [];
    const dateRangeRegex = /(?:(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|\d{1,2}\/)?\s*(?:19|20)\d{2})\s*(?:-|–|—|to)\s*(?:present|current|now|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|\d{1,2}\/)?\s*(?:19|20)\d{2})/i;

    for (let i = 0; i < lines.length; i++) {
      if (dateRangeRegex.test(lines[i])) {
        // Look 1-2 lines before or current line for title/company
        const startIndex = Math.max(0, i - 1);
        if (!entryIndices.includes(startIndex)) {
          entryIndices.push(startIndex);
        }
      }
    }

    // If no explicit date ranges found, fall back to parsing bullet groups or empty line blocks
    if (entryIndices.length === 0) {
      return this.parseGenericBlocks(lines);
    }

    const entries = [];
    for (let k = 0; k < entryIndices.length; k++) {
      const startIdx = entryIndices[k];
      const endIdx = k + 1 < entryIndices.length ? entryIndices[k + 1] : lines.length;
      const blockLines = lines.slice(startIdx, endIdx);

      const parsed = this.parseExperienceBlock(blockLines);
      if (parsed) {
        entries.push(parsed);
      }
    }

    return entries;
  }

  static parseExperienceBlock(blockLines = []) {
    if (blockLines.length === 0) return null;

    let company = "";
    let title = "";
    let dateStr = "";
    const description = [];
    const achievements = [];
    let actionVerbCount = 0;

    const dateRangeRegex = /(?:(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|\d{1,2}\/)?\s*(?:19|20)\d{2})\s*(?:-|–|—|to)\s*(?:present|current|now|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|\d{1,2}\/)?\s*(?:19|20)\d{2})/i;

    let headerLinesCount = 0;

    for (let i = 0; i < Math.min(3, blockLines.length); i++) {
      const line = blockLines[i];
      const dateMatch = line.match(dateRangeRegex);

      if (dateMatch) {
        dateStr = dateMatch[0];
        headerLinesCount = Math.max(headerLinesCount, i + 1);

        // Check if title or company is before the date on the same line
        const beforeDate = line.slice(0, dateMatch.index).replace(/[,|–-]/g, " ").trim();
        if (beforeDate && !company && !title) {
          company = beforeDate;
        }
      } else if (!title && /(engineer|developer|architect|manager|lead|intern|designer|specialist|analyst|administrator|consultant|director|vp|scientist)/i.test(line)) {
        title = line.replace(/[,|]/g, " ").trim();
        headerLinesCount = Math.max(headerLinesCount, i + 1);
      } else if (!company) {
        company = line.replace(/[,|]/g, " ").trim();
        headerLinesCount = Math.max(headerLinesCount, i + 1);
      }
    }

    // Remaining lines are bullet points / description
    const contentLines = blockLines.slice(headerLinesCount);
    for (const rawLine of contentLines) {
      const cleanLine = rawLine.replace(/^[-*•·–—\s]+/, "").trim();
      if (!cleanLine) continue;

      description.push(cleanLine);

      // Check for action verbs
      const firstWord = cleanLine.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
      if (ACTION_VERBS.has(firstWord)) {
        actionVerbCount++;
      }

      // Check for measurable metrics (% or numbers or metrics)
      if (
        /\b(?:\d+%\b|\d+x\b|\$\d+|\d+\s*(?:k|m|million|billion|users|customers|requests|transactions|ms|seconds|minutes|hours))/i.test(
          cleanLine
        )
      ) {
        achievements.push(cleanLine);
      }
    }

    const { startDate, endDate, isCurrent, durationMonths } = this.parseDateRange(dateStr);
    const fullBlockText = blockLines.join(" ");
    const { skills } = SkillExtractor.extract(fullBlockText);

    return {
      company: company || "Organization",
      title: title || "Role",
      start_date: startDate,
      end_date: endDate,
      is_current: isCurrent,
      duration_months: durationMonths,
      description,
      skills,
      achievements,
      action_verb_count: actionVerbCount,
    };
  }

  static parseDateRange(dateStr = "") {
    if (!dateStr) {
      return { startDate: "", endDate: "", isCurrent: false, durationMonths: 0 };
    }

    const parts = dateStr.split(/(?:-|–|—|to)/i).map((s) => s.trim());
    const startRaw = parts[0] || "";
    const endRaw = parts[1] || "";

    const isCurrent = /present|current|now/i.test(endRaw);

    const startYear = startRaw.match(/(?:19|20)\d{2}/)?.[0] || "";
    const startMonth = this.extractMonthNumber(startRaw);

    let endYear = endRaw.match(/(?:19|20)\d{2}/)?.[0] || "";
    let endMonth = this.extractMonthNumber(endRaw);

    if (isCurrent) {
      const now = new Date();
      endYear = `${now.getFullYear()}`;
      endMonth = now.getMonth() + 1;
    }

    let durationMonths = 0;
    if (startYear) {
      const sY = parseInt(startYear, 10);
      const eY = endYear ? parseInt(endYear, 10) : sY + 1;
      const sM = startMonth || 1;
      const eM = endMonth || 12;
      durationMonths = Math.max(1, (eY - sY) * 12 + (eM - sM));
    }

    return {
      startDate: startYear ? `${startYear}-${String(startMonth || 1).padStart(2, "0")}` : startRaw,
      endDate: isCurrent ? "Present" : endYear ? `${endYear}-${String(endMonth || 12).padStart(2, "0")}` : endRaw,
      isCurrent,
      durationMonths,
    };
  }

  static extractMonthNumber(str = "") {
    const lower = str.toLowerCase();
    for (const [name, num] of Object.entries(MONTH_NAMES)) {
      if (lower.includes(name)) return num;
    }
    return 1;
  }

  static parseGenericBlocks(lines = []) {
    const bullets = lines.map((l) => l.replace(/^[-*•·\s]+/, "").trim()).filter(Boolean);
    if (bullets.length === 0) return [];

    const text = bullets.join(" ");
    const { skills } = SkillExtractor.extract(text);

    return [
      {
        company: "Organization",
        title: "Role Experience",
        start_date: "",
        end_date: "",
        is_current: false,
        duration_months: 12,
        description: bullets,
        skills,
        achievements: bullets.filter((b) => /\d+[%x$]|\b\d+\s*(?:k|m|users|ms)\b/i.test(b)),
        action_verb_count: bullets.filter((b) => {
          const w = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
          return ACTION_VERBS.has(w);
        }).length,
      },
    ];
  }
}

export default ExperienceExtractor;
