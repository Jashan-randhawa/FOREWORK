/**
 * Canonical Skill Taxonomy with synonyms, aliases, and categorized metadata.
 */
export const SKILL_TAXONOMY = [
  // Languages
  {
    name: "Python",
    category: "Languages",
    aliases: ["python3", "python2", "py"],
  },
  {
    name: "JavaScript",
    category: "Languages",
    aliases: ["js", "es6", "ecmascript"],
  },
  {
    name: "TypeScript",
    category: "Languages",
    aliases: ["ts"],
  },
  {
    name: "Java",
    category: "Languages",
    aliases: ["core java", "j2ee"],
  },
  {
    name: "C++",
    category: "Languages",
    aliases: ["cpp", "c plus plus"],
  },
  {
    name: "C#",
    category: "Languages",
    aliases: ["csharp", "c sharp", ".net c#"],
  },
  {
    name: "C",
    category: "Languages",
    aliases: ["c language"],
    exactMatchOnly: true,
  },
  {
    name: "Go",
    category: "Languages",
    aliases: ["golang"],
    exactMatchOnly: true,
  },
  {
    name: "Rust",
    category: "Languages",
    aliases: ["rustlang"],
  },
  {
    name: "Ruby",
    category: "Languages",
    aliases: ["ruby on rails", "rails"],
  },
  {
    name: "PHP",
    category: "Languages",
    aliases: ["php7", "php8"],
  },
  {
    name: "Swift",
    category: "Languages",
    aliases: ["swiftui"],
  },
  {
    name: "Kotlin",
    category: "Languages",
    aliases: [],
  },
  {
    name: "SQL",
    category: "Languages",
    aliases: ["structured query language", "t-sql", "pl/sql"],
  },
  {
    name: "HTML5",
    category: "Frontend",
    aliases: ["html", "html/css"],
  },
  {
    name: "CSS3",
    category: "Frontend",
    aliases: ["css", "scss", "sass", "less"],
  },

  // Frontend
  {
    name: "React",
    category: "Frontend",
    aliases: ["reactjs", "react.js", "react js"],
  },
  {
    name: "Next.js",
    category: "Frontend",
    aliases: ["nextjs", "next.js", "next js"],
  },
  {
    name: "Vue.js",
    category: "Frontend",
    aliases: ["vue", "vuejs", "vue.js", "vue 3"],
  },
  {
    name: "Angular",
    category: "Frontend",
    aliases: ["angularjs", "angular.js", "angular 2+"],
  },
  {
    name: "Svelte",
    category: "Frontend",
    aliases: ["sveltekit"],
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    aliases: ["tailwind", "tailwindcss"],
  },
  {
    name: "Bootstrap",
    category: "Frontend",
    aliases: ["bootstrap 5", "bootstrap 4"],
  },
  {
    name: "Redux",
    category: "Frontend",
    aliases: ["redux toolkit", "rtk", "redux saga"],
  },
  {
    name: "Vite",
    category: "Frontend",
    aliases: ["vitejs"],
  },
  {
    name: "Webpack",
    category: "Frontend",
    aliases: [],
  },

  // Backend
  {
    name: "Node.js",
    category: "Backend",
    aliases: ["nodejs", "node.js", "node js", "node"],
  },
  {
    name: "Express",
    category: "Backend",
    aliases: ["expressjs", "express.js", "express js"],
  },
  {
    name: "FastAPI",
    category: "Backend",
    aliases: ["fast api"],
  },
  {
    name: "Django",
    category: "Backend",
    aliases: ["django rest framework", "drf"],
  },
  {
    name: "Flask",
    category: "Backend",
    aliases: [],
  },
  {
    name: "Spring Boot",
    category: "Backend",
    aliases: ["spring", "spring framework", "springboot"],
  },
  {
    name: "ASP.NET",
    category: "Backend",
    aliases: [".net core", "asp.net core", "dot net core"],
  },
  {
    name: "NestJS",
    category: "Backend",
    aliases: ["nest.js", "nest js"],
  },
  {
    name: "GraphQL",
    category: "Backend",
    aliases: ["apollo graphql"],
  },
  {
    name: "REST API",
    category: "Backend",
    aliases: ["restful api", "restful apis", "rest apis", "restful web services", "rest"],
  },
  {
    name: "WebSockets",
    category: "Backend",
    aliases: ["socket.io", "websocket"],
  },
  {
    name: "Microservices",
    category: "Architecture",
    aliases: ["microservice architecture", "micro-services"],
  },

  // Databases
  {
    name: "PostgreSQL",
    category: "Database",
    aliases: ["postgres", "postgresql", "psql"],
  },
  {
    name: "MongoDB",
    category: "Database",
    aliases: ["mongo", "mongoose", "nosql mongodb"],
  },
  {
    name: "MySQL",
    category: "Database",
    aliases: ["my sql"],
  },
  {
    name: "Redis",
    category: "Database",
    aliases: ["redis cache"],
  },
  {
    name: "SQLite",
    category: "Database",
    aliases: [],
  },
  {
    name: "Elasticsearch",
    category: "Database",
    aliases: ["elastic search", "elk stack"],
  },
  {
    name: "Firebase",
    category: "Database",
    aliases: ["firestore", "firebase auth"],
  },
  {
    name: "DynamoDB",
    category: "Database",
    aliases: ["amazon dynamodb"],
  },
  {
    name: "Cassandra",
    category: "Database",
    aliases: ["apache cassandra"],
  },

  // Cloud & DevOps
  {
    name: "AWS",
    category: "Cloud",
    aliases: ["amazon web services", "aws ec2", "aws s3", "aws lambda"],
  },
  {
    name: "Azure",
    category: "Cloud",
    aliases: ["microsoft azure", "azure devops"],
  },
  {
    name: "Google Cloud Platform",
    category: "Cloud",
    aliases: ["gcp", "google cloud"],
  },
  {
    name: "Docker",
    category: "DevOps",
    aliases: ["docker container", "dockerfile", "docker-compose"],
  },
  {
    name: "Kubernetes",
    category: "DevOps",
    aliases: ["k8s", "kube"],
  },
  {
    name: "CI/CD",
    category: "DevOps",
    aliases: ["continuous integration", "continuous deployment", "cicd"],
  },
  {
    name: "Git",
    category: "DevOps",
    aliases: ["github", "gitlab", "version control"],
  },
  {
    name: "GitHub Actions",
    category: "DevOps",
    aliases: ["gh actions"],
  },
  {
    name: "Jenkins",
    category: "DevOps",
    aliases: [],
  },
  {
    name: "Terraform",
    category: "DevOps",
    aliases: ["infrastructure as code", "iac"],
  },
  {
    name: "Linux",
    category: "DevOps",
    aliases: ["ubuntu", "debian", "centos", "unix", "bash", "shell scripting"],
  },
  {
    name: "Nginx",
    category: "DevOps",
    aliases: ["reverse proxy"],
  },

  // AI & Data Science
  {
    name: "Machine Learning",
    category: "AI/ML",
    aliases: ["ml", "machine learning algorithms"],
  },
  {
    name: "Deep Learning",
    category: "AI/ML",
    aliases: ["dl", "neural networks"],
  },
  {
    name: "PyTorch",
    category: "AI/ML",
    aliases: ["torch"],
  },
  {
    name: "TensorFlow",
    category: "AI/ML",
    aliases: ["tf", "keras"],
  },
  {
    name: "NLP",
    category: "AI/ML",
    aliases: ["natural language processing", "spacy", "nltk", "transformers", "huggingface"],
  },
  {
    name: "LLM",
    category: "AI/ML",
    aliases: ["large language models", "prompt engineering", "langchain", "rag", "genai", "generative ai"],
  },
  {
    name: "Pandas",
    category: "Data",
    aliases: [],
  },
  {
    name: "NumPy",
    category: "Data",
    aliases: [],
  },
  {
    name: "Scikit-Learn",
    category: "Data",
    aliases: ["scikit learn", "sklearn"],
  },

  // Testing & Quality
  {
    name: "Jest",
    category: "Testing",
    aliases: [],
  },
  {
    name: "Vitest",
    category: "Testing",
    aliases: [],
  },
  {
    name: "Cypress",
    category: "Testing",
    aliases: [],
  },
  {
    name: "Playwright",
    category: "Testing",
    aliases: [],
  },
  {
    name: "Postman",
    category: "Testing",
    aliases: ["api testing"],
  },

  // Architecture & Methods
  {
    name: "Agile",
    category: "Methodology",
    aliases: ["scrum", "kanban", "sprint planning"],
  },
  {
    name: "System Design",
    category: "Architecture",
    aliases: ["distributed systems", "high availability", "scalability"],
  },
  {
    name: "Cybersecurity",
    category: "Security",
    aliases: ["owasp", "oauth", "jwt", "encryption", "aes-256"],
  },
];

export const CANONICAL_ALIAS_MAP = (() => {
  const map = new Map();
  for (const skill of SKILL_TAXONOMY) {
    map.set(skill.name.toLowerCase(), skill.name);
    for (const alias of skill.aliases) {
      map.set(alias.toLowerCase(), skill.name);
    }
  }
  return map;
})();
