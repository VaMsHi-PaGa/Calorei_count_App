"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SparkleIcon } from "@/components/ui/Icons";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
  };
}

export function LandingHero() {
  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden bg-slate-950">
      {/* Aurora orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(76,215,246,0.12) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, delay: 3 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, delay: 6 }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(76,215,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(76,215,246,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <motion.div
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/8"
          {...fadeUp(0)}
        >
          <SparkleIcon width={14} height={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">
            AI-Powered Fitness Tracking
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.05]"
          {...fadeUp(0.1)}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400">
            Your Personal
          </span>
          <br />
          <span className="text-white">AI Fitness Coach</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          {...fadeUp(0.2)}
        >
          Track nutrition, weight, and goals with intelligent insights powered by AI.
          Transform your fitness journey with data-driven recommendations.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
          {...fadeUp(0.3)}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 min-w-[200px] px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow duration-300"
            >
              Get Started Free
            </Link>
          </motion.div>
          <motion.button
            onClick={handleLearnMore}
            className="inline-flex items-center justify-center min-w-[200px] px-8 py-4 bg-slate-800/60 border border-slate-700/80 text-slate-200 font-bold rounded-2xl hover:bg-slate-700/60 transition-colors duration-200 backdrop-blur-sm"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Tagline */}
        <motion.p className="text-xs text-slate-500" {...fadeUp(0.4)}>
          No credit card required · Start tracking today
        </motion.p>

        {/* Stats row */}
        <motion.div
          className="mt-14 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          {...fadeUp(0.5)}
        >
          {[
            { value: "AI", label: "Macro Estimation" },
            { value: "4", label: "Core Trackers" },
            { value: "∞", label: "Goal Flexibility" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                {s.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
