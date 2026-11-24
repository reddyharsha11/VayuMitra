"use client";

import React, { useState } from "react";
import { GenAIRecommendation, Language, LiveAqiData } from "@/lib/types";
import { ImpactSimulator } from "./ImpactSimulator";
import { ShareAdvisory } from "./ShareAdvisory";
import {
  Sun,
  SunMedium,
  Moon,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  ShieldAlert,
  Wind,
  Droplets,
  Flower2,
  Fan,
  TrendingDown,
  Info,
} from "lucide-react";

interface ActionPlanSectionProps {
  recommendation: GenAIRecommendation;
  language: Language;
  city?: string;
  liveAqi?: LiveAqiData | null;
}

export function ActionPlanSection({
  recommendation,
  language,
  city = "Delhi",
  liveAqi,
}: ActionPlanSectionProps) {
  const [activeTab, setActiveTab] = useState<"routine" | "indoor" | "alternatives">("routine");
  const [checkedHacks, setCheckedHacks] = useState<Record<string, boolean>>({});

  const toggleHack = (id: string) => {
    setCheckedHacks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isHindi = language === "hi";

  const getRiskBadge = (risk: "Low" | "Moderate" | "High") => {
    switch (risk) {
      case "Low":
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {isHindi ? "कम जोखिम" : "Low Risk"}
          </span>
        );
      case "Moderate":
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {isHindi ? "मध्यम जोखिम" : "Moderate Risk"}
          </span>
        );
      case "High":
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {isHindi ? "उच्च जोखिम" : "High Risk"}
          </span>
        );
    }
  };

  const getHackIcon = (category: string) => {
    switch (category) {
      case "ventilation":
        return <Wind className="w-5 h-5 text-teal-600" />;
      case "cleaning":
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case "purification":
        return <Fan className="w-5 h-5 text-indigo-600" />;
      case "plants":
        return <Flower2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section
      aria-label="Personalized GenAI Action Plan"
      className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/90 shadow-sm transition-all"
    >
      {/* GenAI Severity Summary Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-50/90 via-sky-50/60 to-emerald-50/70 p-5 border border-teal-200/70 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xs font-bold tracking-wide uppercase text-teal-800">
                  {isHindi ? "AI स्वास्थ्य और वायु परामर्श" : "VayuMitra Personalized Epidemiological Assessment"}
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-100/70 text-teal-900 font-semibold">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed">
                {recommendation.severitySummary}
              </p>
            </div>
          </div>

          {/* 1-Click Community & Family Advisory Share */}
          <div className="shrink-0 self-start md:self-center">
            <ShareAdvisory
              city={city}
              naqi={liveAqi?.naqi ?? 160}
              category={liveAqi?.category ?? "Moderate"}
              cleanAirWindow={liveAqi?.cleanAirWindow?.label ?? "2:00 PM – 4:00 PM IST"}
              pm2_5={liveAqi?.current?.pm2_5 ?? 65}
              topActions={[
                recommendation.dailyRoutine.morning.action,
                recommendation.dailyRoutine.afternoon.action,
              ]}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-2 overflow-x-auto">
        <div className="flex gap-2" role="tablist" aria-label="Action plan category tabs">
          <button
            id="tab-routine"
            role="tab"
            aria-selected={activeTab === "routine"}
            aria-controls="panel-routine"
            onClick={() => setActiveTab("routine")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
              activeTab === "routine"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>{isHindi ? "दैनिक दिनचर्या" : "1. Low-Emission Daily Routine"}</span>
          </button>

          <button
            id="tab-indoor"
            role="tab"
            aria-selected={activeTab === "indoor"}
            aria-controls="panel-indoor"
            onClick={() => setActiveTab("indoor")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
              activeTab === "indoor"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>{isHindi ? "घरेलू वायु उपाय" : "2. Indoor Air Quality Hacks"}</span>
            <span className="text-xs px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-full font-bold">
              4
            </span>
          </button>

          <button
            id="tab-alternatives"
            role="tab"
            aria-selected={activeTab === "alternatives"}
            aria-controls="panel-alternatives"
            onClick={() => setActiveTab("alternatives")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
              activeTab === "alternatives"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>{isHindi ? "टिकाऊ बदलाव" : "3. Sustainable Shifts & Impact"}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden lg:block font-medium">
          Evidence-based civic guidance
        </div>
      </div>

      {/* PILLAR 1: Low-Emission Daily Routine */}
      {activeTab === "routine" && (
        <div id="panel-routine" role="tabpanel" aria-labelledby="tab-routine" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Morning */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-900">
                    {recommendation.dailyRoutine.morning.time}
                  </span>
                </div>
                {getRiskBadge(recommendation.dailyRoutine.morning.exposureRisk)}
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {recommendation.dailyRoutine.morning.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {recommendation.dailyRoutine.morning.action}
              </p>
            </div>
            <div className="pt-3 border-t border-amber-100">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                {isHindi ? "नागरिक उत्सर्जन टिप" : "Low-Emission Action"}
              </span>
              <p className="text-xs text-slate-700 font-medium">
                {recommendation.dailyRoutine.morning.emissionTip}
              </p>
            </div>
          </div>

          {/* Afternoon (Clean Air Window) */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-teal-50/60 to-white border-2 border-teal-500/80 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#0D9488] text-white text-[10px] font-bold tracking-wide uppercase shadow-sm">
              ★ Clean Window Priority
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-100 text-[#0F766E]">
                    <SunMedium className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-900">
                    {recommendation.dailyRoutine.afternoon.time}
                  </span>
                </div>
                {getRiskBadge(recommendation.dailyRoutine.afternoon.exposureRisk)}
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {recommendation.dailyRoutine.afternoon.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {recommendation.dailyRoutine.afternoon.action}
              </p>
            </div>
            <div className="pt-3 border-t border-teal-100">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                {isHindi ? "नागरिक उत्सर्जन टिप" : "Low-Emission Action"}
              </span>
              <p className="text-xs text-slate-700 font-medium">
                {recommendation.dailyRoutine.afternoon.emissionTip}
              </p>
            </div>
          </div>

          {/* Evening */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-900">
                    {recommendation.dailyRoutine.evening.time}
                  </span>
                </div>
                {getRiskBadge(recommendation.dailyRoutine.evening.exposureRisk)}
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {recommendation.dailyRoutine.evening.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {recommendation.dailyRoutine.evening.action}
              </p>
            </div>
            <div className="pt-3 border-t border-indigo-100">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                {isHindi ? "नागरिक उत्सर्जन टिप" : "Low-Emission Action"}
              </span>
              <p className="text-xs text-slate-700 font-medium">
                {recommendation.dailyRoutine.evening.emissionTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 2: Indoor Air Quality (IAQ) Hacks */}
      {activeTab === "indoor" && (
        <div id="panel-indoor" role="tabpanel" aria-labelledby="tab-indoor" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendation.indoorHacks.map((hack) => {
            const isChecked = !!checkedHacks[hack.id];
            return (
              <div
                key={hack.id}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                aria-label={`${hack.title}: ${hack.action}`}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    toggleHack(hack.id);
                  }
                }}
                onClick={() => toggleHack(hack.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-4 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                  isChecked
                    ? "bg-teal-50/50 border-teal-300 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-sm"
                }`}
              >
                <div className="mt-0.5 text-teal-700">
                  {isChecked ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-600 fill-teal-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded-md bg-slate-100">
                      {getHackIcon(hack.category)}
                    </span>
                    <h4
                      className={`text-sm font-bold ${
                        isChecked ? "text-teal-900 line-through opacity-85" : "text-slate-900"
                      }`}
                    >
                      {hack.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                    {hack.action}
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-100/70 text-teal-900 text-[11px] font-semibold">
                    <Info className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>{hack.impact}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PILLAR 3: Sustainable Alternatives & Direct Impact */}
      {activeTab === "alternatives" && (
        <div id="panel-alternatives" role="tabpanel" aria-labelledby="tab-alternatives" className="space-y-4">
          {/* Interactive Exposure & Emission Impact Simulator */}
          <ImpactSimulator
            ambientPm25={liveAqi?.current?.pm2_5 ?? 65}
            language={language}
          />

          <div className="pt-2">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {isHindi ? "दैनिक आदतों के टिकाऊ विकल्प" : "Personalized Habit Shifts"}
            </span>
          </div>

          {recommendation.sustainableAlternatives.map((alt, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-sm hover:border-teal-300 transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Before: Current Habit */}
                <div className="p-4 rounded-xl bg-white border border-rose-200/90 shadow-2xs">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200 mb-1.5">
                    {isHindi ? "वर्तमान आदत (उच्च जोखिम)" : "Current Habit (High Exposure)"}
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {alt.currentHabit}
                  </p>
                </div>

                {/* After: Sustainable Alternative */}
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-300 shadow-2xs">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-100 text-teal-800 border border-teal-200 mb-1.5">
                    {isHindi ? "टिकाऊ विकल्प (कम उत्सर्जन)" : "Sustainable Alternative"}
                  </span>
                  <p className="text-xs font-bold text-teal-950">
                    {alt.sustainableAlternative}
                  </p>
                </div>
              </div>

              {/* Rationale and Metric */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <p className="text-slate-600 flex-1">
                  <strong className="text-slate-800 font-semibold">
                    {isHindi ? "वैज्ञानिक कारण:" : "Why It Matters:"}{" "}
                  </strong>
                  {alt.whyItMatters}
                </p>
                <div className="shrink-0 px-3 py-1 rounded-lg bg-emerald-100/80 text-emerald-900 font-mono text-[11px] font-bold border border-emerald-300">
                  🌱 {alt.directImpactMetric}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
