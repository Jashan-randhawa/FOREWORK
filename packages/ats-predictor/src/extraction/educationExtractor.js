const DEGREE_PATTERNS = [
  {
    regex: /\b(?:ph\.?d\.?|doctor\s+of\s+philosophy|doctorate)\b/i,
    degree: "Ph.D.",
    level: 5,
  },
  {
    regex: /\b(?:m\.?s\.?|master\s+of\s+science|m\.?tech\.?|master\s+of\s+technology|m\.?a\.?|master\s+of\s+arts|mba|master\s+of\s+business\s+administration|m\.?eng\.?|masters?)\b/i,
    degree: "Master's Degree",
    level: 4,
  },
  {
    regex: /\b(?:b\.?s\.?|bachelor\s+of\s+science|b\.?tech\.?|bachelor\s+of\s+technology|b\.?e\.?|bachelor\s+of\s+engineering|b\.?a\.?|bachelor\s+of\s+arts|b\.?c\.?a\.?|bachelors?)\b/i,
    degree: "Bachelor's Degree",
    level: 3,
  },
  {
    regex: /\b(?:associate\s+degree|associate\s+of\s+science|associate\s+of\s+arts|a\.?s\.?|a\.?a\.?)\b/i,
    degree: "Associate Degree",
    level: 2,
  },
  {
    regex: /\b(?:high\s+school|diploma|ged)\b/i,
    degree: "High School Diploma",
    level: 1,
  },
];

const MAJOR_PATTERNS = [
  /(?:computer\s+science|software\s+engineering|information\s+technology|data\s+science|computer\s+engineering|artificial\s+intelligence|cybersecurity|mathematics|statistics|physics|electrical\s+engineering|mechanical\s+engineering|business\s+administration|finance|economics)/i,
];

export class EducationExtractor {
  /**
   * Extracts structured education entries from education section text or full text.
   * @param {string} educationText
   * @returns {Array<Object>}
   */
  static extract(educationText = "") {
    if (!educationText || educationText.trim().length === 0) {
      return [];
    }

    const lines = educationText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const entries = [];
    let currentEntry = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line contains a recognized degree
      let detectedDegree = null;
      for (const dp of DEGREE_PATTERNS) {
        if (dp.regex.test(line)) {
          detectedDegree = dp.degree;
          break;
        }
      }

      const yearMatch = line.match(/\b(?:19|20)\d{2}\b/g);
      const gpaMatch = line.match(/\b(?:gpa[:\s]*)?([0-4]\.\d{1,2}(?:\s*\/\s*4\.0)?)\b/i);

      if (detectedDegree) {
        if (currentEntry) {
          entries.push(currentEntry);
        }

        let major = "";
        for (const mp of MAJOR_PATTERNS) {
          const match = line.match(mp);
          if (match) {
            major = match[0];
            break;
          }
        }

        currentEntry = {
          degree: detectedDegree,
          rawDegree: line,
          institution: "",
          field_of_study: major,
          start_date: yearMatch && yearMatch.length > 1 ? yearMatch[0] : "",
          end_date: yearMatch ? yearMatch[yearMatch.length - 1] : "",
          gpa: gpaMatch ? gpaMatch[1] : "",
        };

        // If line contains institution (e.g. "at Stanford University" or ", University of ...")
        const instMatch = line.match(/(?:at|,|\bat\s+the\b)\s+([A-Z][A-Za-z\s&.-]+(?:University|College|Institute|Polytechnic|School))/);
        if (instMatch) {
          currentEntry.institution = instMatch[1].trim();
        }
      } else if (currentEntry) {
        // Line might contain the institution or major
        if (!currentEntry.institution && /(?:university|college|institute|polytechnic|academy|school)/i.test(line)) {
          currentEntry.institution = line.replace(/[,|]/g, " ").trim();
        } else if (!currentEntry.field_of_study) {
          for (const mp of MAJOR_PATTERNS) {
            const match = line.match(mp);
            if (match) {
              currentEntry.field_of_study = match[0];
              break;
            }
          }
        }
        if (!currentEntry.end_date && yearMatch) {
          currentEntry.end_date = yearMatch[yearMatch.length - 1];
        }
        if (!currentEntry.gpa && gpaMatch) {
          currentEntry.gpa = gpaMatch[1];
        }
      } else {
        // Standalone institution line before degree
        if (/(?:university|college|institute|polytechnic|school)/i.test(line)) {
          currentEntry = {
            degree: "Degree",
            rawDegree: "",
            institution: line.replace(/[,|]/g, " ").trim(),
            field_of_study: "",
            start_date: "",
            end_date: yearMatch ? yearMatch[yearMatch.length - 1] : "",
            gpa: gpaMatch ? gpaMatch[1] : "",
          };
        }
      }
    }

    if (currentEntry) {
      entries.push(currentEntry);
    }

    // Fallback if no structured entries found but text exists
    if (entries.length === 0 && lines.length > 0) {
      entries.push({
        degree: "Higher Education",
        rawDegree: lines[0],
        institution: lines[0],
        field_of_study: "",
        start_date: "",
        end_date: "",
        gpa: "",
      });
    }

    return entries;
  }
}

export default EducationExtractor;
