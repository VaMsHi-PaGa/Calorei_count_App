"use client";

import { useState, type FormEvent } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";
import { PlusIcon, SparkleIcon } from "./ui/Icons";

type FoodLoggerProps = {
  loading: boolean;
  onSubmit: (text: string) => Promise<void>;
  feedback?: string;
  error?: string;
};

const SUGGESTIONS = [
  "1 cup of oatmeal with banana",
  "Grilled chicken salad",
  "2 boiled eggs and toast",
  "Greek yogurt with berries",
];

export function FoodLogger({
  loading,
  onSubmit,
  feedback,
  error,
}: FoodLoggerProps) {
  const [text, setText] = useState("");

  const submit = async (value: string) => {
    if (!value.trim() || loading) return;
    try {
      await onSubmit(value.trim());
      setText("");
    } catch {
      // Surfaced through the error prop by the caller.
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(text);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
          <SparkleIcon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-bold text-white">Log a meal</h2>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Describe what you ate and our AI will estimate the nutrition for you.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="e.g. 2 boiled eggs and a banana"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !text.trim()}
          className="sm:w-auto"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Estimating...
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              Log meal
            </>
          )}
        </Button>
      </form>

      {loading && (
        <p className="mt-3 text-xs text-slate-500">
          AI is analyzing your meal — this usually takes 20–40 seconds.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            disabled={loading}
            className="text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-3 py-1.5 rounded-full transition-colors"
          >
            + {s}
          </button>
        ))}
      </div>

      {feedback && (
        <p className="mt-4 text-sm text-emerald-300 bg-emerald-950/30 border border-emerald-900/50 rounded-lg px-3 py-2">
          {feedback}
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm text-rose-300 bg-rose-950/30 border border-rose-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </Card>
  );
}
