"use client";

import { useState, type ReactNode } from "react";
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
import { Button } from "./ui/Button";
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

type MobileNavProps = {
  children: ReactNode;
  onLogout: () => void;
};

export function MobileNav({ children, onLogout }: MobileNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = () => {
    closeDrawer();
    onLogout();
  };

  return (
    <div className="flex flex-col min-h-screen lg:hidden bg-slate-950">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3 flex items-center justify-between">
        {/* Hamburger Button */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle navigation"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={drawerOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <span className="text-white text-sm font-black">F</span>
          </div>
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">FitTrack</span>
        </div>

        {/* Placeholder for right side */}
        <div className="w-10" />
      </div>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-slate-950 border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="pt-20 px-4 pb-6 border-b border-slate-800/50">
          <button
            onClick={closeDrawer}
            className="p-1 -ml-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Drawer Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
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

        {/* Drawer Footer - Logout */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-800/50">
          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            className="w-full justify-center gap-2"
          >
            <LogoutIcon className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-slate-950">{children}</main>
    </div>
  );
}
