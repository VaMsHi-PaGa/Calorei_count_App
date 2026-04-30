"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { FoodLogger } from "@/components/FoodLogger";
import { FoodLogTable } from "@/components/FoodLogTable";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useUser } from "@/components/UserProvider";
import {
  getDashboard,
  getFoodLogs,
  getGoal,
  logFood,
  AuthError,
  type DashboardData,
  type FoodLog,
  type UserGoal,
} from "@/services/api";

export default function FoodLogPage() {
  return (
    <AppShell>
      <FoodLogContent />
    </AppShell>
  );
}

function FoodLogContent() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [allLogs, setAllLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [foodLoading, setFoodLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      getDashboard(),
      getFoodLogs({ limit: 100, todayOnly: false }),
      getGoal().catch(() => null),
    ])
      .then(([dash, foods, g]) => {
        if (cancelled) return;
        setDashboard(dash);
        setAllLogs(foods);
        setGoal(g);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AuthError) {
          logout();
          router.replace("/login");
        } else {
          setError(err.message ?? "Failed to load.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, logout, router]);

  const handleSubmit = async (text: string) => {
    setFoodLoading(true);
    setFeedback("");
    setError("");
    try {
      const result = await logFood(text);
      setFeedback(`Logged ${Math.round(result.calories)} kcal ✓`);
      const [dash, foods] = await Promise.all([
        getDashboard(),
        getFoodLogs({ limit: 100, todayOnly: false }),
      ]);
      setDashboard(dash);
      setAllLogs(foods);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to log meal.";
      setError(message);
      throw err;
    } finally {
      setFoodLoading(false);
    }
  };

  // Filter logs for today and history
  const today = new Date().toDateString();
  const todayLogs = allLogs.filter(
    (log) => new Date(log.created_at).toDateString() === today
  );
  const historyLogs = allLogs.filter(
    (log) => new Date(log.created_at).toDateString() !== today
  );

  // Group history logs by date
  const groupedHistoryLogs = historyLogs.reduce(
    (acc, log) => {
      const date = new Date(log.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    },
    {} as Record<string, FoodLog[]>
  );

  const sortedDates = Object.keys(groupedHistoryLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1100px] mx-auto">
      <TopBar
        user={user}
        subtitle="Log your meals and track nutrition through the day"
      />

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Spinner size="lg" className="text-cyan-400" />
        </div>
      ) : (
        <>
          {dashboard && (
            <Card className="p-5 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat
                  label="Today's Calories"
                  value={`${Math.round(dashboard.total_calories_today)} kcal`}
                />
                <Stat
                  label="Today's Protein"
                  value={`${Math.round(dashboard.total_protein_today)} g`}
                />
                <Stat
                  label="Today's Carbs"
                  value={`${Math.round(dashboard.total_carbs_today)} g`}
                />
                <Stat
                  label="Today's Fat"
                  value={`${Math.round(dashboard.total_fat_today)} g`}
                />
              </div>
            </Card>
          )}

          {goal && (goal.daily_calorie_target || goal.daily_protein_target) && (
            <Card className="p-5 mb-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/20">
              <p className="text-xs font-semibold uppercase text-blue-400 mb-3">Your Daily Targets</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {goal.daily_calorie_target && (
                  <div>
                    <p className="text-xs text-slate-400">Target Calories</p>
                    <p className="text-lg font-bold text-cyan-400 mt-1">{goal.daily_calorie_target} kcal</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {dashboard ? `${Math.round(dashboard.total_calories_today)} / ${goal.daily_calorie_target}` : ""}
                    </p>
                  </div>
                )}
                {goal.daily_protein_target && (
                  <div>
                    <p className="text-xs text-slate-400">Target Protein</p>
                    <p className="text-lg font-bold text-amber-400 mt-1">{goal.daily_protein_target.toFixed(0)}g</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {dashboard ? `${Math.round(dashboard.total_protein_today)} / ${goal.daily_protein_target.toFixed(0)}` : ""}
                    </p>
                  </div>
                )}
                {goal.daily_water_target && (
                  <div>
                    <p className="text-xs text-slate-400">Target Water</p>
                    <p className="text-lg font-bold text-blue-400 mt-1">{(goal.daily_water_target / 1000).toFixed(1)}L</p>
                    <p className="text-xs text-slate-500 mt-1">Stay hydrated</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="space-y-6">
            <FoodLogger
              loading={foodLoading}
              onSubmit={handleSubmit}
              feedback={feedback}
              error={error}
            />

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
                  Today ({todayLogs.length})
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 px-6 py-3 text-sm font-semibold text-center transition-colors ${
                    activeTab === "history"
                      ? "bg-slate-700 text-white border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  History ({historyLogs.length})
                </button>
              </div>

              <div className="p-6">
                {activeTab === "today" ? (
                  <>
                    {todayLogs.length > 0 ? (
                      <FoodLogTable logs={todayLogs} title="Today's Meals" />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">
                          No meals logged yet today
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Log your first meal above to get started!
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {historyLogs.length > 0 ? (
                      <div className="space-y-6">
                        {sortedDates.map((date) => (
                          <div key={date}>
                            <h3 className="text-sm font-semibold text-slate-300 mb-3 pb-2 border-b border-slate-700">
                              {date}
                            </h3>
                            <FoodLogTable
                              logs={groupedHistoryLogs[date]}
                              title=""
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No history to display</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
