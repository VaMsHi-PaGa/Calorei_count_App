"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/components/UserProvider";
import { Input } from "@/components/ui/Input";
import { updateUserProfile } from "@/services/api";

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}

function SettingsContent() {
  const { user, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    age: user?.age || 0,
    height: user?.height || 0,
    gender: user?.gender || "male",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "age" || name === "height" ? parseInt(value) : value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateUserProfile({
        email: formData.email,
        age: formData.age,
        height: formData.height,
        gender: formData.gender,
      });
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[900px] mx-auto">
      <TopBar user={user} subtitle="Manage your profile and account" />

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white">Profile</h2>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="text-xs"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            message.includes("success")
              ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/30 border border-rose-500/30 text-rose-300"
          }`}>
            {message}
          </div>
        )}

        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">
                Age
              </label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="150"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">
                Height (cm)
              </label>
              <Input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="50"
                max="300"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Age
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {user.age} years
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Height
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {user.height} cm
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Gender
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-bold text-white mb-1">
          Sign out of FitTrack
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          You can sign back in anytime with your email and password.
        </p>
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </Card>
    </div>
  );
}
