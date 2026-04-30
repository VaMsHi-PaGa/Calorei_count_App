// API base URL — uses environment variable, falls back to local backend
const API_BASE_URL = (() => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // In browser, use the current host with port 8000
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    // Use same protocol as frontend, port 8000 for backend
    return `${protocol}//${host}:8000`;
  }

  // Fallback for server-side (should not be used in production)
  return "http://localhost:8000";
})();

// Default timeout for fast endpoints. AI-powered endpoints (food-log)
// override this with a longer value because Ollama can take 30–60s.
const DEFAULT_TIMEOUT_MS = 15000;
const AI_TIMEOUT_MS = 90000;

// ---------- Types ----------

export type User = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  height: number;
  age: number;
  gender: string;
  dietary_preference: string | null;
  activity_level: string | null;
  onboarding_complete: boolean;
};

export type StreakData = {
  food_streak: number;
  food_best_streak: number;
  food_last_logged: string | null;
  water_streak: number;
  water_best_streak: number;
  water_last_logged: string | null;
  weight_streak: number;
  weight_best_streak: number;
  weight_last_logged: string | null;
};

export type WeeklyDay = {
  avg_calories: number;
  avg_protein: number;
  avg_weight: number;
};

export type WeeklySummary = {
  this_week: WeeklyDay;
  last_week: WeeklyDay;
  week_start: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
};

export type DashboardData = {
  user: User;
  bmi: number | null;
  calorie_target: number | null;
  latest_weight: number | null;
  total_calories_today: number;
  total_protein_today: number;
  total_carbs_today: number;
  total_fat_today: number;
};

export type FoodLog = {
  id: number;
  user_id: number;
  food_text: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
};

export type WeightLog = {
  id: number;
  user_id: number;
  weight: number;
  date: string;
};

export type UserGoal = {
  id: number;
  user_id: number;
  weight_target: number;
  target_date: string;
  weekly_loss_rate: number | null;
  daily_calorie_target: number | null;
  daily_protein_target: number | null;
  daily_water_target: number | null;
  custom_tips_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type UserGoalInput = {
  weight_target: number;
  target_date: string;
  weekly_loss_rate?: number | null;
  daily_calorie_target?: number | null;
  daily_protein_target?: number | null;
  daily_water_target?: number | null;
  custom_tips_enabled?: boolean;
};

export type Suggestion = {
  title: string;
  description: string;
  category: "habit" | "nutrition" | "goal_pace" | "ai_insight";
  priority: "high" | "medium" | "low";
  action?: string | null;
};

export type Report = {
  user_id: number;
  period: {
    start: string;
    end: string;
  };
  generated_at: string;
  summary: Record<string, unknown>;
  metrics: Record<string, unknown>;
  food_analysis: {
    frequent_foods: Array<{
      food_text: string;
      count: number;
      category: string;
    }>;
    problematic_foods: Array<{
      food_text: string;
      frequency: number;
      quality_score: number;
      concerns: string[];
      impact_rating: "high" | "medium" | "low";
      latest_entry: Record<string, unknown>;
    }>;
  };
  goal_progress: Record<string, unknown>;
  trends: Record<string, unknown>;
  suggestions: Suggestion[];
  metadata: Record<string, unknown>;
};

export type ReportEligibility = {
  eligible: boolean;
  days_logged: number;
  min_required: number;
  message: string;
};

// ---------- Token Management ----------

const TOKEN_STORAGE_KEY = "fitness_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "fitness_refresh_token";

export function getStoredTokens() {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function storeTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

// ---------- Core request helper ----------

async function request<T>(
  path: string,
  options?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const controller = new AbortController();
  const timeout = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId =
    typeof window !== "undefined"
      ? window.setTimeout(() => controller.abort(), timeout)
      : null;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists (except for auth endpoints)
    if (!path.startsWith("/auth/") && typeof window !== "undefined") {
      const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Merge with options headers
    if (options?.headers) {
      const optionHeaders = options.headers as Record<string, string>;
      Object.assign(headers, optionHeaders);
    }

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      console.error("API request failed:", {
        url,
        status: response.status,
        statusText: response.statusText,
        body,
      });
      const message =
        body &&
        typeof body === "object" &&
        "detail" in body &&
        typeof (body as { detail: unknown }).detail === "string"
          ? (body as { detail: string }).detail
          : response.statusText || "Something went wrong.";
      throw new Error(message);
    }

    return body as T;
  } catch (caught) {
    if (caught instanceof DOMException && caught.name === "AbortError") {
      throw new Error(
        `Request timed out. Backend may be unreachable at ${API_BASE_URL}.`
      );
    }
    throw caught;
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  }
}

// ---------- Endpoints ----------

export function getDashboard() {
  return request<DashboardData>(`/dashboard`, {
    cache: "no-store",
  });
}

export function getUser(userId: number) {
  return request<User>(`/users/${userId}`, { cache: "no-store" });
}

export function updateUserProfile(data: {
  email?: string;
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
  age?: number;
  height?: number;
  gender?: string;
}) {
  return request<User>("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function logFood(foodText: string) {
  return request<FoodLog>("/food-log", {
    method: "POST",
    body: JSON.stringify({ food_text: foodText }),
    timeoutMs: AI_TIMEOUT_MS,
  });
}

export function logWeight(weight: number) {
  return request<WeightLog>("/weight-log", {
    method: "POST",
    body: JSON.stringify({ weight }),
  });
}

export function getWeightLogs(limit = 30) {
  return request<WeightLog[]>(`/weight-log?limit=${limit}`, {
    cache: "no-store",
  });
}

export function getFoodLogs(options?: {
  limit?: number;
  todayOnly?: boolean;
}) {
  const limit = options?.limit ?? 20;
  const todayOnly = options?.todayOnly ?? false;
  const params = `limit=${limit}&today_only=${todayOnly}`;
  return request<FoodLog[]>(`/food-log?${params}`, { cache: "no-store" });
}

// ---------- Auth Endpoints ----------

export function signup(
  email: string,
  password: string,
  height: number,
  age: number,
  gender: string,
  firstName?: string,
  lastName?: string,
  preferredName?: string
) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, height, age, gender, first_name: firstName, last_name: lastName, preferred_name: preferredName }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function refreshToken(refreshTokenValue: string) {
  return request<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });
}

