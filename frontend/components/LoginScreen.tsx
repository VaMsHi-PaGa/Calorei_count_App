"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";
import { useUser } from "./UserProvider";

export function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim()) {
      setLocalError("Please enter your email.");
      return;
    }

    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    try {
      await login(email, password);
      router.push("/");
    } catch {
      // error already set in provider
    }
  };

  const message = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animated-gradient-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center">
              <span className="text-white text-xl font-black">F</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              FitTrack
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to continue tracking your fitness journey
          </p>
        </div>

        <Card className="p-6 backdrop-blur-xl bg-slate-900/80 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-300 text-sm">
                {message}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !email.trim() || !password}
              className="w-full"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Create account
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
