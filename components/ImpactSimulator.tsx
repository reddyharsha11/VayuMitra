"use client";

import React, { useState, useId } from "react";
import { calculateCommuteImpact, CommuteMode } from "@/lib/aqi-math";
import { Language } from "@/lib/types";
import { Car, Train, Home, ShieldCheck, Leaf, Info, Sliders } from "lucide-react";

interface ImpactSimulatorProps {
  ambientPm25: number;
  language?: Language;
}

export function ImpactSimulator({
  ambientPm25,
  language = "en",
}: ImpactSimulatorProps) {
  const [distanceKm, setDistanceKm] = useState<number>(10);
  const [mode, setMode] = useState<CommuteMode>("public_transit_n95");
  const sliderId = useId();

  const isHindi = language === "hi";
  const result = calculateCommuteImpact(distanceKm, mode, ambientPm25);

  const MODES: Array<{
    id: CommuteMode;
    label: string;
    labelHi: string;
    sub: string;
    subHi: string;
    icon: typeof Car;
  }> = [
    {
      id: "car",
      label: "Solo Petrol Car / Cab",
      labelHi: "अकेली पेट्रोल कार / टैक्सी",
      sub: "Baseline (0% reduction)",
      subHi: "आधार रेखा (0% कटौती)",
      icon: Car,
    },
    {
      id: "public_transit_n95",
      label: "Metro / Bus + N95",
      labelHi: "मेट्रो / बस + N95 मास्क",
      sub: "95% filtration + 73% lower CO₂",
      subHi: "95% पार्टिकुलेट फ़िल्टर + कम CO₂",
      icon: Train,
    },
    {
      id: "wfh",
      label: "Combine Trips / WFH",
      labelHi: "WFH / संयुक्त यात्रा",
      sub: "100% emission & exposure avoided",
      subHi: "100% शून्य उत्सर्जन और जोखिम टला",
      icon: Home,
    },
  ];

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-teal-50/60 via-white to-slate-50 p-5 md:p-6 border border-teal-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-teal-100/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {isHindi ? "अपनी यात्रा का प्रभाव मापें (सिम्युलेटर)" : "Exposure & Emission Impact Simulator"}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {isHindi
                ? "लाइव AQI और अपने दैनिक आवागमन के आधार पर वास्तविक बचत देखें"
                : "Real-time savings based on today's live PM2.5 and your daily transit choice"}
            </p>
          </div>
        </div>

        <span className="self-start sm:self-center px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
          {isHindi ? "लाइव AQI मॉडल" : `Live PM2.5: ${Math.round(ambientPm25)} µg/m³`}
        </span>
      </div>

      {/* Distance Slider */}
      <div className="mb-5 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={sliderId} className="text-xs font-bold text-slate-700">
            {isHindi ? "दैनिक यात्रा की दूरी (एक तरफ):" : "One-Way Commute Distance:"}
          </label>
          <span className="text-sm font-mono font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
            {distanceKm} km{" "}
            <span className="text-[11px] font-normal text-slate-500">
              ({distanceKm * 2} km/day)
            </span>
          </span>
        </div>
        <input
          id={sliderId}
          type="range"
          min={2}
          max={30}
          step={1}
          value={distanceKm}
          onChange={(e) => setDistanceKm(Number(e.target.value))}
          className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          aria-label="Daily commute distance in kilometers"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>2 km</span>
          <span>10 km</span>
          <span>20 km</span>
          <span>30 km</span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-5">
        <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {isHindi ? "आवागमन का विकल्प चुनें:" : "Choose Your Commute Mode:"}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MODES.map((item) => {
            const Icon = item.icon;
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-teal-600 text-white border-teal-700 shadow-sm ring-2 ring-teal-500/20"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-teal-100" : "text-teal-600"}`} />
                  <span className="text-xs font-bold truncate">
                    {isHindi ? item.labelHi : item.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] ${
                    isSelected ? "text-teal-100" : "text-slate-500"
                  }`}
                >
                  {isHindi ? item.subHi : item.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Savings Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Metric 1: Inhaled Exposure Avoided */}
        <div className="p-4 rounded-xl bg-white border border-teal-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              {isHindi ? "PM2.5 जोखिम से बचाव" : "Inhaled PM2.5 Avoided"}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-black text-slate-900">
                {mode === "car" ? "0" : `+${result.exposureAvoidedUgDay}`}
              </span>
              <span className="text-xs font-semibold text-slate-500">µg / day</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {mode === "car"
                ? isHindi
                  ? "कार केबिन में बिना N95 के 1.2x सड़क स्तर जोखिम"
                  : "Unmitigated on-road traffic inhalation"
                : isHindi
                ? "N95/WFH द्वारा फेफड़ों में जाने से रोका गया सूक्ष्म कण"
                : "Protected from alveolar deep-lung deposition"}
            </span>
          </div>
        </div>

        {/* Metric 2: CO2e Emissions Saved */}
        <div className="p-4 rounded-xl bg-white border border-teal-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
            <Leaf className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              {isHindi ? "CO₂e उत्सर्जन की बचत" : "CO₂e Emissions Saved"}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-black text-slate-900">
                {mode === "car" ? "0" : `+${result.co2eSavedKgWeek}`}
              </span>
              <span className="text-xs font-semibold text-slate-500">kg / week</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {mode === "car"
                ? isHindi
                  ? "साप्ताहिक 5 दिन का पेट्रोल उत्सर्जन (~" + (distanceKm * 10 * 0.15).toFixed(1) + " kg)"
                  : `Solo car footprint: ${(distanceKm * 10 * 0.15).toFixed(1)} kg CO₂e/week`
                : isHindi
                ? "सड़क पर वाहनों का धुआं घटाने में आपका योगदान"
                : `Avoids ~${(result.co2eSavedKgWeek * 52).toFixed(0)} kg CO₂e greenhouse gas/yr`}
            </span>
          </div>
        </div>
      </div>

      {/* Formula Footnote */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
        <Info className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-tight">
          <strong className="text-teal-900 font-semibold">
            {isHindi ? "वैज्ञानिक गणना:" : "Formula Methodology:"}{" "}
          </strong>
          {result.formulaNote}
        </p>
      </div>
    </div>
  );
}
