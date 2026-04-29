"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnalyticsIcon,
  DashboardIcon,
  FoodIcon,
  GoalIcon,
  InsightIcon,
  LogoutIcon,
  ReportIcon,
  SettingsIcon,
  WaterIcon,
  WeightIcon,
} from "./ui/Icons";
import type { User } from "@/services/api";
import type { ComponentType, SVGProps } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/food-log", label: "Food Log", icon: FoodIcon },
  { href: "/water", label: "Water Intake", icon: WaterIcon },
  { href: "/weight", label: "Weight Tracker", icon: WeightIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/insights", label: "Insights", icon: InsightIcon },
  { href: "/goals", label: "Goals", icon: GoalIcon },
  { href: "/reports", label: "Reports", icon: ReportIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

type SidebarProps = {
  user: User | null;
  onLogout: () => void;
};

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const initial = (user?.preferred_name?.[0] || user?.first_name?.[0] || user?.email?.[0])?.toUpperCase() ?? "U";
  const displayName = user?.preferred_name || user?.first_name || user?.email?.split("@")[0] || "User";

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-slate-950 border-r border-slate-800/50 min-h-screen sticky top-0 shadow-2xl shadow-cyan-900/5 z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <span className="text-white text-lg font-black">F</span>
          </div>
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 tracking-tight">
            FitTrack
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-cyan-500/10 to-transparent text-white border-r-2 border-cyan-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate capitalize">
              {displayName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-cyan-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50"
            aria-label="Log out"
            title="Log out"
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
