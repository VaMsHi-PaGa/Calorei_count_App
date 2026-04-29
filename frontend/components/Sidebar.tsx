"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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

const navContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};

const navItemVariant = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

type SidebarProps = {
  user: User | null;
  onLogout: () => void;
};

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const initial = (user?.preferred_name?.[0] || user?.first_name?.[0] || user?.email?.[0])?.toUpperCase() ?? "U";
  const displayName = user?.preferred_name || user?.first_name || user?.email?.split("@")[0] || "User";

  return (
    <motion.aside
      className="hidden lg:flex w-64 flex-col border-r border-slate-800/60 min-h-screen sticky top-0 z-50"
      style={{ background: "rgba(2,8,23,0.85)", backdropFilter: "blur(24px)" }}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800/60">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <span className="text-white text-lg font-black">F</span>
          </div>
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 tracking-tight">
            FitTrack
          </span>
        </motion.div>
      </div>

      {/* Navigation */}
      <motion.nav
        className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto"
        variants={navContainer}
        initial="hidden"
        animate="show"
      >
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <motion.div key={item.href} variants={navItemVariant}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/5 text-white border border-cyan-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                    active ? "text-cyan-400" : "group-hover:text-cyan-400"
                  }`}
                />
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* User profile */}
      <motion.div
        className="px-3 pb-4 pt-2 border-t border-slate-800/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
      >
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-cyan-500/20">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate capitalize">
              {displayName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email ?? ""}</p>
          </div>
          <motion.button
            onClick={onLogout}
            className="text-slate-400 hover:text-cyan-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Log out"
            title="Log out"
          >
            <LogoutIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.aside>
  );
}
