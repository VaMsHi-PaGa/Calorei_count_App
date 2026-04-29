"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";
import { useUser } from "./UserProvider";

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, loading, error } = useUser();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      // error already set in provider
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="text-sm text-slate-600 mt-1">
            We&apos;ll send you a link to reset your password
          </p>
        </div>

        <Card className="p-6">
          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
                <p className="font-medium mb-1">Check your email</p>
                <p>
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check
                  your inbox and follow the link to reset your password.
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Back to login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email address
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

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !email.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Back to login
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
