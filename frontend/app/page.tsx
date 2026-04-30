"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { FoodLogger } from "@/components/FoodLogger";
import { FoodLogTable } from "@/components/FoodLogTable";
import { WeightChart } from "@/components/WeightChart";
import { WeightLogger } from "@/components/WeightLogger";
import { MacroChart } from "@/components/MacroChart";
import { InsightCard } from "@/components/InsightCard";
import { GoalCard } from "@/components/GoalCard";
import { WaterTracker } from "@/components/WaterTracker";
import { StreakWidget } from "@/components/StreakWidget";
import { WeeklyProgress } from "@/components/WeeklyProgress";
import { useUser } from "@/components/UserProvider";
import {
  FlameIcon,
  ProteinIcon,
  StepsIcon,
  WaterIcon,
} from "@/components/ui/Icons";
import {
  getDashboard,
  getFoodLogs,
  getWeightLogs,
  getGoal,
  logFood,
  logWeight,
  type DashboardData,
  type FoodLog,
  type WeightLog,
  type UserGoal,
} from "@/services/api";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingCTA } from "@/components/landing/LandingCTA";

export default function HomePage() {
  const { user, authReady } = useUser();

  if (!authReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Spinner size="lg" className="text-cyan-400 mb-4" />
          <p className="text-slate-400 text-sm">Loading your fitness dashboard...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated users see the landing page
  if (!user) {
    return (
      <div className="bg-slate-950">
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </div>
    );
  }

  // Authenticated users see the dashboard
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [todayFoodLogs, setTodayFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodFeedback, setFoodFeedback] = useState("");
  const [foodError, setFoodError] = useState("");
  const [weightLoading, setWeightLoading] = useState(false);

  const refresh = useCallback(async () => {
    await null;
    try {
      setError("");
      const [dash, w, foods, g] = await Promise.all([
        getDashboard(),
        getWeightLogs(30),
        getFoodLogs({ limit: 20, todayOnly: true }),
        getGoal().catch(() => null),
      ]);
      setDashboard(dash);
      setWeights(w);
      setTodayFoodLogs(foods);
      setGoal(g);
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const handleFoodLog = async (text: string) => {
    setFoodLoading(true);
    setFoodFeedback("");
    setFoodError("");
    try {
      const result = await logFood(text);
      setFoodFeedback(
        `Logged "${result.food_text}" — ${Math.round(
          result.calories
        )} kcal added.`
      );
      await refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to log meal.";
      setFoodError(message);
      throw err;
    } finally {
      setFoodLoading(false);
    }
  };

  const handleWeightLog = async (weight: number) => {
    setWeightLoading(true);
    try {
      await logWeight(weight);
      await refresh();
    } finally {
      setWeightLoading(false);
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Spinner size="lg" className="text-cyan-400" />
            <p className="text-sm">Loading your dashboard...</p>
          </div>
        </div>
        {error && (
          <p className="text-sm text-rose-300 bg-rose-950/30 border border-rose-900/50 rounded-lg px-4 py-3 text-center">
            {error}
          </p>
        )}
      </div>
    );
  }

  const calorieTarget = dashboard.calorie_target ?? 0;
  const caloriesConsumed = dashboard.total_calories_today;
  const proteinTarget = Math.round((calorieTarget * 0.3) / 4) || 100;

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1400px] mx-auto">
      <TopBar user={user} />

      {error && (
        <div className="mb-4 p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Top metric cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
      >
        <StatCard
          label="Calories"
          value={Math.round(caloriesConsumed)}
          unit="kcal"
          accent="orange"
          icon={FlameIcon}
          goal={calorieTarget > 0 ? Math.round(calorieTarget) : undefined}
          current={Math.round(caloriesConsumed)}
        />
        <StatCard
          label="Protein"
          value={Math.round(dashboard.total_protein_today)}
          unit="g"
          accent="rose"
          icon={ProteinIcon}
          goal={proteinTarget}
          current={Math.round(dashboard.total_protein_today)}
        />
        <StatCard
          label="Water"
          value="2.0"
          unit="L"
          accent="blue"
          icon={WaterIcon}
          goal={3}
          current={2}
          hint="Updated from your tracker"
        />
        <StatCard
          label="Weight"
          value={
            dashboard.latest_weight !== null
              ? dashboard.latest_weight.toFixed(1)
              : "—"
          }
          unit="kg"
          accent="indigo"
          icon={StepsIcon}
          hint={
            dashboard.bmi !== null
              ? `BMI ${dashboard.bmi.toFixed(1)}`
              : "Log weight to compute BMI"
          }
        />
      </motion.div>

      {/* Main grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.45, ease: "easeOut" }}
      >
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Weight progress
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Last {weights.length}{" "}
                  {weights.length === 1 ? "entry" : "entries"} · with 7-day
                  average
                </p>
              </div>
              {dashboard.latest_weight !== null && (
                <div className="text-right">
                  <p className="text-2xl font-black text-white">
                    {dashboard.latest_weight.toFixed(1)}
                    <span className="text-sm font-medium text-slate-400 ml-1">
                      kg
                    </span>
                  </p>
                  {dashboard.bmi !== null && (
                    <p className="text-xs text-slate-400">
                      BMI {dashboard.bmi.toFixed(1)}
                    </p>
                  )}
                </div>
              )}
            </div>
            <WeightChart weights={weights} />
          </Card>

          <FoodLogger
            loading={foodLoading}
            onSubmit={handleFoodLog}
            feedback={foodFeedback}
            error={foodError}
          />

          <FoodLogTable logs={todayFoodLogs} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-2">
              <h2 className="text-base font-bold text-white">
                Macro breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Today&apos;s intake</p>
            </div>
            <MacroChart
              protein={dashboard.total_protein_today}
              carbs={dashboard.total_carbs_today}
              fat={dashboard.total_fat_today}
            />
          </Card>

          <InsightCard data={dashboard} />

          <GoalCard
            consumed={caloriesConsumed}
            target={dashboard.calorie_target}
          />

          {goal && (goal.daily_calorie_target || goal.daily_protein_target || goal.daily_water_target) && (
            <Card className="p-6 bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/20">
              <h3 className="text-lg font-bold text-white mb-4">📊 Your Nutritional Targets</h3>
              <div className="grid grid-cols-3 gap-4">
                {goal.daily_calorie_target && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Daily Calories</p>
                    <p className="text-2xl font-black text-cyan-400">{goal.daily_calorie_target}</p>
                    <p className="text-xs text-slate-400 mt-1">kcal/day</p>
                  </div>
                )}
                {goal.daily_protein_target && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Daily Protein</p>
                    <p className="text-2xl font-black text-amber-400">{goal.daily_protein_target.toFixed(0)}</p>
                    <p className="text-xs text-slate-400 mt-1">grams/day</p>
                  </div>
                )}
                {goal.daily_water_target && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Daily Water</p>
                    <p className="text-2xl font-black text-blue-400">{(goal.daily_water_target / 1000).toFixed(1)}</p>
                    <p className="text-xs text-slate-400 mt-1">liters/day</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <StreakWidget />

          <WeeklyProgress />

          {userId !== null && <WaterTracker userId={userId} />}

          <WeightLogger
            loading={weightLoading}
            latestWeight={dashboard.latest_weight}
            onSubmit={handleWeightLog}
          />
        </div>
      </motion.div>
    </div>
  );
}
