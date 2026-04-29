"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";
import { useUser } from "./UserProvider";

export function SignupScreen() {
  const router = useRouter();
  const { signup, loading, error } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    preferredName: "",
    height: "",
    age: "",
    gender: "male",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validation
    if (!formData.email.trim()) {
      setLocalError("Please enter your email.");
      return;
    }

    if (formData.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const height = Number(formData.height);
    if (!height || height <= 0 || height > 300) {
      setLocalError("Please enter a valid height in cm.");
      return;
    }

    const age = Number(formData.age);
    if (!age || age <= 0 || age > 150) {
      setLocalError("Please enter a valid age.");
      return;
    }

    try {
      await signup(
        formData.email,
        formData.password,
        height,
        age,
        formData.gender,
        formData.firstName || undefined,
        formData.lastName || undefined,
        formData.preferredName || undefined
      );
      router.push("/");
    } catch {
      // error already set in provider
    }
  };

  const message = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xl font-black">F</span>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              FitTrack
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Get started</h1>
          <p className="text-sm text-slate-600 mt-1">
            Create an account to track your fitness journey
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                inputMode="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  First Name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Last Name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="preferredName"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Preferred Name (Optional)
              </label>
              <Input
                id="preferredName"
                type="text"
                name="preferredName"
                placeholder="What should we call you?"
                value={formData.preferredName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password (min 8 characters)
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
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
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="height"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Height (cm)
                </label>
                <Input
                  id="height"
                  type="number"
                  name="height"
                  inputMode="numeric"
                  placeholder="170"
                  value={formData.height}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  name="age"
                  inputMode="numeric"
                  placeholder="25"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
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
              disabled={
                loading ||
                !formData.email.trim() ||
                !formData.password ||
                !formData.height ||
                !formData.age
              }
              className="w-full"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-center text-xs text-slate-600">
              Already have an account?{" "}
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
