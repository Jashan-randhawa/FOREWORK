export class ContactExtractor {
  /**
   * Extracts personal contact info with confidence metrics.
   * @param {string} fullText
   * @param {string} [headerText]
   * @returns {Object}
   */
  static extract(fullText = "", headerText = "") {
    const textToScan = headerText ? `${headerText}\n\n${fullText}` : fullText;
    const lines = textToScan.split("\n").map((l) => l.trim()).filter(Boolean);
    const topLines = lines.slice(0, 15);

    const email = this.extractEmail(textToScan);
    const phone = this.extractPhone(textToScan);
    const linkedin = this.extractLinkedIn(textToScan);
    const github = this.extractGitHub(textToScan);
    const portfolio = this.extractPortfolio(textToScan, [linkedin?.value, github?.value]);
    const location = this.extractLocation(topLines.join(" \n "));
    const name = this.extractName(topLines, email?.value);

    return {
      name: name?.value || "",
      email: email?.value || "",
      phone: phone?.value || "",
      linkedin: linkedin?.value || "",
      github: github?.value || "",
      portfolio: portfolio?.value || "",
      location: location?.value || "",
      details: {
        name,
        email,
        phone,
        linkedin,
        github,
        portfolio,
        location,
      },
    };
  }

  static extractEmail(text = "") {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const matches = text.match(emailRegex);
    if (!matches || matches.length === 0) {
      return { value: "", confidence: 0 };
    }
    const cleanEmail = matches[0].toLowerCase().trim();
    return {
      value: cleanEmail,
      confidence: 0.99,
    };
  }

  static extractPhone(text = "") {
    // Matches international & domestic formats:
    // +1 (555) 000-1111, +91 98765 43210, 555-123-4567, +44 20 7946 0919, etc.
    const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{4,5}\b/g;
    const candidates = text.match(phoneRegex) || [];

    for (const raw of candidates) {
      const digitsOnly = raw.replace(/\D/g, "");
      // Valid phone numbers typically have 10 to 14 digits
      if (digitsOnly.length >= 10 && digitsOnly.length <= 14) {
        // Exclude postal codes, timestamps, or repeated year dates
        if (!/^(?:19|20)\d{2}/.test(digitsOnly) || digitsOnly.length > 10) {
          return {
            value: raw.trim(),
            confidence: 0.95,
          };
        }
      }
    }

    return { value: "", confidence: 0 };
  }

  static extractLinkedIn(text = "") {
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_\-%]+)\/?/i;
    const match = text.match(linkedinRegex);
    if (match) {
      const url = match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
      return { value: url, confidence: 0.98 };
    }
    return { value: "", confidence: 0 };
  }

  static extractGitHub(text = "") {
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_\-%]+)\/?/i;
    const match = text.match(githubRegex);
    if (match) {
      const username = match[1];
      // Exclude common github paths that aren't user profiles
      if (!["features", "pricing", "topics", "collections"].includes(username.toLowerCase())) {
        const url = match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
        return { value: url, confidence: 0.98 };
      }
    }
    return { value: "", confidence: 0 };
  }

  static extractPortfolio(text = "", excludeUrls = []) {
    const urlRegex = /\b(?:https?:\/\/|www\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s<>"')]+)?\b/gi;
    const matches = text.match(urlRegex) || [];

    const excludedDomains = [
      "linkedin.com",
      "github.com",
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "google.com",
      "facebook.com",
      "twitter.com",
      "instagram.com",
    ];

    for (const raw of matches) {
      const lower = raw.toLowerCase();
      const isExcludedDomain = excludedDomains.some((d) => lower.includes(d));
      const isExplicitExcluded = excludeUrls.some((u) => u && lower.includes(u.toLowerCase()));

      if (!isExcludedDomain && !isExplicitExcluded) {
        const url = raw.startsWith("http") ? raw : `https://${raw}`;
        return { value: url, confidence: 0.85 };
      }
    }

    return { value: "", confidence: 0 };
  }

  static extractLocation(headerText = "") {
    // Matches formats like "New York, NY", "San Francisco, CA", "London, UK", "Toronto, ON, Canada", "Seattle, WA 98101"
    const locationRegex = /\b([A-Z][a-zA-Z\s.-]+),\s*([A-Z]{2}|[A-Z][a-zA-Z\s]+)(?:,\s*([A-Z][a-zA-Z\s]+))?(?:\s+\d{5})?\b/;
    const lines = headerText.split("\n");

    for (const line of lines) {
      if (line.includes("@") || line.toLowerCase().includes("linkedin") || line.toLowerCase().includes("github")) {
        // Strip out email or links before checking line for location
        const stripped = line.replace(/\b\S+@\S+\.\S+\b/, "").replace(/https?:\/\/\S+/, "");
        const match = stripped.match(locationRegex);
        if (match && match[0].trim().length < 40) {
          return { value: match[0].trim(), confidence: 0.8 };
        }
      } else {
        const match = line.match(locationRegex);
        if (match && match[0].trim().length < 40) {
          return { value: match[0].trim(), confidence: 0.85 };
        }
      }
    }

    return { value: "", confidence: 0 };
  }

  static extractName(topLines = [], knownEmail = "") {
    const forbiddenPhrases = [
      "resume",
      "curriculum vitae",
      "cv",
      "profile",
      "contact",
      "summary",
      "experience",
      "portfolio",
      "page",
      "phone",
      "email",
    ];

    // Attempt 1: Look at the first 3 lines for a prominent candidate name
    for (let i = 0; i < Math.min(topLines.length, 5); i++) {
      let line = topLines[i].trim();
      if (!line) continue;

      // Skip lines containing emails, phone numbers, or URLs
      if (line.includes("@") || /https?:\/\/|www\./i.test(line) || /\d{3,}/.test(line)) {
        continue;
      }

      const lower = line.toLowerCase();
      if (forbiddenPhrases.some((p) => lower === p || lower.startsWith(p + ":"))) {
        continue;
      }

      // Clean non-alpha prefix/suffix
      line = line.replace(/^[^a-zA-Z]+/, "").replace(/[^a-zA-Z]+$/, "").trim();

      // Check if line looks like a valid 2 to 4 token personal name
      const tokens = line.split(/\s+/);
      if (tokens.length >= 2 && tokens.length <= 4) {
        const allAlpha = tokens.every((t) => /^[A-Z][a-zA-Z'-]*$/.test(t) || t === t.toUpperCase());
        if (allAlpha && line.length >= 4 && line.length <= 35) {
          return {
            value: line,
            confidence: 0.9,
          };
        }
      }
    }

    // Attempt 2: Derive from email username if available
    if (knownEmail) {
      const userPart = knownEmail.split("@")[0].replace(/[0-9_.-]+/g, " ").trim();
      const tokens = userPart.split(/\s+/).filter(Boolean);
      if (tokens.length >= 2) {
        const formatted = tokens
          .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
          .join(" ");
        return {
          value: formatted,
          confidence: 0.65,
        };
      }
    }

    return { value: "", confidence: 0 };
  }
}

export default ContactExtractor;
