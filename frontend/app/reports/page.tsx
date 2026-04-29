"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useUser } from "@/components/UserProvider";
import {
  DownloadIcon,
  SendIcon,
  AlertIcon,
  CheckIcon,
  LightBulbIcon,
} from "@/components/ui/Icons";
import {
  checkReportEligibility,
  getReport,
  exportReport,
  emailReport,
  type ReportEligibility,
  type Report,
  type Suggestion,
} from "@/services/api";

export default function ReportsPage() {
  return (
    <AppShell>
      <ReportsContent />
    </AppShell>
  );
}

function ReportsContent() {
  const { user } = useUser();
  const [eligible, setEligible] = useState<ReportEligibility | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const eligibilityData = await checkReportEligibility();
      setEligible(eligibilityData);

      if (eligibilityData.eligible) {
        const reportData = await getReport(days);
        setReport(reportData);
      } else {
        setReport(null);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to load report:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load report data"
      );
    }
  }, [days]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await refresh();
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExport = async (format: "json" | "html" | "pdf") => {
    setExporting(true);
    try {
      const exportData = exportReport(format, days);
      const link = document.createElement("a");
      link.href = exportData.url;
      if (exportData.headers.Authorization) {
        // For browsers that support it, we can pass headers
        // For now, rely on JWT in URL or cookie
      }
      link.download = `fittrack-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to export report"
      );
    } finally {
      setExporting(false);
    }
  };

  const handleEmailReport = async () => {
    setEmailing(true);
    try {
      const result = await emailReport(days);
      if (result.status === "sent" || result.status === "pending") {
        setError(null);
        // Show success message
        alert(`Report sent to ${result.recipient}`);
      } else {
        setError(result.message || "Failed to send email");
      }
    } catch (err) {
      console.error("Email failed:", err);
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setEmailing(false);
    }
  };

  const getSuggestionsByPriority = (suggestions: Suggestion[]) => {
    return {
      high: suggestions.filter((s) => s.priority === "high"),
      medium: suggestions.filter((s) => s.priority === "medium"),
      low: suggestions.filter((s) => s.priority === "low"),
    };
  };

  const getSuggestionIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertIcon className="h-4 w-4 text-rose-400" />;
      case "medium":
        return <LightBulbIcon className="h-4 w-4 text-amber-400" />;
      default:
        return <CheckIcon className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 lg:px-10 lg:py-8 max-w-[1200px] mx-auto">
      <TopBar user={user} subtitle="View detailed analytics and export reports" />

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Spinner size="lg" className="text-cyan-400" />
        </div>
      ) : !eligible?.eligible ? (
        <Card className="p-8 text-center max-w-md mx-auto">
          <AlertIcon className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">
            Not Enough Data Yet
          </h2>
          <p className="text-slate-400 mb-4">
            You need to log at least {eligible?.min_required} days of activity
            to unlock reports.
          </p>
          <p className="text-sm text-slate-500">
            Currently logged: {eligible?.days_logged} day
            {(eligible?.days_logged ?? 0) !== 1 ? "s" : ""}
          </p>
          <a href="/weight" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
            Start logging →
          </a>
        </Card>
      ) : (
        <>
          {/* Report Controls */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">
                  Analytics Report
                </h2>
                <p className="text-sm text-slate-400">
                  Last {days} days of activity
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={days}
                  onChange={(e) => {
                    setDays(parseInt(e.target.value));
                  }}
                  className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <Button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  {generatingReport ? (
                    <>
                      <Spinner size="sm" className="mr-2" /> Generating...
                    </>
                  ) : (
                    "Regenerate"
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {error && (
            <Card className="p-4 bg-rose-900 border-rose-400 border mb-6">
              <div className="flex items-start gap-2">
                <AlertIcon className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-rose-200">{error}</p>
              </div>
            </Card>
          )}

          {/* Report Content */}
          {report && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <Card className="p-6">
                <h3 className="text-base font-bold text-white mb-4">
                  Period Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(report.summary).slice(0, 5).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-slate-800 rounded p-3 text-center"
                    >
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-xl font-bold text-cyan-400 mt-1">
                        {typeof value === "number"
                          ? (value as number).toFixed(
                              (value as number) % 1 !== 0
                                ? 1
                                : 0
                            )
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Average Metrics */}
              <Card className="p-6">
                <h3 className="text-base font-bold text-white mb-4">
                  Daily Averages
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { key: "avg_calories", label: "Calories" },
                    { key: "avg_protein", label: "Protein (g)" },
                    { key: "avg_carbs", label: "Carbs (g)" },
                    { key: "avg_fat", label: "Fat (g)" },
                    { key: "avg_weight", label: "Weight (kg)" },
                    { key: "avg_bmi", label: "BMI" },
                  ].map(({ key, label }) => {
                    const value = (report.metrics as Record<string, unknown>)[key];
                    return value ? (
                      <div key={key} className="bg-slate-800 rounded p-3">
                        <p className="text-xs text-slate-400 truncate">
                          {label}
                        </p>
                        <p className="text-lg font-bold text-white mt-1">
                          {typeof value === "number"
                            ? (value as number).toFixed(1)
                            : String(value)}
                        </p>
                      </div>
                    ) : null;
                  })}
                </div>
              </Card>

              {/* Food Analysis */}
              {report.food_analysis && (
                <Card className="p-6">
                  <h3 className="text-base font-bold text-white mb-4">
                    Food Analysis
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Frequent Foods */}
                    {report.food_analysis.frequent_foods &&
                      report.food_analysis.frequent_foods.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-300 mb-3">
                            Most Logged Foods
                          </h4>
                          <div className="space-y-2">
                            {report.food_analysis.frequent_foods
                              .slice(0, 5)
                              .map((food, idx) => (
                                <div
                                  key={idx}
                                  className="bg-slate-800 rounded p-2 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {food.food_text}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {food.category}
                                    </p>
                                  </div>
                                  <span className="bg-cyan-900 text-cyan-300 text-xs font-bold rounded px-2 py-1">
                                    {food.count}x
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Problematic Foods */}
                    {report.food_analysis.problematic_foods &&
                      report.food_analysis.problematic_foods.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-300 mb-3">
                            Foods to Watch
                          </h4>
                          <div className="space-y-2">
                            {report.food_analysis.problematic_foods
                              .slice(0, 5)
                              .map((food, idx) => (
                                <div
                                  key={idx}
                                  className="bg-slate-800 border-l-2 border-rose-400 rounded p-2"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-white">
                                        {food.food_text}
                                      </p>
                                      <p className="text-xs text-slate-400 mt-1">
                                        Quality: {food.quality_score}/100
                                      </p>
                                      {food.concerns.length > 0 && (
                                        <p className="text-xs text-rose-300 mt-1">
                                          {food.concerns
                                            .slice(0, 2)
                                            .join(", ")}
                                        </p>
                                      )}
                                    </div>
                                    <span className={`text-xs font-bold rounded px-2 py-1 ${
                                      food.impact_rating === "high"
                                        ? "bg-rose-900 text-rose-300"
                                        : food.impact_rating === "medium"
                                          ? "bg-amber-900 text-amber-300"
                                          : "bg-slate-700 text-slate-300"
                                    }`}>
                                      {food.impact_rating.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </Card>
              )}

              {/* Weight Trends */}
              {report.trends && Object.keys(report.trends).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-base font-bold text-white mb-4">
                    Weight Trend Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded p-4">
                      <p className="text-xs text-slate-400 mb-1">Trend</p>
                      <p className="text-2xl font-bold text-white">
                        {((report.trends as Record<string, unknown>)["trend"] as string || "unknown").toUpperCase()}
                      </p>
                    </div>
                    <div className="bg-slate-800 rounded p-4">
                      <p className="text-xs text-slate-400 mb-1">
                        Slope (kg/week)
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {((report.trends as Record<string, unknown>)["slope"] as number || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {((report.trends as Record<string, unknown>)["insight"] as string) && (
                    <p className="text-sm text-slate-300 mt-4 italic">
                      "
                      {((report.trends as Record<string, unknown>)["insight"] as string)}
                      "
                    </p>
                  )}
                </Card>
              )}

              {/* Suggestions */}
              {report.suggestions && report.suggestions.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <LightBulbIcon className="h-5 w-5 text-amber-400" />
                    Personalized Suggestions
                  </h3>

                  <div className="space-y-4">
                    {(() => {
                      const grouped = getSuggestionsByPriority(
                        report.suggestions
                      );
                      return (
                        <>
                          {grouped.high.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                                Priority Actions
                              </p>
                              <div className="space-y-2">
                                {grouped.high.map((sugg, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-slate-800 border-l-2 border-rose-400 rounded p-3"
                                  >
                                    <div className="flex items-start gap-2">
                                      {getSuggestionIcon(sugg.priority)}
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-white">
                                          {sugg.title}
                                        </p>
                                        <p className="text-xs text-slate-300 mt-1">
                                          {sugg.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {grouped.medium.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-slate-400 mb-2 mt-4">
                                General Tips
                              </p>
                              <div className="space-y-2">
                                {grouped.medium.map((sugg, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-slate-800 rounded p-3"
                                  >
                                    <div className="flex items-start gap-2">
                                      {getSuggestionIcon(sugg.priority)}
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-white">
                                          {sugg.title}
                                        </p>
                                        <p className="text-xs text-slate-300 mt-1">
                                          {sugg.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </Card>
              )}

              {/* Export Options */}
              <Card className="p-6 bg-slate-900 border-slate-700 border">
                <h3 className="text-base font-bold text-white mb-4">
                  Export Report
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Download or share your report in your preferred format
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    onClick={() => handleExport("json")}
                    disabled={exporting}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    JSON
                  </Button>
                  <Button
                    onClick={() => handleExport("html")}
                    disabled={exporting}
                    className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    HTML
                  </Button>
                  <Button
                    onClick={() => handleExport("pdf")}
                    disabled={exporting}
                    className="bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    onClick={handleEmailReport}
                    disabled={emailing}
                    className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <SendIcon className="h-4 w-4" />
                    Email
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
