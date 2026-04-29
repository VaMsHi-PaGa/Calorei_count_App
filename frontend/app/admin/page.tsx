"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUser } from "@/components/UserProvider";

export default function AdminPage() {
  const router = useRouter();
  const { user, authReady } = useUser();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (authReady && !user) {
      router.push("/login");
    }
  }, [user, authReady, router]);

  if (!authReady || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const deleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage("❌ Please enter an email");
      return;
    }

    if (!confirm(`Delete user ${email}? This action cannot be undone.`)) return;

    setLoading(true);
    setMessage("");

    try {
      // First, get the user ID by email (this would need an endpoint)
      // For now, show instructions to use the CLI method
      setMessage(
        "❌ Web deletion requires additional backend endpoints. Use the CLI method instead:\n\npython3 /tmp/delete_helper.py delete " +
          email
      );
    } catch (error) {
      setMessage("❌ Error: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-2">Admin Panel</h1>
        <p className="text-slate-400 mb-6">Database Management Tools</p>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 whitespace-pre-wrap font-mono text-sm ${
              message.includes("✅")
                ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-950/30 border border-rose-500/30 text-rose-300"
            }`}
          >
            {message}
          </div>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Delete User</h2>
          <form onSubmit={deleteUser} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="test@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button variant="secondary" type="submit" disabled={loading} className="!bg-rose-950">
              Delete User
            </Button>
          </form>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Command Line Tools</h2>
          <p className="text-slate-300 mb-4">Use these commands in your terminal:</p>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-900 p-3 rounded border border-slate-700">
              <p className="text-cyan-400 font-mono">python3 /tmp/delete_helper.py list</p>
              <p className="text-slate-400 text-xs mt-1">Show all users in database</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-700">
              <p className="text-cyan-400 font-mono">python3 /tmp/delete_helper.py delete [email]</p>
              <p className="text-slate-400 text-xs mt-1">Delete a specific user by email</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-700">
              <p className="text-cyan-400 font-mono">python3 /tmp/delete_helper.py clear-users</p>
              <p className="text-slate-400 text-xs mt-1">Delete all users</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-700">
              <p className="text-cyan-400 font-mono">python3 /tmp/delete_helper.py clear-food</p>
              <p className="text-slate-400 text-xs mt-1">Delete all food logs</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-700">
              <p className="text-cyan-400 font-mono">python3 /tmp/delete_helper.py clear-weight</p>
              <p className="text-slate-400 text-xs mt-1">Delete all weight logs</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Database Info</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p>
              📍 Location:{" "}
              <code className="bg-slate-900 px-2 py-1 rounded text-cyan-400">
                /home/ubuntu/fitness-app/database.db
              </code>
            </p>
            <p>🗂️ Type: SQLite 3</p>
            <p>✅ Connected via SQLAlchemy ORM</p>
            <p className="text-slate-400 mt-4">
              ⚠️ Warning: These tools permanently delete data. Use with caution!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
