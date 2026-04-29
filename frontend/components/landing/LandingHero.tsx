"use client";

import Link from "next/link";
import { SparkleIcon } from "@/components/ui/Icons";

export function LandingHero() {
  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("features");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full animate-fadeInDown">
          <SparkleIcon width={16} height={16} className="text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-300">AI-Powered Fitness Tracking</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 animate-fadeInDown delay-200">
          Your Personal AI Fitness Coach
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fadeInDown delay-300">
          Track nutrition, weight, and goals with intelligent insights powered by AI. Transform your fitness journey with data-driven recommendations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fadeInDown delay-400">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 min-h-12"
          >
            Get Started Free
          </Link>
          <button
            onClick={handleLearnMore}
            className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 border border-slate-700 text-slate-200 font-bold rounded-xl hover:bg-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center justify-center min-h-12"
          >
            Learn More
          </button>
        </div>

        <p className="text-xs text-slate-500 animate-fadeInDown delay-500">
          💳 No credit card required. Start tracking today.
        </p>
      </div>
    </div>
  );
}
