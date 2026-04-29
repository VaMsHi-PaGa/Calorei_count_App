"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";
import { useUser } from "./UserProvider";

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, loading, error } = useUser();
  const t = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const tokenError = !t;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(t!, password);
      router.push("/");
    } catch {
      // error already set in provider
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="w-full max-w-sm">
          <Card className="p-6 text-center">
            <div className="mb-4">
              <div className="text-5xl mb-3">⚠️</div>
              <h1 className="text-2xl font-bold text-slate-900">Invalid link</h1>
              <p className="text-sm text-slate-600 mt-2">
                The password reset link is invalid or has expired.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => router.push("/forgot-password")}
              className="w-full"
            >
              Request a new link
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const message = localError || error || (tokenError ? "Invalid or missing reset token." : "");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xl font-black">F</span>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              FitTrack
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create new password</h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter your new password below
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {message && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                {message}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !password || !confirmPassword}
              className="w-full"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>

            <p className="text-center text-xs text-slate-600">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
