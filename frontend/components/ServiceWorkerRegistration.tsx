"use client";

import { useEffect } from "react";

function scheduleDailyNudge(hour: number, minute: number, title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  const delay = next.getTime() - now.getTime();
  setTimeout(() => {
    new Notification(title, { body, icon: "/icon-192.png", tag: `fittrack-${hour}` });
    // Re-schedule for the next day
    scheduleDailyNudge(hour, minute, title, body);
  }, delay);
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[SW] Registered", reg.scope);
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });

    // Request notification permission and schedule daily nudges
    if ("Notification" in window && Notification.permission === "default") {
      // Delay the permission prompt slightly so it doesn't fire immediately on load
      const timer = setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            scheduleDailyNudge(12, 30, "🍽️ Lunch log reminder", "Don't forget to log your lunch!");
            scheduleDailyNudge(20, 0, "💧 Water & evening check-in", "Have you logged your water and dinner today?");
          }
        });
      }, 5000);
      return () => clearTimeout(timer);
    } else if (Notification.permission === "granted") {
      scheduleDailyNudge(12, 30, "🍽️ Lunch log reminder", "Don't forget to log your lunch!");
      scheduleDailyNudge(20, 0, "💧 Water & evening check-in", "Have you logged your water and dinner today?");
    }
  }, []);

  return null;
}
