"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FlameIcon,
  ProteinIcon,
  TrendingUpIcon,
  SparkleIcon,
} from "@/components/ui/Icons";

const FEATURES = [
  {
    title: "Smart Meal Logging",
    description: "Describe what you ate in plain English. AI estimates calories, protein, carbs, and fat instantly.",
    icon: FlameIcon,
    gradient: "from-orange-500/20 to-amber-500/5",
    border: "border-orange-500/20",
    icon_color: "text-orange-400",
    icon_bg: "bg-orange-500/15",
    glow: "shadow-orange-500/10",
  },
  {
    title: "AI Insights",
    description: "Get personalized nutrition recommendations and progress analysis powered by Ollama.",
    icon: SparkleIcon,
    gradient: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
    icon_color: "text-cyan-400",
    icon_bg: "bg-cyan-500/15",
    glow: "shadow-cyan-500/10",
  },
  {
    title: "Goal Setting",
    description: "Set realistic weight targets with intelligent calorie calculations and pace analysis.",
    icon: ProteinIcon,
    gradient: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    icon_color: "text-violet-400",
    icon_bg: "bg-violet-500/15",
    glow: "shadow-violet-500/10",
  },
  {
    title: "Progress Analytics",
    description: "Visualize trends with detailed charts, food quality scores, and 30/60/90-day reports.",
    icon: TrendingUpIcon,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    icon_color: "text-emerald-400",
    icon_bg: "bg-emerald-500/15",
    glow: "shadow-emerald-500/10",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

export function LandingFeatures() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  return (
    <div id="features" className="bg-slate-950 py-24 px-4 sm:py-32 relative overflow-hidden">
      {/* Divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={headingRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">
            Everything you need
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Why FitTrack?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Intelligent tools that work together so you can focus on results.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} p-6 backdrop-blur-sm shadow-lg ${feature.glow} cursor-default`}
              >
                <div className={`mb-4 inline-flex p-3 rounded-xl ${feature.icon_bg} ${feature.icon_color}`}>
                  <Icon width={24} height={24} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
