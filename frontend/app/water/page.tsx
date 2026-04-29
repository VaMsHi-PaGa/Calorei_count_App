"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { WaterTracker } from "@/components/WaterTracker";
import { Card } from "@/components/ui/Card";
import { useUser } from "@/components/UserProvider";
import { CalendarIcon } from "@/components/ui/Icons";

export default function WaterPage() {
  return (
    <AppShell>
      <WaterContent />
    </AppShell>
  );
}

function WaterContent() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [waterHistory, setWaterHistory] = useState<Record<string, number>>({});

  // Load water history from localStorage
  useEffect(() => {
    if (!user) return;

    const STORAGE_PREFIX = "fitness_water";
    const history: Record<string, number> = {};

    // Get all localStorage keys for this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}_${user.id}_`)) {
        const date = key.replace(`${STORAGE_PREFIX}_${user.id}_`, "");
        const glasses = Number(localStorage.getItem(key)) || 0;
        history[date] = glasses;
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWaterHistory(history);
  }, [user]);

  if (!user) return null;

  const tips = [
    "Aim for ~250 ml (1 glass) every hour you're awake.",
    "Drink a glass of water 30 min before each meal — helps digestion.",
    "Keep a water bottle visible at your workspace as a passive reminder.",
    "Caffeinated drinks count partially — herbal tea is a full hydration win.",
  ];

  // Sort history dates in descending order
  const sortedDates = Object.keys(waterHistory).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Get today's date
  const todayDate = new Date().toISOString().slice(0, 10);

  // Separate today and history
  const historyDates = sortedDates.filter((date) => date !== todayDate);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === todayDate) {
      return "Today";
    } else if (dateStr === yesterday.toISOString().slice(0, 10)) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1100px] mx-auto">
      <TopBar user={user} subtitle="Track your daily hydration" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === "today" && (
          <WaterTracker userId={user.id} goalLiters={3} />
        )}

        {activeTab === "history" && (
          <Card className="p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-slate-400" />
              Water Intake History
            </h3>

            {historyDates.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historyDates.map((date) => {
                  const glasses = waterHistory[date];
                  const liters = (glasses * 250) / 1000;
                  const percent = Math.min(
                    100,
                    Math.round((liters / 3) * 100)
                  );

                  return (
                    <div
                      key={date}
                      className="bg-slate-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-white">
                          {formatDate(date)}
                        </p>
                        <p className="text-xs font-bold text-cyan-400">
                          {liters.toFixed(2)}L / 3L
                        </p>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {glasses} glasses ({percent}% of goal)
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">No history to display</p>
              </div>
            )}
          </Card>
        )}

        <div className="space-y-6">
          {/* Tabs */}
          <Card className="p-0 overflow-hidden">
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setActiveTab("today")}
                className={`flex-1 px-6 py-3 text-sm font-semibold text-center transition-colors ${
                  activeTab === "today"
                    ? "bg-slate-700 text-white border-b-2 border-cyan-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 px-6 py-3 text-sm font-semibold text-center transition-colors ${
                  activeTab === "history"
                    ? "bg-slate-700 text-white border-b-2 border-cyan-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                History ({historyDates.length})
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-bold text-white mb-3">
              Hydration tips
            </h3>
            <ul className="space-y-2.5">
              {tips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
