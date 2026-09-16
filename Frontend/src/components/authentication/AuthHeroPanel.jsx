import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Zap, ShieldCheck, BarChart3, Sparkles } from "lucide-react";

const AuthHeroPanel = ({ mode = "login" }) => {
  const isLogin = mode === "login";

  return (
    <div className="hidden lg:flex flex-[1.1] xl:flex-[1.15] h-full relative overflow-hidden flex-col justify-between p-6 lg:p-8 xl:p-10 2xl:p-12 border-r border-gray-200 dark:border-[#2A2434] shrink-0 select-none">
      {/* Ambient Gradient Wash (Light: Pearl / Lavender / Violet | Dark: Deep Cosmic Violet / Ink) */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 dark:opacity-0 bg-[radial-gradient(110%_85%_at_12%_8%,rgba(233,213,255,0.85)_0%,transparent_55%),radial-gradient(130%_95%_at_90%_100%,rgba(107,58,194,0.18)_0%,transparent_60%),linear-gradient(160deg,#fbf9fe_0%,#f1ebf9_45%,#e8def8_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 dark:opacity-100 bg-[radial-gradient(110%_85%_at_12%_8%,rgba(107,58,194,0.32)_0%,transparent_52%),radial-gradient(130%_95%_at_90%_100%,rgba(142,81,237,0.22)_0%,transparent_62%),linear-gradient(160deg,#1A1424_0%,#130F1A_45%,#0B0810_100%)]" />

      {/* Top Brand Header */}
      <div className="relative z-10 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2.5 xl:gap-3 group focus:outline-none focus:ring-2 focus:ring-[#6B3AC2] rounded-xl">
          <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#6B3AC2] to-[#8E51ED] text-white shadow-lg shadow-purple-500/20 border border-purple-400/30 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-white drop-shadow" />
          </div>
          <div>
            <span className="font-bold text-base xl:text-lg tracking-tight text-gray-900 dark:text-white flex items-center">
              FORE<span className="text-[#6B3AC2] dark:text-purple-400">WORK</span>
              <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-[#3D2166] text-[#6B3AC2] dark:text-purple-300 border border-purple-300/40 dark:border-purple-500/30 uppercase tracking-wider">
                PORTAL
              </span>
            </span>
            <p className="text-[10px] xl:text-[11px] font-medium tracking-wide text-gray-500 dark:text-gray-400 uppercase">
              Talent Ecosystem
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#1F1B26]/80 border border-purple-200/60 dark:border-[#3D2166] text-xs font-medium backdrop-blur-md text-gray-700 dark:text-gray-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Talent Cloud Active</span>
        </div>
      </div>

      {/* Center Editorial Copy */}
      <div className="relative z-10 max-w-lg my-auto py-4 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/80 dark:bg-[#3D2166]/60 border border-purple-300/40 dark:border-purple-500/30 text-[11px] font-semibold tracking-wider text-[#6B3AC2] dark:text-purple-300 uppercase mb-3">
          <Sparkles className="w-3 h-3 text-[#6B3AC2] dark:text-purple-300" />
          <span>{isLogin ? "Career Discovery & Talent Intelligence" : "Join The Top 1% Engineering Network"}</span>
        </div>

        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.2] mb-3">
          {isLogin
            ? "Every role discovered, every career milestone achieved with calm precision."
            : "Shape your future with world-class employers and vetted tech teams."}
        </h1>

        <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-normal">
          {isLogin
            ? "High-velocity talent discovery, verified recruiter pipelines, and automated application telemetry — engineered to fit into your professional rhythm."
            : "Create your candidate or hiring manager profile in seconds, connect directly with verified teams, and accelerate your recruitment pipeline."}
        </p>

        {/* 3 Metric & Feature Cards */}
        <div className="grid grid-cols-3 gap-2.5 xl:gap-3">
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#1F1B26]/60 border border-white/80 dark:border-[#2A2434] backdrop-blur-md shadow-xs hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
            <Zap className="w-4 h-4 text-[#6B3AC2] dark:text-purple-400 mb-1.5" />
            <p className="text-xs font-bold text-gray-900 dark:text-white">Sub-minute</p>
            <p className="text-[10px] xl:text-[11px] text-gray-500 dark:text-gray-400">Easy Apply Flow</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#1F1B26]/60 border border-white/80 dark:border-[#2A2434] backdrop-blur-md shadow-xs hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
            <p className="text-xs font-bold text-gray-900 dark:text-white">RBAC + JWT</p>
            <p className="text-[10px] xl:text-[11px] text-gray-500 dark:text-gray-400">Verified Access</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#1F1B26]/60 border border-white/80 dark:border-[#2A2434] backdrop-blur-md shadow-xs hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1.5" />
            <p className="text-xs font-bold text-gray-900 dark:text-white">Real-Time</p>
            <p className="text-[10px] xl:text-[11px] text-gray-500 dark:text-gray-400">Status Tracking</p>
          </div>
        </div>
      </div>

      {/* Ambient bottom giant wordmark */}
      <div className="relative z-0 select-none pointer-events-none mt-auto pt-2 shrink-0">
        <span className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-none text-gray-900/[0.04] dark:text-white/[0.04] block whitespace-nowrap overflow-hidden">
          FOREWORK
        </span>
      </div>
    </div>
  );
};

export default AuthHeroPanel;
