"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useUser } from "@/components/UserProvider";
import {
  AlertIcon,
  CheckIcon,
  LightBulbIcon,
} from "@/components/ui/Icons";
import {
  getSuggestions,
  getDashboard,
  getGoal,
  type Suggestion,
  type DashboardData,
  type UserGoal,
} from "@/services/api";

export default function InsightsPage() {
  return (
    <AppShell>
      <InsightsContent />
    </AppShell>
  );
}

function InsightsContent() {
  const { user } = useUser();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [suggestionsData, dashData, goalData] = await Promise.all([
        getSuggestions(days, true).catch(() => ({
          suggestions: [] as Suggestion[],
          generated_at: "",
          count: 0,
        })),
        getDashboard().catch(() => null),
        getGoal().catch(() => null),
      ]);
      setSuggestions(suggestionsData.suggestions);
      setDashboard(dashData);
      setGoal(goalData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load AI insights"
      );
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const regenerate = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Group suggestions by priority
  const grouped = {
    high: suggestions.filter((s) => s.priority === "high"),
    medium: suggestions.filter((s) => s.priority === "medium"),
    low: suggestions.filter((s) => s.priority === "low"),
  };

  // Group by category for category view
  const byCategory = suggestions.reduce<Record<string, Suggestion[]>>(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {}
  );

  const categoryLabel: Record<string, string> = {
    habit: "🌟 Habit Building",
    nutrition: "🥗 Nutrition",
    goal_pace: "🎯 Goal Pacing",
    ai_insight: "🤖 AI Insights",
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertIcon className="h-5 w-5 text-rose-400 flex-shrink-0" />;
      case "medium":
        return <LightBulbIcon className="h-5 w-5 text-amber-400 flex-shrink-0" />;
      default:
        return <CheckIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/10 border-rose-500/20";
      case "medium":
        return "bg-amber-500/10 border-amber-500/20";
      default:
        return "bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1200px] mx-auto">
      <TopBar
        user={user}
        subtitle="Personal recommendations from your AI coach"
      />

      {/* Header card with controls */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              🤖 AI-Powered Recommendations
            </h2>
            <p className="text-sm text-slate-400">
              Tailored guidance based on your habits, goals, and recent progress
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm"
            >
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
            <Button
              onClick={regenerate}
              disabled={refreshing}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {refreshing ? (
                <>
                  <Spinner size="sm" className="mr-2" /> Refreshing...
                </>
              ) : (
                "🔄 Refresh"
              )}
            </Button>
          </div>
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
          {/* Quick stats summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Total Tips
              </p>
              <p className="text-2xl font-black text-cyan-400">
                {suggestions.length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-rose-400 uppercase tracking-wide mb-1">
                High Priority
              </p>
              <p className="text-2xl font-black text-rose-400">
                {grouped.high.length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-amber-400 uppercase tracking-wide mb-1">
                Medium
              </p>
              <p className="text-2xl font-black text-amber-400">
                {grouped.medium.length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-emerald-400 uppercase tracking-wide mb-1">
                Low Priority
              </p>
              <p className="text-2xl font-black text-emerald-400">
                {grouped.low.length}
              </p>
            </Card>
          </div>

          {/* Goal status banner */}
          {goal && (
            <Card className="p-6 mb-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    🎯 Your Active Goal
                  </h3>
                  <p className="text-sm text-slate-300">
                    Target weight:{" "}
                    <span className="text-cyan-400 font-bold">
                      {goal.weight_target} kg
                    </span>{" "}
                    by{" "}
                    <span className="text-cyan-400 font-bold">
                      {new Date(goal.target_date).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Current</p>
                  <p className="text-2xl font-black text-white">
                    {dashboard?.latest_weight ?? "—"} kg
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Suggestions by priority */}
          {suggestions.length === 0 ? (
            <Card className="p-8 text-center">
              <LightBulbIcon className="h-16 w-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                No Insights Available Yet
              </h3>
              <p className="text-slate-400 mb-4">
                Log meals, weight, and water for at least 3 days to receive
                personalized recommendations from your AI coach.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <a
                  href="/food-log"
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 text-sm"
                >
                  Log a Meal
                </a>
                <a
                  href="/weight"
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
                >
                  Log Weight
                </a>
              </div>
            </Card>
          ) : (
            <>
              {/* High Priority */}
              {grouped.high.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-rose-400 mb-3 flex items-center gap-2">
                    <AlertIcon className="h-5 w-5" />
                    High Priority Actions
                  </h2>
                  <div className="space-y-3">
                    {grouped.high.map((s, i) => (
                      <SuggestionCard
                        key={`high-${i}`}
                        suggestion={s}
                        getPriorityIcon={getPriorityIcon}
                        getPriorityClass={getPriorityClass}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority */}
              {grouped.medium.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <LightBulbIcon className="h-5 w-5" />
                    Recommended Tips
                  </h2>
                  <div className="space-y-3">
                    {grouped.medium.map((s, i) => (
                      <SuggestionCard
                        key={`med-${i}`}
                        suggestion={s}
                        getPriorityIcon={getPriorityIcon}
                        getPriorityClass={getPriorityClass}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Low Priority */}
              {grouped.low.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <CheckIcon className="h-5 w-5" />
                    Helpful Suggestions
                  </h2>
                  <div className="space-y-3">
                    {grouped.low.map((s, i) => (
                      <SuggestionCard
                        key={`low-${i}`}
                        suggestion={s}
                        getPriorityIcon={getPriorityIcon}
                        getPriorityClass={getPriorityClass}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Category overview */}
              <Card className="p-6 mt-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  📂 Insights by Category
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(categoryLabel).map(([key, label]) => (
                    <div
                      key={key}
                      className="p-3 bg-slate-800/40 rounded-lg text-center"
                    >
                      <p className="text-sm text-slate-300">{label}</p>
                      <p className="text-2xl font-black text-white mt-1">
                        {byCategory[key]?.length ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Weekly recap */}
              <Card className="p-6 mt-6">
                <h2 className="text-lg font-bold text-white mb-3">
                  📊 Weekly Recap
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Calories Today</p>
                    <p className="text-xl font-bold text-white">
                      {Math.round(dashboard?.total_calories_today ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Protein Today</p>
                    <p className="text-xl font-bold text-white">
                      {Math.round(dashboard?.total_protein_today ?? 0)}g
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Current Weight</p>
                    <p className="text-xl font-bold text-white">
                      {dashboard?.latest_weight ?? "—"} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">BMI</p>
                    <p className="text-xl font-bold text-white">
                      {dashboard?.bmi?.toFixed(1) ?? "—"}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

function SuggestionCard({
  suggestion,
  getPriorityIcon,
  getPriorityClass,
}: {
  suggestion: Suggestion;
  getPriorityIcon: (priority: string) => React.ReactNode;
  getPriorityClass: (priority: string) => string;
}) {
  return (
    <Card
      className={`p-4 border ${getPriorityClass(suggestion.priority)}`}
    >
      <div className="flex items-start gap-3">
        {getPriorityIcon(suggestion.priority)}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm mb-1">
            {suggestion.title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {suggestion.description}
          </p>
          {suggestion.action && (
            <div className="mt-3 pt-3 border-t border-slate-700/40">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Suggested Action
              </p>
              <p className="text-sm text-cyan-400">→ {suggestion.action}</p>
            </div>
          )}
          <div className="mt-2">
            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 capitalize">
              {suggestion.category.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
