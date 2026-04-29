"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useUser } from "@/components/UserProvider";
import {
  getWeightLogs,
  getFoodLogs,
  getDashboard,
  type WeightLog,
  type FoodLog,
  type DashboardData,
} from "@/services/api";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <AnalyticsContent />
    </AppShell>
  );
}

type Period = "7d" | "30d" | "90d";

function AnalyticsContent() {
  const { user } = useUser();
  const [period, setPeriod] = useState<Period>("30d");
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [foods, setFoods] = useState<FoodLog[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [weightsData, foodsData, dashData] = await Promise.all([
        getWeightLogs(days).catch(() => [] as WeightLog[]),
        getFoodLogs({ limit: 100, todayOnly: false }).catch(
          () => [] as FoodLog[]
        ),
        getDashboard().catch(() => null),
      ]);
      setWeights(weightsData);
      setFoods(foodsData);
      setDashboard(dashData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Calculate macro averages and totals from food data
  const macroStats = (() => {
    if (!foods.length) return null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recent = foods.filter((f) => new Date(f.created_at) >= cutoff);
    if (!recent.length) return null;

    const totals = recent.reduce(
      (acc, f) => ({
        calories: acc.calories + (f.calories || 0),
        protein: acc.protein + (f.protein || 0),
        carbs: acc.carbs + (f.carbs || 0),
        fat: acc.fat + (f.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const uniqueDays =
      new Set(
        recent.map((f) => new Date(f.created_at).toISOString().split("T")[0])
      ).size || 1;

    return {
      total: totals,
      avgPerDay: {
        calories: Math.round(totals.calories / uniqueDays),
        protein: Math.round(totals.protein / uniqueDays),
        carbs: Math.round(totals.carbs / uniqueDays),
        fat: Math.round(totals.fat / uniqueDays),
      },
      mealCount: recent.length,
      uniqueDays,
    };
  })();

  // Weight stats
  const weightStats = (() => {
    if (!weights.length) return null;
    const sorted = [...weights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const first = sorted[0]?.weight ?? 0;
    const last = sorted[sorted.length - 1]?.weight ?? 0;
    const change = last - first;
    const min = Math.min(...weights.map((w) => w.weight));
    const max = Math.max(...weights.map((w) => w.weight));
    const avg =
      weights.reduce((sum, w) => sum + w.weight, 0) / weights.length;

    return {
      first,
      last,
      change,
      min,
      max,
      avg: Math.round(avg * 10) / 10,
      count: weights.length,
    };
  })();

  // Top frequent foods
  const topFoods = (() => {
    if (!foods.length) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recent = foods.filter((f) => new Date(f.created_at) >= cutoff);
    const counts: Record<string, { count: number; calories: number }> = {};
    recent.forEach((f) => {
      const key = f.food_text.toLowerCase().trim();
      if (!counts[key]) counts[key] = { count: 0, calories: 0 };
      counts[key].count += 1;
      counts[key].calories += f.calories || 0;
    });
    return Object.entries(counts)
      .map(([food, data]) => ({ food, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  // Best/worst calorie days
  const dailyStats = (() => {
    if (!foods.length) return null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const dayMap: Record<string, number> = {};
    foods
      .filter((f) => new Date(f.created_at) >= cutoff)
      .forEach((f) => {
        const day = new Date(f.created_at).toISOString().split("T")[0];
        dayMap[day] = (dayMap[day] || 0) + (f.calories || 0);
      });
    const entries = Object.entries(dayMap);
    if (!entries.length) return null;
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      totalDays: entries.length,
    };
  })();

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1200px] mx-auto">
      <TopBar
        user={user}
        subtitle="Deeper insights into your fitness journey"
      />

      {/* Period selector */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400 mr-2">Period:</span>
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {p === "7d"
                ? "Last 7 Days"
                : p === "30d"
                ? "Last 30 Days"
                : "Last 90 Days"}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Spinner size="lg" className="text-cyan-400" />
        </div>
      ) : error ? (
        <Card className="p-6 bg-rose-900/40 border border-rose-500/40">
          <p className="text-rose-200">{error}</p>
        </Card>
      ) : (
        <>
          {/* Quick stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Avg Calories
              </p>
              <p className="text-2xl font-black text-white">
                {macroStats?.avgPerDay.calories ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">per day</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Avg Protein
              </p>
              <p className="text-2xl font-black text-white">
                {macroStats?.avgPerDay.protein ?? 0}
                <span className="text-sm text-slate-400 ml-1">g</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">per day</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Avg Weight
              </p>
              <p className="text-2xl font-black text-white">
                {weightStats?.avg ?? "—"}
                <span className="text-sm text-slate-400 ml-1">kg</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">over period</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Days Logged
              </p>
              <p className="text-2xl font-black text-white">
                {macroStats?.uniqueDays ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">of {days}</p>
            </Card>
          </div>

          {/* Weight Trend */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">
              📈 Weight Trend
            </h2>
            {weightStats ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-slate-400">First</p>
                  <p className="text-lg font-bold text-white">
                    {weightStats.first} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Latest</p>
                  <p className="text-lg font-bold text-white">
                    {weightStats.last} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Change</p>
                  <p
                    className={`text-lg font-bold ${
                      weightStats.change < 0
                        ? "text-emerald-400"
                        : weightStats.change > 0
                        ? "text-amber-400"
                        : "text-slate-200"
                    }`}
                  >
                    {weightStats.change > 0 ? "+" : ""}
                    {weightStats.change.toFixed(1)} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Lowest</p>
                  <p className="text-lg font-bold text-white">
                    {weightStats.min} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Highest</p>
                  <p className="text-lg font-bold text-white">
                    {weightStats.max} kg
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                No weight data in this period yet. Log your weight to see
                trends.
              </p>
            )}
          </Card>

          {/* Macro breakdown */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">
              🥗 Nutrition Breakdown
            </h2>
            {macroStats ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-300">Protein</span>
                    <span className="text-emerald-400 font-medium">
                      {macroStats.avgPerDay.protein}g/day
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          (macroStats.avgPerDay.protein / 200) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-300">Carbs</span>
                    <span className="text-amber-400 font-medium">
                      {macroStats.avgPerDay.carbs}g/day
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${Math.min(
                          (macroStats.avgPerDay.carbs / 300) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-300">Fat</span>
                    <span className="text-rose-400 font-medium">
                      {macroStats.avgPerDay.fat}g/day
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{
                        width: `${Math.min(
                          (macroStats.avgPerDay.fat / 100) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-700/50 text-sm text-slate-400">
                  Total meals logged:{" "}
                  <span className="text-white font-bold">
                    {macroStats.mealCount}
                  </span>{" "}
                  · BMI:{" "}
                  <span className="text-white font-bold">
                    {dashboard?.bmi?.toFixed(1) ?? "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                No food data in this period yet. Log meals to see your nutrition
                breakdown.
              </p>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Frequent foods */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                🍴 Most Logged Foods
              </h2>
              {topFoods.length > 0 ? (
                <ul className="space-y-3">
                  {topFoods.map((item, i) => (
                    <li
                      key={item.food}
                      className="flex items-center justify-between gap-3 pb-3 border-b border-slate-700/40 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-slate-200 capitalize truncate">
                          {item.food}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-white">
                          {item.count}×
                        </p>
                        <p className="text-xs text-slate-500">
                          {Math.round(item.calories / item.count)} cal avg
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 text-sm">
                  Log meals to see your most frequent foods.
                </p>
              )}
            </Card>

            {/* Best/Worst Days */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                ⭐ Best & Worst Days
              </h2>
              {dailyStats ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-xs text-emerald-400 uppercase tracking-wide mb-1">
                      Highest Calorie Day
                    </p>
                    <p className="text-white font-bold">
                      {new Date(dailyStats.best[0]).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      {Math.round(dailyStats.best[1])} cal
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-xs text-amber-400 uppercase tracking-wide mb-1">
                      Lowest Calorie Day
                    </p>
                    <p className="text-white font-bold">
                      {new Date(dailyStats.worst[0]).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-2xl font-black text-amber-400 mt-1">
                      {Math.round(dailyStats.worst[1])} cal
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Across {dailyStats.totalDays} active day
                    {dailyStats.totalDays !== 1 ? "s" : ""}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">
                  Log meals to identify your highest and lowest calorie days.
                </p>
              )}
            </Card>
          </div>

          {/* Hydration consistency note */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-bold text-white mb-3">
              💧 Hydration Consistency
            </h2>
            <p className="text-sm text-slate-300 mb-3">
              Your water intake is tracked locally. Visit the{" "}
              <a href="/water" className="text-cyan-400 hover:text-cyan-300">
                Water Intake
              </a>{" "}
              page to log glasses and see your daily hydration progress.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-slate-800/40 rounded-lg">
                <p className="text-2xl font-black text-blue-400">2L</p>
                <p className="text-xs text-slate-400">Recommended daily</p>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-lg">
                <p className="text-2xl font-black text-cyan-400">8</p>
                <p className="text-xs text-slate-400">Glasses target</p>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-lg">
                <p className="text-2xl font-black text-emerald-400">3L</p>
                <p className="text-xs text-slate-400">Active goal</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
