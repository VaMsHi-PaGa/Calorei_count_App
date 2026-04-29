"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding, createGoal } from "@/services/api";

const DIETARY_OPTIONS = [
  { value: "omnivore", label: "🍖 Omnivore", desc: "Everything, balanced" },
  { value: "vegetarian", label: "🥗 Vegetarian", desc: "No meat" },
  { value: "vegan", label: "🌱 Vegan", desc: "No animal products" },
  { value: "keto", label: "🥑 Keto", desc: "High fat, low carb" },
  { value: "paleo", label: "🦴 Paleo", desc: "Whole foods only" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "🪑 Sedentary", desc: "Little or no exercise" },
  { value: "light", label: "🚶 Light", desc: "Exercise 1–3 days/week" },
  { value: "moderate", label: "🏃 Moderate", desc: "Exercise 3–5 days/week" },
  { value: "active", label: "⚡ Active", desc: "Hard exercise 6–7 days/week" },
  { value: "very_active", label: "🔥 Very Active", desc: "Physical job + training" },
];

type Props = { userEmail: string };

export function OnboardingWizard({ userEmail }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dietary, setDietary] = useState("");
  const [activity, setActivity] = useState("");
  const [weightTarget, setWeightTarget] = useState("");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });

  const steps = ["Diet", "Activity", "Goal"];

  const handleFinish = async () => {
    setSaving(true);
    try {
      await completeOnboarding({ dietary_preference: dietary || undefined, activity_level: activity || undefined });
      if (weightTarget && targetDate) {
        await createGoal({ weight_target: Number(weightTarget), target_date: new Date(targetDate).toISOString() }).catch(() => {});
      }
      router.push("/");
    } catch {
      router.push("/");
    } finally {
      setSaving(false);
    }
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 max-w-sm">
        <div className="text-4xl mb-3">🎯</div>
        <h1 className="text-2xl font-black text-white">Let&apos;s set you up</h1>
        <p className="text-sm text-slate-400 mt-1">
          Hi {userEmail.split("@")[0]}! Quick 3-step setup to personalize FitTrack for you.
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex gap-2 mb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "bg-cyan-500" : "bg-slate-700"}`}
              />
              <p className={`text-xs mt-1 ${i === step ? "text-cyan-400" : "text-slate-600"}`}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="diet"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <h2 className="text-lg font-bold text-white mb-4">What&apos;s your dietary preference?</h2>
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDietary(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    dietary === opt.value
                      ? "border-cyan-500 bg-cyan-500/10 text-white"
                      : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-xs text-slate-400 ml-2">{opt.desc}</span>
                </button>
              ))}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 text-sm text-slate-400 hover:text-slate-200"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(1)}
                  disabled={!dietary}
                  className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-semibold text-sm hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="activity"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <h2 className="text-lg font-bold text-white mb-4">How active are you?</h2>
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActivity(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activity === opt.value
                      ? "border-cyan-500 bg-cyan-500/10 text-white"
                      : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-xs text-slate-400 ml-2">{opt.desc}</span>
                </button>
              ))}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 text-sm text-slate-400 hover:text-slate-200"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!activity}
                  className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-semibold text-sm hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="goal"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-white mb-4">Set your weight goal</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Target weight (kg)
                </label>
                <input
                  type="number"
                  value={weightTarget}
                  onChange={(e) => setWeightTarget(e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Target date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 text-sm text-slate-400 hover:text-slate-200"
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving…" : "Start Tracking 🚀"}
                </button>
              </div>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full py-2 text-xs text-slate-600 hover:text-slate-400"
              >
                Skip goal setup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
