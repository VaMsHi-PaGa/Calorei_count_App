import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glass?: boolean;
  glow?: boolean;
};

export function Card({ children, className = "", glass = true, glow = false, ...props }: CardProps) {
  const baseClasses = glass
    ? "rounded-2xl border border-slate-700 bg-slate-800/40 backdrop-blur-xl"
    : "rounded-2xl border border-slate-700 bg-slate-900/50";

  const glowClasses = glow ? "glow-effect" : "";

  return (
    <div
      className={`${baseClasses} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
