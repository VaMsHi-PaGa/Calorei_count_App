import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-600 ${className}`}
      {...props}
    />
  );
}
