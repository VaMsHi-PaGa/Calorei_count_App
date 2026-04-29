"use client";

import { motion } from "framer-motion";
import { Card } from "./ui/Card";
import { GoalIcon } from "./ui/Icons";

type GoalCardProps = {
  consumed: number;
  target: number | null;
};

export function GoalCard({ consumed, target }: GoalCardProps) {
  const hasTarget = typeof target === "number" && target > 0;
  const percent = hasTarget ? Math.min(100, Math.round((consumed / target!) * 100)) : 0;
  const remaining = hasTarget ? Math.max(0, Math.round(target! - consumed)) : 0;
  const isOver = hasTarget && consumed > target!;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
          <GoalIcon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-white">Daily goal</h3>
      </div>

      {hasTarget ? (
        <>
          <div className="flex items-baseline justify-between mb-3">
            <motion.p
              className={`text-3xl font-black ${isOver ? "text-rose-400" : "text-white"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {percent}%
            </motion.p>
            <p className={`text-sm ${isOver ? "text-rose-400" : "text-slate-400"}`}>
              {remaining > 0 ? `${remaining} kcal left` : isOver ? `${Math.abs(remaining)} kcal over` : "Target hit!"}
            </p>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${isOver ? "from-rose-500 to-orange-400" : "from-cyan-400 to-violet-400"}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percent, 100)}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {Math.round(consumed)} of {Math.round(target!)} kcal target
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-400">
          Log your weight to set a calorie target.
        </p>
      )}
    </Card>
  );
}
