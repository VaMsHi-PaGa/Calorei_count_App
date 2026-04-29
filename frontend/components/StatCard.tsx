import type { ComponentType, ReactNode, SVGProps } from "react";
import { Card } from "./ui/Card";

type StatCardProps = {
  label: string;
  value: ReactNode;
  unit?: string;
  goal?: number;
  current?: number;
  accent?: "emerald" | "orange" | "blue" | "indigo" | "rose" | "amber";
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  hint?: ReactNode;
};

const accentMap = {
  emerald: { text: "text-cyan-400", bar: "bg-cyan-400", bg: "bg-cyan-500/10" },
  orange: { text: "text-orange-400", bar: "bg-orange-400", bg: "bg-orange-500/10" },
  blue: { text: "text-blue-400", bar: "bg-blue-400", bg: "bg-blue-500/10" },
  indigo: { text: "text-indigo-400", bar: "bg-indigo-400", bg: "bg-indigo-500/10" },
  rose: { text: "text-rose-400", bar: "bg-rose-400", bg: "bg-rose-500/10" },
  amber: { text: "text-amber-400", bar: "bg-amber-400", bg: "bg-amber-500/10" },
};

export function StatCard({
  label,
  value,
  unit,
  goal,
  current,
  accent = "emerald",
  icon: Icon,
  hint,
}: StatCardProps) {
  const colors = accentMap[accent];
  const showProgress =
    typeof goal === "number" && typeof current === "number" && goal > 0;
  const progress = showProgress
    ? Math.min(100, Math.round((current! / goal) * 100))
    : 0;

  return (
    <Card className="p-5" glow>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-black text-white">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>
      {showProgress ? (
        <div className="mt-4">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bar} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {progress}% of {goal}
            {unit ? ` ${unit}` : ""} goal
          </p>
        </div>
      ) : hint ? (
        <p className="mt-3 text-xs text-slate-400">{hint}</p>
      ) : null}
    </Card>
  );
}
