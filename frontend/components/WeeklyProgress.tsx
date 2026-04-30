"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/Card";
import { getWeeklySummary, type WeeklySummary } from "@/services/api";

function Delta({ value, unit, inverse = false }: { value: number; unit: string; inverse?: boolean }) {
  if (value === 0) return <span className="text-slate-500 text-xs">—</span>;
  const positive = inverse ? value < 0 : value > 0;
  return (
    <span className={`text-xs font-semibold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
      {value > 0 ? "+" : ""}{value.toFixed(1)}{unit}
    </span>
  );
}

export function WeeklyProgress() {
  const [data, setData] = useState<WeeklySummary | null>(null);

  useEffect(() => {
    getWeeklySummary()
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const calDelta = data.this_week.avg_calories - data.last_week.avg_calories;
  const proteinDelta = data.this_week.avg_protein - data.last_week.avg_protein;
  const weightDelta = data.this_week.avg_weight && data.last_week.avg_weight
    ? data.this_week.avg_weight - data.last_week.avg_weight
    : 0;

  const stats = [
    {
      label: "Avg Calories",
      thisWeek: Math.round(data.this_week.avg_calories),
      unit: "kcal",
      delta: calDelta,
      deltaUnit: "",
      inverse: false,
    },
    {
      label: "Avg Protein",
      thisWeek: Math.round(data.this_week.avg_protein),
      unit: "g",
      delta: proteinDelta,
      deltaUnit: "g",
      inverse: false,
    },
    {
      label: "Avg Weight",
      thisWeek: data.this_week.avg_weight ? data.this_week.avg_weight.toFixed(1) : "—",
      unit: "kg",
      delta: weightDelta,
      deltaUnit: "kg",
      inverse: true,
    },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">This Week vs Last</h3>
        <span className="text-xs text-slate-500">
          wk of {new Date(data.week_start + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="bg-slate-800/40 rounded-xl p-3 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-lg font-black text-white">
              {s.thisWeek}
              <span className="text-xs font-normal text-slate-400 ml-0.5">{s.unit}</span>
            </p>
            <div className="mt-1">
              <Delta value={s.delta} unit={s.deltaUnit} inverse={s.inverse} />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
