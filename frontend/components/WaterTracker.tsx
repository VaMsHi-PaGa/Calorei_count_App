"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/Card";
import { WaterIcon, PlusIcon } from "./ui/Icons";

type WaterTrackerProps = {
  userId: number;
  goalLiters?: number;
  glassMl?: number;
};

const STORAGE_PREFIX = "fitness_water";

function todayKey(userId: number): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${STORAGE_PREFIX}_${userId}_${today}`;
}

export function WaterTracker({
  userId,
  goalLiters = 3,
  glassMl = 250,
}: WaterTrackerProps) {
  const totalGlasses = Math.round((goalLiters * 1000) / glassMl);
  const [glasses, setGlasses] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(todayKey(userId));
    setGlasses(saved ? Number(saved) || 0 : 0);
  }, [userId]);

  const update = (next: number) => {
    const clamped = Math.max(0, Math.min(totalGlasses, next));
    setGlasses(clamped);
    localStorage.setItem(todayKey(userId), String(clamped));
  };

  const liters = (glasses * glassMl) / 1000;
  const percent = Math.min(100, Math.round((liters / goalLiters) * 100));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400">
            <WaterIcon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Water intake</h3>
        </div>
        <button
          type="button"
          onClick={() => update(glasses + 1)}
          className="text-xs font-semibold text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
        >
          <PlusIcon className="h-3 w-3" />
          Add glass
        </button>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <p className="text-2xl font-black text-white">{liters.toFixed(2)}</p>
        <p className="text-sm text-slate-400">/ {goalLiters} L</p>
      </div>

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
        {Array.from({ length: totalGlasses }).map((_, i) => {
          const filled = i < glasses;
          return (
            <button
              key={i}
              type="button"
              onClick={() => update(i + 1 === glasses ? i : i + 1)}
              className={`h-7 rounded-md transition-all ${
                filled
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
              aria-label={`Glass ${i + 1}`}
            />
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {glasses} of {totalGlasses} glasses · {percent}% of daily goal
      </p>
    </Card>
  );
}
