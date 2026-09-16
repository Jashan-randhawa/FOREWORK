import React, { useState } from "react";
import Navbar from "../components_lite/Navbar";
import Footer from "../components_lite/Footer";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Github,
  ExternalLink,
  Code2,
} from "lucide-react";

const Creator = () => {
  const [activePersona, setActivePersona] = useState("candidate"); // "candidate" | "recruiter"

  const corePillars = [
    {
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
      title: "Transparent & Accountable",
      description:
        "Zero recruitment ghosting. Candidates track applications across transparent states, with scheduled interview timestamps and verified employer feedback.",
    },
    {
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
      title: "Intelligent Matchmaking",
      description:
        "Contextual search filters, automated job alerts, and structured role classification that connects candidates to matching career trajectories faster.",
    },
    {
      icon: Building2,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
      title: "Vetted Employers Only",
      description:
        "Administrative moderation and company verification prevent deceptive postings and spam, ensuring every opportunity is legitimate and actionable.",
    },
    {
      icon: Zap,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
      title: "Modern Recruiter Cockpit",
      description:
        "Recruiters manage candidate pipelines, add internal candidate evaluation notes, coordinate video interview meetings, and inspect conversion metrics.",
    },
  ];

  const candidateSteps = [
    {
      number: "01",
      title: "Discover & Filter",
      desc: "Explore verified listings filtered by location, job type, seniority, and technology stack.",
    },
    {
      number: "02",
      title: "One-Click Apply",
      desc: "Apply seamlessly using your standardized digital profile, uploaded resume, and contact information.",
    },
    {
      number: "03",
      title: "Track & Interview",
      desc: "Get live status updates, video meeting links, and scheduled interview notifications in one centralized hub.",
    },
  ];

  const recruiterSteps = [
    {
      number: "01",
      title: "Verify & Profile",
      desc: "Register your organization profile with official branding, location, and recruitment credentials.",
    },
    {
      number: "02",
      title: "Publish Positions",
      desc: "Deploy roles with customized requirements, salary ranges, and position lifecycle controls.",
    },
    {
      number: "03",
      title: "Screen & Schedule",
      desc: "Review submitted resumes, attach recruiter feedback notes, and schedule video interviews directly.",
    },
  ];

  const techStack = [
    "React 18",
    "Tailwind CSS",
    "Redux Toolkit",
    "Vite",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Radix UI",
    "Recharts",
    "JWT Auth",
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-gray-200/60 dark:border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/60 via-transparent to-transparent dark:from-purple-950/20 pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Next-Generation Career Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              Bridging Ambition with <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#6B3AC2] via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Exceptional Opportunity
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              FOREWORK is built for modern talent acquisition. We eliminate hiring friction, ghosting, and opaque processes with structured interview telemetry, verified employer credentials, and lightning-fast job discovery.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link to="/Jobs">
                <Button className="bg-[#6B3AC2] hover:bg-[#522998] text-white px-6 h-11 text-sm font-medium shadow-md shadow-purple-500/20">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Explore Open Roles
                </Button>
              </Link>
              <a href="#creator-section">
                <Button variant="outline" className="px-6 h-11 text-sm font-medium border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Users className="w-4 h-4 mr-2 text-[#6B3AC2]" />
                  Meet the Developer
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* 2. Mission & Core Pillars */}
        <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Why ForeWork is Different
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Engineered with deliberate principles to empower job seekers and streamline enterprise recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group"
                >
                  <div className={`p-3 rounded-xl border ${pillar.color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#6B3AC2] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Platform Impact Stats */}
        <section className="bg-white dark:bg-gray-900 border-y border-gray-200/80 dark:border-gray-800 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-gray-100 dark:divide-gray-800">
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#6B3AC2] tracking-tight">100%</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">Verified Employers</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Zero unvetted spam listings</div>
              </div>
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#6B3AC2] tracking-tight">&lt; 48h</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">Application Turnaround</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Live status updates</div>
              </div>
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#6B3AC2] tracking-tight">0%</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">Recruitment Ghosting</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Every applicant receives updates</div>
              </div>
              <div className="p-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#6B3AC2] tracking-tight">24 / 7</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">Cloud Reliability</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Continuous job matchmaking</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Dual Journey Flow (How It Works) */}
        <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="mb-3 text-[#6B3AC2] border-purple-200">
              User Experience
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Designed for Both Sides of Hiring
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Whether you are hunting for your dream role or scaling your engineering team, ForeWork streamlines your workflow.
            </p>

            {/* Persona Switcher Buttons */}
            <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mt-6 border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setActivePersona("candidate")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePersona === "candidate"
                    ? "bg-white dark:bg-gray-900 text-[#6B3AC2] shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                For Job Seekers
              </button>
              <button
                type="button"
                onClick={() => setActivePersona("recruiter")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePersona === "recruiter"
                    ? "bg-white dark:bg-gray-900 text-[#6B3AC2] shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                For Recruiters & Companies
              </button>
            </div>
          </div>

          {/* Journey Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(activePersona === "candidate" ? candidateSteps : recruiterSteps).map((step, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                <div className="text-4xl font-black text-purple-100 dark:text-purple-950/60 mb-4 select-none">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/80 flex items-center text-xs font-medium text-[#6B3AC2]">
                  <span>Step {idx + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Developer & Maintainer Spotlight */}
        <section id="creator-section" className="py-16 sm:py-20 bg-purple-50/40 dark:bg-gray-900/60 border-t border-gray-200/80 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Creator & Software Architect
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The developer behind the code, vision, and continuous maintenance of FOREWORK.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-md">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Developer Avatar */}
                <div className="relative shrink-0">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#6B3AC2] shadow-lg p-1 bg-white dark:bg-gray-800">
                    <img
                      src="https://avatars.githubusercontent.com/u/157904720?v=4"
                      alt="Jashanpreet Singh"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80";
                      }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-2.5 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" title="Active Maintainer">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Developer Narrative */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          Jashanpreet Singh
                        </h3>
                        <p className="text-sm font-semibold text-[#6B3AC2] mt-0.5">
                          Full Stack Software Engineer & Maintainer
                        </p>
                      </div>
                      <Badge className="w-fit mx-auto sm:mx-0 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                        Lead Developer
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Passionate about architecting responsive, scalable web applications with intuitive design and clean developer ergonomics. ForeWork was designed and built to address the friction in modern recruitment — providing candidates with dignity and transparency while empowering hiring teams with real-time operational tools.
                  </p>

                  {/* Skills / Tech Stack Pills */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Core Technology Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                      {techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-[11px] font-medium border border-gray-200/60 dark:border-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social & Contact Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <a
                      href="https://github.com/Jashan-randhawa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      <Github className="w-4 h-4" />
                      <span>github.com/Jashan-randhawa</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                    <a
                      href="https://github.com/Jashan-randhawa/FOREWORK"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Code2 className="w-4 h-4 text-[#6B3AC2]" />
                      <span>Repository</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Call to Action Banner */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-[#6B3AC2] to-purple-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-purple-100 text-xs sm:text-base leading-relaxed mb-8">
                Join thousands of candidates discovering verified roles and verified employers hiring top tier talent on ForeWork.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/register">
                  <Button className="bg-white text-[#6B3AC2] hover:bg-purple-50 font-bold px-6 h-11 text-sm shadow-md">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/Jobs">
                  <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 px-6 h-11 text-sm">
                    Browse All Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Creator;
