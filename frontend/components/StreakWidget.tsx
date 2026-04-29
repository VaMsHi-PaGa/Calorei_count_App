"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/Card";
import { getStreaks, type StreakData } from "@/services/api";

type StreakItemProps = {
  label: string;
  streak: number;
  best: number;
  lastLogged: string | null;
  emoji: string;
  color: string;
};

function StreakItem({ label, streak, best, lastLogged, emoji, color }: StreakItemProps) {
  const loggedToday = lastLogged
    ? new Date(lastLogged).toDateString() === new Date().toDateString()
    : false;

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className={`text-2xl ${loggedToday ? "" : "grayscale opacity-50"}`}>
        {emoji}
      </div>
      <motion.p
        className={`text-2xl font-black ${color}`}
        key={streak}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, type: "spring" }}
      >
        {streak}
      </motion.p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {best > 0 && (
        <p className="text-[10px] text-slate-600">best {best}</p>
      )}
    </div>
  );
}

export function StreakWidget() {
  const [streaks, setStreaks] = useState<StreakData | null>(null);

  useEffect(() => {
    getStreaks()
      .then(setStreaks)
      .catch(() => {});
  }, []);

  if (!streaks) return null;

  const total = streaks.food_streak + streaks.water_streak + streaks.weight_streak;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Daily Streaks</h3>
        {total > 0 && (
          <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
            🔥 Keep it up!
          </span>
        )}
      </div>
      <div className="flex gap-2 divide-x divide-slate-700/50">
        <StreakItem
          label="Food"
          streak={streaks.food_streak}
          best={streaks.food_best_streak}
          lastLogged={streaks.food_last_logged}
          emoji="🍽️"
          color="text-orange-400"
        />
        <div className="flex-1 pl-2">
          <StreakItem
            label="Water"
            streak={streaks.water_streak}
            best={streaks.water_best_streak}
            lastLogged={streaks.water_last_logged}
            emoji="💧"
            color="text-blue-400"
          />
        </div>
        <div className="flex-1 pl-2">
          <StreakItem
            label="Weight"
            streak={streaks.weight_streak}
            best={streaks.water_best_streak}
            lastLogged={streaks.weight_last_logged}
            emoji="⚖️"
            color="text-violet-400"
          />
        </div>
      </div>
    </Card>
  );
}
