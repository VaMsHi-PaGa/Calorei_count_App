"use client";

import { AppShell } from "./AppShell";
import { TopBar } from "./TopBar";
import { Card } from "./ui/Card";
import { useUser } from "./UserProvider";
import type { ComponentType, SVGProps } from "react";

type PageStubProps = {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  accent?: "emerald" | "blue" | "indigo" | "amber" | "rose";
};

const accentMap = {
  emerald: "bg-emerald-500/20 text-emerald-400",
  blue: "bg-blue-500/20 text-blue-400",
  indigo: "bg-indigo-500/20 text-indigo-400",
  amber: "bg-amber-500/20 text-amber-400",
  rose: "bg-rose-500/20 text-rose-400",
};

export function PageStub({
  title,
  subtitle,
  description,
  bullets,
  icon: Icon,
  accent = "emerald",
}: PageStubProps) {
  const { user } = useUser();
  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1100px] mx-auto">
        <TopBar user={user} subtitle={subtitle} />
        <Card className="p-8">
          <div className="flex flex-col items-start gap-4 max-w-xl">
            {Icon && (
              <div className={`p-3 rounded-xl ${accentMap[accent]}`}>
                <Icon className="h-6 w-6" />
              </div>
            )}
            <h2 className="text-2xl font-black text-white">{title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {description}
            </p>
            <ul className="space-y-2 mt-2">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 text-sm font-medium transition-colors"
              >
                Open Dashboard →
              </a>
              <a
                href="/food-log"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm font-medium transition-colors"
              >
                Log a Meal
              </a>
              <a
                href="/reports"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm font-medium transition-colors"
              >
                View Reports
              </a>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
