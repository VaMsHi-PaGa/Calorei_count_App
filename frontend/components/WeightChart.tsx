"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { WeightLog } from "@/services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

type WeightChartProps = {
  weights: WeightLog[];
};

function rollingAverage(values: number[], window = 7): (number | null)[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    if (slice.length === 0) return null;
    const sum = slice.reduce((a, b) => a + b, 0);
    return Number((sum / slice.length).toFixed(2));
  });
}

export function WeightChart({ weights }: WeightChartProps) {
  const data = useMemo(() => {
    const sorted = [...weights].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    const labels = sorted.map((w) =>
      new Date(w.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    );
    const actual = sorted.map((w) => Number(w.weight));
    const avg = rollingAverage(actual, 7);

    return {
      labels,
      datasets: [
        {
          label: "Weight",
          data: actual,
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34, 211, 238, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#22d3ee",
          pointBorderColor: "#0e1416",
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
        {
          label: "7-day average",
          data: avg,
          borderColor: "#64748b",
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderDash: [6, 4],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    };
  }, [weights]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            pointStyle: "circle" as const,
            color: "#cbd5e1",
            font: { size: 12, weight: 500 as const },
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          padding: 10,
          cornerRadius: 8,
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          titleColor: "#e2e8f0",
          bodyColor: "#e2e8f0",
          callbacks: {
            label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
              const v = ctx.parsed.y;
              if (v === null) return "";
              return `${ctx.dataset.label}: ${v.toFixed(1)} kg`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8", font: { size: 11 } },
          border: { display: false },
        },
        y: {
          grid: { color: "#1e293b" },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
            callback: (v: number | string) => `${v} kg`,
          },
          border: { display: false },
        },
      },
    }),
    []
  );

  if (weights.length === 0) {
    return (
      <div className="h-40 sm:h-56 lg:h-64 flex items-center justify-center text-sm text-slate-400">
        No weight logs yet — start tracking to see your progress.
      </div>
    );
  }

  return (
    <div className="h-40 sm:h-56 lg:h-64">
      <Line data={data} options={options} />
    </div>
  );
}