export function forgotPassword(email: string) {
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return request<AuthResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

// ---------- Goals Endpoints ----------

export function createGoal(goalData: UserGoalInput) {
  return request<UserGoal>("/api/goals", {
    method: "POST",
    body: JSON.stringify(goalData),
  });
}

export function getGoal() {
  return request<UserGoal>("/api/goals", {
    cache: "no-store",
  });
}

export function updateGoal(goalData: Partial<UserGoalInput>) {
  return request<UserGoal>("/api/goals", {
    method: "PATCH",
    body: JSON.stringify(goalData),
  });
}

export function deleteGoal() {
  return request<void>("/api/goals", {
    method: "DELETE",
  });
}

// ---------- Reports Endpoints ----------

export function checkReportEligibility() {
  return request<ReportEligibility>("/api/reports/check-eligibility", {
    cache: "no-store",
  });
}

export function getReport(days: number = 30) {
  return request<Report>(`/api/reports?days=${days}`, {
    cache: "no-store",
    timeoutMs: AI_TIMEOUT_MS, // Reports may generate AI suggestions
  });
}

export function getSuggestions(days: number = 7, useAI: boolean = true) {
  return request<{
    suggestions: Suggestion[];
    generated_at: string;
    count: number;
  }>(`/api/reports/suggestions?days=${days}&use_ai=${useAI}`, {
    cache: "no-store",
    timeoutMs: AI_TIMEOUT_MS,
  });
}

export function exportReport(
  format: "json" | "html" | "pdf" = "json",
  days: number = 30
) {
  // Return the download URL instead of fetching the content
  const token = typeof window !== "undefined"
    ? localStorage.getItem(TOKEN_STORAGE_KEY)
    : null;
  const url = `${API_BASE_URL}/api/reports/export?format=${format}&days=${days}`;
  return {
    url,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

export function emailReport(days: number = 30) {
  return request<{
    status: "sent" | "pending" | "error";
    message: string;
    recipient: string;
  }>(`/api/reports/email?days=${days}`, {
    method: "POST",
  });
}

export function getReportHealth() {
  return request<{
    status: "healthy" | "degraded";
    services: Record<string, string>;
  }>("/api/reports/health", {
    cache: "no-store",
  });
}

export function getStreaks() {
  return request<StreakData>("/api/streaks", { cache: "no-store" });
}

export function getWeeklySummary() {
  return request<WeeklySummary>("/api/reports/weekly-summary", { cache: "no-store" });
}

export function completeOnboarding(data: {
  dietary_preference?: string;
  activity_level?: string;
}) {
  return request<{ ok: boolean; onboarding_complete: boolean }>("/users/me/onboarding", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
