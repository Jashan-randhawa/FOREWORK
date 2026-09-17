import React from "react";
import { Link } from "react-router-dom";
import { Github, Heart, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-[#0B090E] border-t border-gray-200 dark:border-[#231E2D] text-gray-600 dark:text-gray-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#6B3AC2] dark:group-hover:text-purple-400 transition-colors">
                Fore<span className="text-[#6B3AC2] dark:text-purple-400">Work</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-[#6B3AC2] dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800/50">
                Verified Jobs
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
              The transparent, telemetry-driven career platform connecting ambitious engineering talent with verified tech companies with zero ghosting.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/Jobs"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Explore Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/Browse"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-jobs"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Saved Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/job-alerts"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Job Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers & Creators */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Hiring & About
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/register?role=recruiter"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Employer Sign Up
                </Link>
              </li>
              <li>
                <Link
                  to="/recruiter"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Recruiter Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/Creator"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Creator Story
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  About ForeWork
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Legal & Trust
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/PrivacyPolicy"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/TermsofService"
                  className="text-gray-600 dark:text-gray-400 hover:text-[#6B3AC2] dark:hover:text-purple-300 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#6B3AC2] dark:text-purple-400" />
                <span>Verified ID & KYC</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-[#231E2D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} ForeWork. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> by{" "}
              <a
                href="https://github.com/Jashan-randhawa"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-gray-900 dark:text-white hover:text-[#6B3AC2] dark:hover:text-purple-300 underline underline-offset-2"
              >
                Jashanpreet Singh
              </a>
            </span>
            <span>•</span>
            <a
              href="https://github.com/Jashan-randhawa/FOREWORK"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
