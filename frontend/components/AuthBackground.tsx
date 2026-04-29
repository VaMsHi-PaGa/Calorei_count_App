"use client";

import { motion } from "framer-motion";
import {
  FlameIcon,
  FoodIcon,
  WaterIcon,
  WeightIcon,
  GoalIcon,
  HeartIcon,
  DumbbellIcon,
  LeafIcon,
  RunningIcon,
  AnalyticsIcon,
  SaladIcon,
  ScaleIcon,
} from "./ui/Icons";

type FloatingItem = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  left: string;
  top: string;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotateRange: number;
  yRange: number;
};

const ICONS: FloatingItem[] = [
  { Icon: SaladIcon,    left: "4%",  top: "8%",  size: 52, color: "text-emerald-400", delay: 0,   duration: 7,  rotateRange: 12, yRange: 18 },
  { Icon: FlameIcon,    left: "88%", top: "6%",  size: 60, color: "text-orange-400",  delay: 1.2, duration: 8,  rotateRange: 10, yRange: 22 },
  { Icon: DumbbellIcon, left: "2%",  top: "42%", size: 48, color: "text-cyan-400",    delay: 0.5, duration: 9,  rotateRange: 8,  yRange: 20 },
  { Icon: WaterIcon,    left: "91%", top: "38%", size: 44, color: "text-sky-400",     delay: 2,   duration: 6,  rotateRange: 15, yRange: 16 },
  { Icon: FoodIcon,     left: "6%",  top: "75%", size: 50, color: "text-lime-400",    delay: 0.8, duration: 8,  rotateRange: 10, yRange: 20 },
  { Icon: GoalIcon,     left: "87%", top: "72%", size: 48, color: "text-violet-400",  delay: 1.5, duration: 7,  rotateRange: 12, yRange: 18 },
  { Icon: HeartIcon,    left: "18%", top: "10%", size: 40, color: "text-rose-400",    delay: 3,   duration: 10, rotateRange: 8,  yRange: 14 },
  { Icon: AnalyticsIcon,left: "78%", top: "12%", size: 44, color: "text-cyan-300",    delay: 0.3, duration: 9,  rotateRange: 6,  yRange: 18 },
  { Icon: WeightIcon,   left: "14%", top: "62%", size: 42, color: "text-indigo-400",  delay: 2.5, duration: 11, rotateRange: 10, yRange: 16 },
  { Icon: LeafIcon,     left: "82%", top: "55%", size: 46, color: "text-green-400",   delay: 1.8, duration: 8,  rotateRange: 14, yRange: 20 },
  { Icon: RunningIcon,  left: "50%", top: "88%", size: 50, color: "text-amber-400",   delay: 0.6, duration: 7,  rotateRange: 8,  yRange: 14 },
  { Icon: ScaleIcon,    left: "24%", top: "88%", size: 38, color: "text-teal-400",    delay: 4,   duration: 9,  rotateRange: 12, yRange: 16 },
];

export function AuthBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-slate-950"
      aria-hidden
    >
      {/* Aurora orbs */}
      <motion.div
        className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(76,215,246,0.10) 0%, rgba(76,215,246,0.04) 50%, transparent 70%)",
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[15%] -right-56 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(208,188,255,0.08) 0%, rgba(139,92,246,0.03) 50%, transparent 70%)",
        }}
        animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute -bottom-64 left-[20%] w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.07) 0%, rgba(16,185,129,0.02) 50%, transparent 70%)",
        }}
        animate={{ x: [0, 20, 0], y: [0, -25, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(76,215,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(76,215,246,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating food & fitness icons */}
      {ICONS.map(({ Icon, left, top, size, color, delay, duration, rotateRange, yRange }, i) => (
        <motion.div
          key={i}
          className={`absolute ${color} opacity-[0.12]`}
          style={{ left, top }}
          animate={{
            y: [0, -yRange, 0],
            rotate: [-rotateRange / 2, rotateRange / 2, -rotateRange / 2],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        >
          <Icon width={size} height={size} />
        </motion.div>
      ))}
    </div>
  );
}
