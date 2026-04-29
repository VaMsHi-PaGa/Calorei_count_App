"use client";

import { motion } from "framer-motion";

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Cyan orb — top left */}
      <motion.div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(76,215,246,0.18) 0%, rgba(76,215,246,0.07) 50%, transparent 70%)",
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Violet orb — right */}
      <motion.div
        className="absolute top-[20%] -right-60 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(208,188,255,0.15) 0%, rgba(139,92,246,0.07) 50%, transparent 70%)",
        }}
        animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      {/* Emerald orb — bottom */}
      <motion.div
        className="absolute -bottom-60 left-[25%] w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.13) 0%, rgba(16,185,129,0.05) 50%, transparent 70%)",
        }}
        animate={{ x: [0, 20, 0], y: [0, -25, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />
      {/* Subtle mesh overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(76,215,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(76,215,246,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
