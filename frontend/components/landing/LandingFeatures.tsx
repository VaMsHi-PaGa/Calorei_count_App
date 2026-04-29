"use client";

import { Card } from "@/components/ui/Card";
import {
  FlameIcon,
  ProteinIcon,
  TrendingUpIcon,
  SparkleIcon,
} from "@/components/ui/Icons";

const FEATURES = [
  {
    title: "Smart Tracking",
    description: "Log meals, weight, and metrics with AI-powered food recognition",
    icon: FlameIcon,
    color: "text-orange-400",
    bg: "from-orange-500/10 to-orange-500/5",
    border: "border-orange-500/20",
  },
  {
    title: "AI Insights",
    description: "Get personalized nutrition recommendations and progress analysis",
    icon: SparkleIcon,
    color: "text-cyan-400",
    bg: "from-cyan-500/10 to-cyan-500/5",
    border: "border-cyan-500/20",
  },
  {
    title: "Goal Setting",
    description: "Set realistic fitness targets with intelligent calorie calculations",
    icon: ProteinIcon,
    color: "text-rose-400",
    bg: "from-rose-500/10 to-rose-500/5",
    border: "border-rose-500/20",
  },
  {
    title: "Progress Analytics",
    description: "Visualize your fitness journey with detailed charts and trends",
    icon: TrendingUpIcon,
    color: "text-emerald-400",
    bg: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
  },
];

export function LandingFeatures() {
  return (
    <div id="features" className="bg-slate-950 py-20 px-4 sm:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 animate-fadeInUp">
            Why FitTrack?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto animate-fadeInUp delay-200">
            Everything you need to succeed on your fitness journey, powered by intelligent AI
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className={`animate-fadeInUp delay-${300 + index * 100}`}
              >
                <Card
                  className={`p-6 bg-gradient-to-br ${feature.bg} border ${feature.border} hover:border-opacity-100 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-${feature.color.split('-')[1]}-500/20 cursor-pointer`}
                >
                  <div className={`mb-4 ${feature.color} transform transition-transform duration-300 group-hover:scale-110`}>
                    <IconComponent width={32} height={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
