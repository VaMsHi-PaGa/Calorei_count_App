"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type MacroChartProps = {
  protein: number;
  carbs: number;
  fat: number;
};

const MACROS = [
  { key: "protein", label: "Protein", color: "#ef4444", per_g: 4 },
  { key: "carbs", label: "Carbs", color: "#f59e0b", per_g: 4 },
  { key: "fat", label: "Fat", color: "#10b981", per_g: 9 },
] as const;

export function MacroChart({ protein, carbs, fat }: MacroChartProps) {
  const calorieValues = useMemo(
    () => [protein * 4, carbs * 4, fat * 9],
    [protein, carbs, fat]
  );
  const total = calorieValues.reduce((a, b) => a + b, 0);
  const empty = total <= 0;

  const data = useMemo(
    () => ({
      labels: MACROS.map((m) => m.label),
      datasets: [
        {
          data: empty ? [1, 1, 1] : calorieValues,
          backgroundColor: MACROS.map((m) => m.color),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    }),
    [calorieValues, empty]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: !empty,
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          padding: 10,
          cornerRadius: 8,
          titleColor: "#e2e8f0",
          bodyColor: "#e2e8f0",
          callbacks: {
            label: (ctx: { label?: string; parsed: number }) =>
              `${ctx.label}: ${Math.round(ctx.parsed)} kcal`,
          },
        },
      },
    }),
    [empty]
  );

  return (
    <div>
      <div className="relative h-40 sm:h-44 lg:h-48 w-full">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs font-medium text-slate-400">Calories</p>
          <p className="text-2xl font-black text-white">
            {Math.round(total)}
          </p>
          <p className="text-xs text-slate-500">from macros</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
        {MACROS.map((m) => {
          const grams =
            m.key === "protein" ? protein : m.key === "carbs" ? carbs : fat;
          return (
            <div
              key={m.key}
              className="flex flex-col items-center text-center px-2 py-2 rounded-lg bg-slate-800/40"
            >
              <span
                className="h-2 w-2 rounded-full mb-1.5"
                style={{ backgroundColor: m.color }}
              />
              <p className="text-xs font-medium text-slate-400">{m.label}</p>
              <p className="text-sm font-bold text-white">
                {Math.round(grams)}g
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
