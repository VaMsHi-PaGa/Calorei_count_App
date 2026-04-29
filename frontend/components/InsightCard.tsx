"use client";

import { motion } from "framer-motion";
import type { DashboardData } from "@/services/api";
import { Card } from "./ui/Card";
import { SparkleIcon } from "./ui/Icons";

type InsightCardProps = {
  data: DashboardData;
};

function buildInsight(data: DashboardData): string {
  const target = data.calorie_target ?? 0;
  const consumed = data.total_calories_today;
  const remaining = target - consumed;
  const protein = data.total_protein_today;

  if (target <= 0) {
    return "Log your weight to unlock a personalized calorie target and AI insights.";
  }
  if (consumed === 0) {
    return `You haven't logged any meals yet. You have ${Math.round(target)} kcal available — start with a balanced breakfast.`;
  }
  if (remaining < -150) {
    return `You're ${Math.round(Math.abs(remaining))} kcal over target today. Consider a lighter dinner or some extra movement.`;
  }
  if (remaining > target * 0.5) {
    return `You still have ${Math.round(remaining)} kcal left. Make sure to fuel up — undereating slows recovery.`;
  }
  if (protein < 50) {
    return `Solid pacing! Protein is on the low side (${Math.round(protein)}g) — add a high-protein snack to support muscle recovery.`;
  }
  return `Nice balance today — ${Math.round(consumed)} kcal in with ${Math.round(protein)}g protein. Stay consistent and the trend will follow.`;
}

export function InsightCard({ data }: InsightCardProps) {
  const message = buildInsight(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="p-5 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-400 shadow-sm"
            animate={{ boxShadow: ["0 0 8px rgba(76,215,246,0.2)", "0 0 16px rgba(76,215,246,0.4)", "0 0 8px rgba(76,215,246,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <SparkleIcon className="h-4 w-4" />
          </motion.div>
          <h3 className="text-sm font-bold text-white">AI Insight</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
      </Card>
    </motion.div>
  );
}
