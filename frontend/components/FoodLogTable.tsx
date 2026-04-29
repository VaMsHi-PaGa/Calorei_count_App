import type { FoodLog } from "@/services/api";
import { Card } from "./ui/Card";

type FoodLogTableProps = {
  logs: FoodLog[];
  title?: string;
};

function classifyMeal(dateString: string): string {
  const hour = new Date(dateString).getHours();
  if (hour < 11) return "Breakfast";
  if (hour < 15) return "Lunch";
  if (hour < 18) return "Snack";
  return "Dinner";
}

const mealColors: Record<string, string> = {
  Breakfast: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  Lunch: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Snack: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  Dinner: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
};

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FoodLogTable({
  logs,
  title = "Today's meals",
}: FoodLogTableProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <span className="text-xs text-slate-400">
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-10 text-sm text-slate-400">
          No meals logged yet today. Add your first one above.
        </div>
      ) : (
        <div className="divide-y divide-slate-700">
          {logs.map((log) => {
            const meal = classifyMeal(log.created_at);
            const tag = mealColors[meal] ?? "bg-slate-800 text-slate-300 border border-slate-700";
            return (
              <div
                key={log.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-xs sm:text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${tag}`}
                  >
                    {meal}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">
                      {log.food_text}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatTime(log.created_at)} ·{" "}
                      {Math.round(log.protein)}P · {Math.round(log.carbs)}C ·{" "}
                      {Math.round(log.fat)}F
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-orange-400 shrink-0">
                  {Math.round(log.calories)} kcal
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
