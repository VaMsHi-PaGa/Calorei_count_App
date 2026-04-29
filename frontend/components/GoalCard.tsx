import { Card } from "./ui/Card";
import { GoalIcon } from "./ui/Icons";

type GoalCardProps = {
  consumed: number;
  target: number | null;
};

export function GoalCard({ consumed, target }: GoalCardProps) {
  const hasTarget = typeof target === "number" && target > 0;
  const percent = hasTarget ? Math.min(100, Math.round((consumed / target!) * 100)) : 0;
  const remaining = hasTarget ? Math.max(0, Math.round(target! - consumed)) : 0;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
          <GoalIcon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-white">Daily goal</h3>
      </div>

      {hasTarget ? (
        <>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-3xl font-black text-white">{percent}%</p>
            <p className="text-sm text-slate-400">
              {remaining > 0 ? `${remaining} kcal left` : "Target hit"}
            </p>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {Math.round(consumed)} of {Math.round(target!)} kcal target
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-400">
          Log your weight to set a calorie target.
        </p>
      )}
    </Card>
  );
}
