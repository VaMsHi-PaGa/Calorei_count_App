"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { WeightChart } from "@/components/WeightChart";
import { WeightLogger } from "@/components/WeightLogger";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useUser } from "@/components/UserProvider";
import {
  TrendingDownIcon,
  TrendingUpIcon,
  LightBulbIcon,
  AlertIcon,
  CheckIcon,
} from "@/components/ui/Icons";
import {
  getDashboard,
  getWeightLogs,
  logWeight,
  getSuggestions,
  getGoal,
  type DashboardData,
  type WeightLog,
  type Suggestion,
  type UserGoal,
} from "@/services/api";

export default function WeightPage() {
  return (
    <AppShell>
      <WeightContent />
    </AppShell>
  );
}

function WeightContent() {
  const { user } = useUser();
  const userId = user?.id ?? null;
  const [allWeights, setAllWeights] = useState<WeightLog[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");

  const refresh = useCallback(async () => {
    try {
      const [w, d] = await Promise.all([
        getWeightLogs(365), // Fetch full year of data
        getDashboard(),
      ]);
      setAllWeights(w);
      setDashboard(d);

      // Load goal
      try {
        const g = await getGoal();
        setGoal(g);
      } catch {
        // Goal not set yet
        setGoal(null);
      }

      // Load suggestions
      setSuggestionsLoading(true);
      try {
        const suggResponse = await getSuggestions(7, true);
        setSuggestions(suggResponse.suggestions);
      } catch (err) {
        console.warn("Failed to load suggestions:", err);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleLog = async (weight: number) => {
    console.log("🏋️ handleLog called with weight:", { weight, type: typeof weight, isFinite: Number.isFinite(weight) });
    setLogging(true);
    try {
      await logWeight(weight);
      await refresh();
    } catch (err) {
      console.error("Weight log failed:", err);
      throw err;
    } finally {
      setLogging(false);
    }
  };

  // Filter weights based on time range
  const getFilteredWeights = () => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        cutoffDate = new Date(0); // Beginning of time
        break;
    }

    return allWeights.filter((w) => new Date(w.date) >= cutoffDate);
  };

  const weights = getFilteredWeights();
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0]?.weight ?? null;
  const last = sorted[sorted.length - 1]?.weight ?? null;
  const change =
    first !== null && last !== null ? Number((last - first).toFixed(1)) : null;
  const trendingDown = change !== null && change < 0;

  const getPrioritySuggestions = () => {
    return suggestions.filter((s) => s.priority === "high").slice(0, 3);
  };

  const getInsightSuggestions = () => {
    return suggestions.filter((s) => s.category === "ai_insight").slice(0, 2);
  };

  const getSuggestionIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertIcon className="h-4 w-4 text-rose-400" />;
      case "medium":
        return <LightBulbIcon className="h-4 w-4 text-amber-400" />;
      default:
        return <CheckIcon className="h-4 w-4 text-emerald-400" />;
    }
  };

  const timeRangeLabel = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "1y": "Last Year",
    "all": "All Time",
  };

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1200px] mx-auto">
      <TopBar user={user} subtitle="Monitor your weight and get personalized insights" />

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Spinner size="lg" className="text-cyan-400" />
        </div>
      ) : (
        <>
          {/* Metric tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current Weight
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {dashboard?.latest_weight !== null &&
                dashboard?.latest_weight !== undefined
                  ? `${dashboard.latest_weight.toFixed(1)} kg`
                  : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {dashboard?.bmi !== null && dashboard?.bmi !== undefined
                  ? `BMI ${dashboard.bmi.toFixed(1)}`
                  : "BMI not available"}
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Progress ({sorted.length} entries)
              </p>
              <p
                className={`mt-1 text-3xl font-black ${
                  change === null
                    ? "text-white"
                    : trendingDown
                      ? "text-emerald-400"
                      : "text-rose-400"
                }`}
              >
                {change === null
                  ? "—"
                  : `${change > 0 ? "+" : ""}${change.toFixed(1)} kg`}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                {change !== null &&
                  (trendingDown ? (
                    <TrendingDownIcon className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <TrendingUpIcon className="h-3.5 w-3.5 text-rose-400" />
                  ))}
                <span>{timeRangeLabel[timeRange]}</span>
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Goal Status
              </p>
              {goal ? (
                <>
                  <p className="mt-1 text-3xl font-black text-cyan-400">
                    {goal.weight_target.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Target by {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-xl font-black text-slate-500">
                    No Goal
                  </p>
                  <a
                    href="/goals"
                    className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block"
                  >
                    Set a goal →
                  </a>
                </>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Weight Chart with Time Range Legend */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white">
                    Weight Trend
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                    {(["7d", "30d", "90d", "1y", "all"] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                          timeRange === range
                            ? "bg-cyan-500 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {timeRangeLabel[range]}
                      </button>
                    ))}
                  </div>
                </div>
                <WeightChart weights={weights} />
              </Card>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <LightBulbIcon className="h-5 w-5 text-amber-400" />
                    Personalized Suggestions
                  </h2>

                  {suggestionsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Spinner size="sm" className="text-cyan-400" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getPrioritySuggestions().length > 0 && (
                        <>
                          <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                            Priority Actions
                          </p>
                          {getPrioritySuggestions().map((sugg, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-800 rounded-lg p-3 border-l-2 border-rose-400"
                            >
                              <div className="flex items-start gap-2">
                                {getSuggestionIcon(sugg.priority)}
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-white">
                                    {sugg.title}
                                  </p>
                                  <p className="text-xs text-slate-300 mt-1">
                                    {sugg.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {getInsightSuggestions().length > 0 && (
                        <>
                          <p className="text-xs font-semibold uppercase text-slate-400 mb-2 mt-4">
                            AI Insights
                          </p>
                          {getInsightSuggestions().map((sugg, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-800 rounded-lg p-3 border-l-2 border-cyan-400"
                            >
                              <div className="flex items-start gap-2">
                                <LightBulbIcon className="h-4 w-4 text-cyan-400 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-white">
                                    {sugg.title}
                                  </p>
                                  <p className="text-xs text-slate-300 mt-1">
                                    {sugg.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {suggestions.length > 5 && (
                        <a
                          href="/reports"
                          className="text-xs text-cyan-400 hover:text-cyan-300 mt-3 inline-block"
                        >
                          View all suggestions →
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              )}
            </div>

            <div>
              <WeightLogger
                loading={logging}
                latestWeight={dashboard?.latest_weight ?? null}
                onSubmit={handleLog}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
