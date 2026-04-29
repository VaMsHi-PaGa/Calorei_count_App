import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gradient";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50",
  secondary:
    "bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50 border border-slate-700",
  ghost:
    "bg-transparent text-slate-300 hover:bg-slate-900/50 hover:text-white disabled:opacity-40",
  gradient:
    "bg-gradient-to-r from-cyan-400 to-violet-500 text-white hover:opacity-90 disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-11 sm:h-9 px-3 text-sm rounded-lg",
  md: "h-12 sm:h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-5 text-base rounded-xl",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
