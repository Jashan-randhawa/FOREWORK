/**
 * Conceptual domain clusters mapping specific technical competencies to high-level requirements
 */
const CONCEPT_CLUSTERS = [
  {
    concept: "RESTful APIs",
    keywords: ["rest api", "restful api", "fastapi", "express", "django rest framework", "flask", "endpoints", "swagger", "api development"],
  },
  {
    concept: "Cloud Infrastructure",
    keywords: ["aws", "azure", "google cloud platform", "ec2", "s3", "lambda", "cloud architecture", "serverless"],
  },
  {
    concept: "Containerization & Orchestration",
    keywords: ["docker", "kubernetes", "k8s", "helm", "docker-compose", "microservices"],
  },
  {
    concept: "CI/CD & Automation",
    keywords: ["ci/cd", "github actions", "jenkins", "gitlab ci", "pipeline", "continuous integration", "continuous deployment"],
  },
  {
    concept: "Frontend Architecture",
    keywords: ["react", "next.js", "vue.js", "angular", "state management", "redux", "tailwind css", "frontend"],
  },
  {
    concept: "Database Management & Design",
    keywords: ["postgresql", "mysql", "mongodb", "redis", "schema design", "query optimization", "indexing", "sql"],
  },
  {
    concept: "Testing & Quality Assurance",
    keywords: ["jest", "vitest", "cypress", "playwright", "unit testing", "integration testing", "tdd"],
  },
  {
    concept: "Data Science & Machine Learning",
    keywords: ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "nlp", "llm", "pandas", "numpy"],
  },
];

export class SemanticMatcher {
  /**
   * Computes semantic similarity between resume experience bullets and job responsibilities.
   * @param {Object} params
   * @param {string[]} params.resumeBullets
   * @param {string[]} params.jobResponsibilities
   * @param {string[]} params.resumeSkills
   * @param {string[]} params.jobSkills
   * @returns {Object}
   */
  static compare({ resumeBullets = [], jobResponsibilities = [], resumeSkills = [], jobSkills = [] }) {
    if (jobResponsibilities.length === 0 && jobSkills.length === 0) {
      return {
        semanticScore: 1.0,
        conceptOverlap: [],
        averageBulletSimilarity: 0.8,
      };
    }

    // 1. Concept Cluster Overlap
    const resumeTextLower = `${resumeBullets.join(" ")} ${resumeSkills.join(" ")}`.toLowerCase();
    const jobTextLower = `${jobResponsibilities.join(" ")} ${jobSkills.join(" ")}`.toLowerCase();

    const matchedConcepts = [];

    for (const cluster of CONCEPT_CLUSTERS) {
      const inJob = cluster.keywords.some((kw) => jobTextLower.includes(kw));
      const inResume = cluster.keywords.some((kw) => resumeTextLower.includes(kw));

      if (inJob && inResume) {
        matchedConcepts.push(cluster.concept);
      }
    }

    // 2. Token Set Jaccard & Soft Similarity
    let totalSim = 0;
    let comparisons = 0;

    for (const resp of jobResponsibilities.slice(0, 5)) {
      let maxBulletSim = 0;
      for (const bullet of resumeBullets.slice(0, 10)) {
        const sim = this.tokenJaccard(resp, bullet);
        if (sim > maxBulletSim) {
          maxBulletSim = sim;
        }
      }
      totalSim += maxBulletSim;
      comparisons++;
    }

    const averageSimilarity = comparisons > 0 ? totalSim / comparisons : 0.5;

    // Combined semantic score (0 to 1.0)
    const conceptBoost = Math.min(0.4, matchedConcepts.length * 0.1);
    const semanticScore = Math.min(1.0, Math.max(0.0, averageSimilarity * 0.6 + conceptBoost + 0.2));

    return {
      semanticScore: Math.round(semanticScore * 100) / 100,
      conceptOverlap: matchedConcepts,
      averageSimilarity: Math.round(averageSimilarity * 100) / 100,
    };
  }

  static tokenJaccard(s1 = "", s2 = "") {
    const tokens1 = new Set(s1.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((t) => t.length > 2));
    const tokens2 = new Set(s2.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((t) => t.length > 2));

    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    let intersection = 0;
    for (const t of tokens1) {
      if (tokens2.has(t)) {
        intersection++;
      }
    }

    const union = tokens1.size + tokens2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }
}

export default SemanticMatcher;
