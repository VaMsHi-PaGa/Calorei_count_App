"use client";

import type { User } from "@/services/api";

type TopBarProps = {
  user: User | null;
  subtitle?: string;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getDisplayName(user: User | null | undefined): string {
  // Prioritize: preferred name > first name > email extraction
  if (user?.preferred_name) return user.preferred_name;
  if (user?.first_name) return user.first_name;

  // Fallback to email extraction
  if (!user?.email) return "there";
  const local = user.email.split("@")[0];
  if (!local) return "there";
  // Strip digits, capitalize
  const clean = local.replace(/[0-9_.-]+/g, "").trim();
  if (!clean) return local;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function TopBar({ user, subtitle }: TopBarProps) {
  const greeting = getGreeting();
  const name = getDisplayName(user);
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {greeting}, {name} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          {subtitle ?? `Here's your fitness summary for ${today}`}
        </p>
      </div>
    </div>
  );
}
