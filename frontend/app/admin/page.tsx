"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://51.77.145.52:8000/users", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("fitness_access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number, email: string) => {
    if (!confirm(`Delete user ${email}? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      const response = await fetch(`http://51.77.145.52:8000/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("fitness_access_token")}`,
        },
      });

      if (response.ok) {
        setMessage(`✅ Deleted user: ${email}`);
        loadUsers();
      } else {
        setMessage("❌ Failed to delete user");
      }
    } catch (error) {
      setMessage("❌ Error deleting user");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (
      !confirm(
        "⚠️ This will delete ALL users and related data. Are you absolutely sure?"
      )
    )
      return;

    try {
      setLoading(true);
      for (const user of users) {
        await fetch(`http://51.77.145.52:8000/users/${user.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("fitness_access_token")}`,
          },
        });
      }
      setMessage("✅ All users deleted");
      setUsers([]);
    } catch (error) {
      setMessage("❌ Error clearing data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-2">Admin Panel</h1>
        <p className="text-slate-400 mb-6">⚠️ Temporary debug page - use with caution</p>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.includes("✅")
                ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-950/30 border border-rose-500/30 text-rose-300"
            }`}
          >
            {message}
          </div>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Database Users</h2>
          <p className="text-slate-400 mb-4">Total users: {users.length}</p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-400">ID</th>
                  <th className="text-left py-2 px-2 text-slate-400">Email</th>
                  <th className="text-left py-2 px-2 text-slate-400">Name</th>
                  <th className="text-left py-2 px-2 text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                    <td className="py-3 px-2 text-white">{user.id}</td>
                    <td className="py-3 px-2 text-white">{user.email}</td>
                    <td className="py-3 px-2 text-slate-300">
                      {user.preferred_name || user.first_name || "—"}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => deleteUser(user.id, user.email)}
                        disabled={loading}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs rounded disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={loadUsers}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="secondary"
                onClick={clearAllData}
                disabled={loading}
                className="!bg-rose-950 !text-rose-300 hover:!bg-rose-900"
              >
                ⚠️ Clear All Data
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Database Info</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p>📍 Database: SQLite at <code className="bg-slate-900 px-2 py-1 rounded">/home/ubuntu/fitness-app/database.db</code></p>
            <p>🗂️ Tables: users, food_logs, weight_logs, user_goals</p>
            <p>✅ Status: Connected via SQLAlchemy ORM</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
