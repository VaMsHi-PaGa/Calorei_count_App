"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useUser } from "@/components/UserProvider";
import {
  CheckIcon,
  AlertIcon,
  LightBulbIcon,
} from "@/components/ui/Icons";
import {
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  getDashboard,
  type UserGoal,
  type UserGoalInput,
  type DashboardData,
} from "@/services/api";

export default function GoalsPage() {
  return (
    <AppShell>
      <GoalsContent />
    </AppShell>
  );
}

function GoalsContent() {
  const { user } = useUser();
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<UserGoalInput>>({
    weight_target: undefined,
    target_date: "",
    weekly_loss_rate: undefined,
    daily_calorie_target: undefined,
    daily_protein_target: undefined,
    daily_water_target: undefined,
    custom_tips_enabled: true,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    try {
      const [g, d] = await Promise.all([
        getGoal().catch(() => null),
        getDashboard(),
      ]);
      setGoal(g);
      setDashboard(d);

      if (g) {
        setFormData({
          weight_target: g.weight_target,
          target_date: g.target_date.split("T")[0], // Extract date part
          weekly_loss_rate: g.weekly_loss_rate ?? undefined,
          daily_calorie_target: g.daily_calorie_target ?? undefined,
          daily_protein_target: g.daily_protein_target ?? undefined,
          daily_water_target: g.daily_water_target ?? undefined,
          custom_tips_enabled: g.custom_tips_enabled,
        });
        setShowForm(false);
      }
    } catch (err) {
      console.error("Failed to load goal:", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.weight_target || formData.weight_target <= 0) {
      errors.weight_target = "Weight target must be greater than 0";
    }
    if (!formData.target_date) {
      errors.target_date = "Target date is required";
    } else {
      const targetDate = new Date(formData.target_date);
      if (targetDate <= new Date()) {
        errors.target_date = "Target date must be in the future";
      }
    }

    if (formData.daily_calorie_target && (formData.daily_calorie_target < 500 || formData.daily_calorie_target > 5000)) {
      errors.daily_calorie_target = "Calorie target must be between 500-5000";
    }
    if (formData.daily_protein_target && formData.daily_protein_target <= 0) {
      errors.daily_protein_target = "Protein target must be greater than 0";
    }
    if (formData.daily_water_target && formData.daily_water_target <= 0) {
      errors.daily_water_target = "Water target must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Convert date to ISO format with time
      const targetDate = formData.target_date
        ? new Date(formData.target_date + "T00:00:00").toISOString()
        : "";

      const payload: UserGoalInput = {
        weight_target: formData.weight_target!,
        target_date: targetDate,
        weekly_loss_rate: formData.weekly_loss_rate,
        daily_calorie_target: formData.daily_calorie_target,
        daily_protein_target: formData.daily_protein_target,
        daily_water_target: formData.daily_water_target,
        custom_tips_enabled: formData.custom_tips_enabled ?? true,
      };

      if (goal) {
        await updateGoal(payload);
      } else {
        await createGoal(payload);
      }

      await refresh();
    } catch (err) {
      console.error("Failed to save goal:", err);
      setValidationErrors({
        submit: err instanceof Error ? err.message : "Failed to save goal",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteGoal();
      setShowDeleteConfirm(false);
      await refresh();
    } catch (err) {
      console.error("Failed to delete goal:", err);
      setValidationErrors({
        submit: err instanceof Error ? err.message : "Failed to delete goal",
      });
    } finally {
      setDeleting(false);
    }
  };

  const currentWeight = dashboard?.latest_weight ?? null;
  const daysUntilGoal = goal
    ? Math.ceil(
        (new Date(goal.target_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const weightToLose = currentWeight && goal ? currentWeight - goal.weight_target : null;
  const weeksTillGoal = daysUntilGoal / 7;
  const requiredWeeklyLoss = weightToLose && weeksTillGoal ? weightToLose / weeksTillGoal : null;

  const isRealisticGoal = requiredWeeklyLoss ? Math.abs(requiredWeeklyLoss) >= 0.5 && Math.abs(requiredWeeklyLoss) <= 1.5 : true;

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1200px] mx-auto">
      <TopBar user={user} subtitle="Set weight and fitness targets" />

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Spinner size="lg" className="text-cyan-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Goal Summary */}
          <div className="lg:col-span-2">
            {goal && !showForm ? (
              <Card className="p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Current Goal</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowForm(true)}
                      variant="secondary"
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="secondary"
                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white border-rose-500"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Target Weight
                    </p>
                    <p className="text-2xl font-black text-cyan-400 mt-1">
                      {goal.weight_target.toFixed(1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Target Date
                    </p>
                    <p className="text-2xl font-black text-white mt-1">
                      {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  </div>
                  {currentWeight && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Current Weight
                      </p>
                      <p className="text-2xl font-black text-white mt-1">
                        {currentWeight.toFixed(1)} kg
                      </p>
                    </div>
                  )}
                  {weightToLose !== null && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {weightToLose < 0 ? "To Gain" : "To Lose"}
                      </p>
                      <p
                        className={`text-2xl font-black mt-1 ${
                          weightToLose <= 0 ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {weightToLose < 0 ? "+" : "-"}{Math.abs(weightToLose).toFixed(1)} kg
                      </p>
                    </div>
                  )}
                </div>

                {/* Goal Metrics */}
                {daysUntilGoal > 0 && (
                  <div className="bg-slate-800 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                      Pace Analysis
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Days remaining</p>
                        <p className="text-lg font-bold text-white">
                          {daysUntilGoal}
                        </p>
                      </div>
                      {requiredWeeklyLoss !== null && (
                        <div>
                          <p className="text-xs text-slate-400">
                            {requiredWeeklyLoss < 0 ? "Required gain/week" : "Required loss/week"}
                          </p>
                          <p className="text-lg font-bold text-white">
                            {requiredWeeklyLoss < 0 ? "+" : "-"}{Math.abs(requiredWeeklyLoss).toFixed(2)} kg
                          </p>
                        </div>
                      )}
                    </div>

                    {!isRealisticGoal && (
                      <div className="mt-3 bg-rose-900 border border-rose-400 rounded p-2 flex items-start gap-2">
                        <AlertIcon className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-rose-200">
                          {weightToLose && weightToLose < 0
                            ? "This goal may be aggressive. Safe weight gain is 0.5-1.5kg/week. Consider extending your timeline or adjusting your target."
                            : "This goal may be aggressive. Safe weight loss is 0.5-1.5kg/week. Consider extending your timeline or adjusting your target."}
                        </p>
                      </div>
                    )}

                    {isRealisticGoal && (
                      <div className="mt-3 bg-emerald-900 border border-emerald-400 rounded p-2 flex items-start gap-2">
                        <CheckIcon className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-emerald-200">
                          Your goal pace is realistic and achievable with
                          consistent effort.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Targets */}
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-3">
                    Custom Targets
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {goal.daily_calorie_target && (
                      <div>
                        <p className="text-xs text-slate-400">Calories/day</p>
                        <p className="text-lg font-bold text-white">
                          {goal.daily_calorie_target}
                        </p>
                      </div>
                    )}
                    {goal.daily_protein_target && (
                      <div>
                        <p className="text-xs text-slate-400">Protein/day</p>
                        <p className="text-lg font-bold text-white">
                          {goal.daily_protein_target.toFixed(0)}g
                        </p>
                      </div>
                    )}
                    {goal.daily_water_target && (
                      <div>
                        <p className="text-xs text-slate-400">Water/day</p>
                        <p className="text-lg font-bold text-white">
                          {goal.daily_water_target.toFixed(0)}ml
                        </p>
                      </div>
                    )}
                    {goal.custom_tips_enabled && (
                      <div className="flex items-center gap-1">
                        <CheckIcon className="h-4 w-4 text-emerald-400" />
                        <p className="text-xs text-slate-300">AI tips enabled</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nutritional Insights */}
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-xs font-semibold uppercase text-blue-400 mb-3">
                    💡 Nutritional Insights & Targets
                  </p>
                  <div className="space-y-3">
                    {goal.daily_calorie_target && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-xs text-slate-300 font-medium">Daily Calorie Target</p>
                          <p className="text-xs font-bold text-white">{goal.daily_calorie_target} kcal</p>
                        </div>
                        <p className="text-xs text-slate-400">
                          {weightToLose && weightToLose < 0
                            ? "Create a slight calorie surplus to support weight gain and muscle building."
                            : "Maintain this calorie intake to achieve consistent, sustainable weight loss."}
                        </p>
                      </div>
                    )}
                    {goal.daily_protein_target && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-xs text-slate-300 font-medium">Daily Protein Target</p>
                          <p className="text-xs font-bold text-white">{goal.daily_protein_target.toFixed(0)}g</p>
                        </div>
                        <p className="text-xs text-slate-400">
                          Aim for ~{(goal.daily_protein_target / 4).toFixed(0)}g per meal (if eating 3-4 meals). This supports muscle
                          {weightToLose && weightToLose < 0 ? " growth" : " preservation"} throughout your goal.
                        </p>
                      </div>
                    )}
                    {goal.daily_water_target && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-xs text-slate-300 font-medium">Daily Water Target</p>
                          <p className="text-xs font-bold text-white">{(goal.daily_water_target / 1000).toFixed(1)}L</p>
                        </div>
                        <p className="text-xs text-slate-400">
                          Drink consistently throughout the day. Proper hydration supports metabolism, reduces hunger, and improves recovery.
                        </p>
                      </div>
                    )}
                    {!goal.daily_protein_target && !goal.daily_calorie_target && !goal.daily_water_target && (
                      <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
                        <p className="text-xs text-slate-300 font-medium mb-2">🤖 AI Recommendations</p>
                        <p className="text-xs text-slate-400">
                          No custom targets set. When you save this goal, AI will automatically calculate:
                        </p>
                        <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                          <li>Calorie target based on your BMR and goal type</li>
                          <li>Protein target for muscle preservation/growth</li>
                          <li>Water intake target based on your weight</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : !showForm && !goal ? (
              <Card className="p-6 mb-6 text-center">
                <LightBulbIcon className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-white mb-2">
                  No Goal Set Yet
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Set a weight loss goal to unlock personalized suggestions,
                  track progress, and stay motivated.
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Create Goal
                </Button>
              </Card>
            ) : null}

            {/* Goal Form */}
            {showForm && (
              <Card className="p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  {goal ? "Update Goal" : "Create Goal"}
                </h2>

                {!goal && (
                  <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-xs font-semibold uppercase text-emerald-400 mb-2">
                      🤖 AI-Powered Auto-Calculation
                    </p>
                    <p className="text-xs text-emerald-200 mb-3">
                      Leave calorie, protein, and water targets blank to get AI-calculated recommendations tailored to your profile and goal.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Calories</p>
                        <p className="font-bold text-emerald-400">Auto-calculated</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Protein</p>
                        <p className="font-bold text-emerald-400">Auto-calculated</p>
                      </div>
                      <div className="hidden sm:block bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400">Water</p>
                        <p className="font-bold text-emerald-400">Auto-calculated</p>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-1">
                      Target Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight_target ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight_target: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-3 sm:py-2 text-white focus:outline-none focus:border-cyan-400 min-h-12 sm:min-h-auto"
                      placeholder="e.g., 75"
                    />
                    {validationErrors.weight_target && (
                      <p className="text-xs text-rose-400 mt-1">
                        {validationErrors.weight_target}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-1">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={formData.target_date ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_date: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-3 sm:py-2 text-white focus:outline-none focus:border-cyan-400 min-h-12 sm:min-h-auto"
                    />
                    {validationErrors.target_date && (
                      <p className="text-xs text-rose-400 mt-1">
                        {validationErrors.target_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-1">
                      Target Loss per Week (kg) - Optional
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="1.5"
                      value={formData.weekly_loss_rate ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weekly_loss_rate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-3 sm:py-2 text-white focus:outline-none focus:border-cyan-400 min-h-12 sm:min-h-auto"
                      placeholder="0.5 - 1.5 kg/week (safe range)"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-1">
                      Daily Calorie Target - Optional
                    </label>
                    <input
                      type="number"
                      min="500"
                      max="5000"
                      value={formData.daily_calorie_target ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          daily_calorie_target: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-3 sm:py-2 text-white focus:outline-none focus:border-cyan-400 min-h-12 sm:min-h-auto"
                      placeholder="e.g., 2000"
                    />
                    {validationErrors.daily_calorie_target && (
                      <p className="text-xs text-rose-400 mt-1">
                        {validationErrors.daily_calorie_target}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-1">
                      Daily Protein Target (g) - Optional
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.daily_protein_target ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          daily_protein_target: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-3 sm:py-2 text-white focus:outline-none focus:border-cyan-400 min-h-12 sm:min-h-auto"
                      placeholder="e.g., 120"
                    />
                    {validationErrors.daily_protein_target && (
                      <p className="text-xs text-rose-400 mt-1">
                        {validationErrors.daily_protein_target}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-1">
                      Daily Water Target (ml) - Optional
                    </label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={formData.daily_water_target ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          daily_water_target: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-3 sm:py-2 text-white focus:outline-none focus:border-cyan-400 min-h-12 sm:min-h-auto"
                      placeholder="e.g., 2000"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="custom_tips"
                      checked={formData.custom_tips_enabled ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          custom_tips_enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                    />
                    <label
                      htmlFor="custom_tips"
                      className="text-sm text-slate-300"
                    >
                      Enable AI-generated personalized tips
                    </label>
                  </div>

                  {validationErrors.submit && (
                    <div className="bg-rose-900 border border-rose-400 rounded p-3 flex items-start gap-2">
                      <AlertIcon className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-rose-200">
                        {validationErrors.submit}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="mr-2" /> Saving...
                        </>
                      ) : (
                        "Save Goal"
                      )}
                    </Button>
                    {goal && (
                      <Button
                        onClick={() => {
                          setShowForm(false);
                          refresh();
                        }}
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            )}
          </div>

          {/* Tips Sidebar */}
          <div>
            <Card className="p-5 bg-blue-900 border-blue-500 border">
              <h3 className="text-sm font-bold text-blue-100 mb-3">
                💡 Goal Setting Tips
              </h3>
              <ul className="space-y-2 text-xs text-blue-100">
                <li>
                  <strong>Be Realistic:</strong> Aim for 0.5-1.5 kg per week
                </li>
                <li>
                  <strong>Give Yourself Time:</strong> Most goals take 12-26
                  weeks
                </li>
                <li>
                  <strong>Set Custom Targets:</strong> Protein and calorie goals
                  help align your diet
                </li>
                <li>
                  <strong>Enable Tips:</strong> AI suggestions adapt to your
                  progress
                </li>
                <li>
                  <strong>Track Consistently:</strong> Daily logging improves
                  accuracy
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <Card className="p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">Delete Goal?</h3>
            <p className="text-sm text-slate-300 mb-4">
              Are you sure you want to delete this goal? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
