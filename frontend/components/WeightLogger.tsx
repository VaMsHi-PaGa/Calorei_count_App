"use client";

import { useState, type FormEvent } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";
import { WeightIcon } from "./ui/Icons";

type WeightLoggerProps = {
  loading: boolean;
  latestWeight: number | null;
  onSubmit: (weight: number) => Promise<void>;
};

export function WeightLogger({
  loading,
  latestWeight,
  onSubmit,
}: WeightLoggerProps) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFeedback("");
    const weight = Number(value);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
      setError("Enter a weight between 1 and 500 kg.");
      return;
    }
    try {
      await onSubmit(weight);
      setFeedback(`Logged ${weight.toFixed(1)} kg ✓`);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log weight.");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-400">
          <WeightIcon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-bold text-white">Log weight</h2>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        {latestWeight !== null
          ? `Last recorded: ${latestWeight.toFixed(1)} kg`
          : "Track your weight to see your trend."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="e.g. 75.5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
            kg
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={loading || !value.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : (
            "Save weight"
          )}
        </Button>
      </form>

      {feedback && (
        <p className="mt-3 text-sm text-emerald-300 bg-emerald-950/30 border border-emerald-900/50 rounded-lg px-3 py-2">
          {feedback}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-rose-300 bg-rose-950/30 border border-rose-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </Card>
  );
}
