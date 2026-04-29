"use client";

import Link from "next/link";

export function LandingCTA() {
  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:py-28 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/2 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 animate-fadeInUp">
          Ready to Transform Your Fitness?
        </h2>
        <p className="text-lg text-slate-400 mb-8 animate-fadeInUp delay-200">
          Join thousands of users tracking their fitness journey with FitTrack. Start your free account today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-fadeInUp delay-300">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center justify-center min-h-12"
          >
            Create Free Account
          </Link>
        </div>
        <p className="text-sm text-slate-500 animate-fadeInUp delay-400">
          💳 No credit card required. Full access to all features.
        </p>
      </div>
    </div>
  );
}
