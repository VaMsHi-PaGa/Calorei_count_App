"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/Card";

type StatCardProps = {
  label: string;
  value: ReactNode;
  unit?: string;
  goal?: number;
  current?: number;
  accent?: "emerald" | "orange" | "blue" | "indigo" | "rose" | "amber";
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  hint?: ReactNode;
};

const accentMap = {
  emerald: { text: "text-cyan-400", bar: "from-cyan-400 to-cyan-300", bg: "bg-cyan-500/10", glow: "shadow-cyan-500/20" },
  orange: { text: "text-orange-400", bar: "from-orange-400 to-amber-300", bg: "bg-orange-500/10", glow: "shadow-orange-500/20" },
  blue: { text: "text-blue-400", bar: "from-blue-400 to-sky-300", bg: "bg-blue-500/10", glow: "shadow-blue-500/20" },
  indigo: { text: "text-indigo-400", bar: "from-indigo-400 to-violet-300", bg: "bg-indigo-500/10", glow: "shadow-indigo-500/20" },
  rose: { text: "text-rose-400", bar: "from-rose-400 to-pink-300", bg: "bg-rose-500/10", glow: "shadow-rose-500/20" },
  amber: { text: "text-amber-400", bar: "from-amber-400 to-yellow-300", bg: "bg-amber-500/10", glow: "shadow-amber-500/20" },
};

export const statCardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

export function StatCard({
  label,
  value,
  unit,
  goal,
  current,
  accent = "emerald",
  icon: Icon,
  hint,
}: StatCardProps) {
  const colors = accentMap[accent];
  const showProgress =
    typeof goal === "number" && typeof current === "number" && goal > 0;
  const progress = showProgress
    ? Math.min(100, Math.round((current! / goal) * 100))
    : 0;

  return (
    <motion.div variants={statCardVariant} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className={`p-5 h-full shadow-lg ${colors.glow}`} glow>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          {Icon && (
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-black text-white">{value}</span>
          {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
        </div>
        {showProgress ? (
          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${colors.bar} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {progress}% of {goal}
              {unit ? ` ${unit}` : ""} goal
            </p>
          </div>
        ) : hint ? (
          <p className="mt-3 text-xs text-slate-400">{hint}</p>
        ) : null}
      </Card>
    </motion.div>
  );
}
