"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function LandingCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div className="bg-slate-950 py-24 px-4 sm:py-32 relative overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      <motion.div
        ref={ref}
        className="max-w-2xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Icon badge */}
        <motion.div
          className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-3xl">🏆</span>
        </motion.div>

        <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
          Ready to Transform
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400">
            Your Fitness?
          </span>
        </h2>

        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          Join FitTrack today and start making data-driven decisions about your health. Your AI coach is waiting.
        </p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center min-w-[220px] px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow duration-300"
            >
              Create Free Account
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-w-[220px] px-8 py-4 bg-slate-800/60 border border-slate-700/80 text-slate-200 font-bold rounded-2xl hover:bg-slate-700/60 transition-colors duration-200 backdrop-blur-sm"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          className="text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          No credit card required · Full access to all features
        </motion.p>
      </motion.div>
    </div>
  );
}
