"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Logo } from "@/components/Logo";
import { AqiBadge } from "@/components/AqiBadge";
import { HourlyForecastChart } from "@/components/HourlyForecastChart";
import { ActionPlanSection } from "@/components/ActionPlanSection";
import { AskVayuMitra } from "@/components/AskVayuMitra";
import {
  LiveAqiData,
  HouseholdProfile,
  LifestyleToggles,
  Language,
  GenAIRecommendation,
} from "@/lib/types";
import {
  Search,
  Sparkles,
  RefreshCw,
  Clock,
  Radio,
  SlidersHorizontal,
  Home,
  Check,
  Zap,
  MapPin,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Flame,
  Wind,
  Navigation,
  Loader2,
} from "lucide-react";

interface PresetScenario {
  id: string;
  label: string;
  city: string;
  profile: HouseholdProfile;
  lifestyle: LifestyleToggles;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "delhi_kids",
    label: "Delhi · Family with Kids",
    city: "Delhi",
    profile: "family_with_kids",
    lifestyle: {
      hasAirPurifier: true,
      commuteOver10km: true,
      gasStoveOrKitchenExhaust: true,
    },
  },
  {
    id: "mumbai_commuter",
    label: "Mumbai · Daily Commuter",
    city: "Mumbai",
    profile: "daily_commuter",
    lifestyle: {
      hasAirPurifier: false,
      commuteOver10km: true,
      gasStoveOrKitchenExhaust: false,
    },
  },
  {
    id: "kolkata_senior",
    label: "Kolkata · Senior Citizen",
    city: "Kolkata",
    profile: "senior_asthma",
    lifestyle: {
      hasAirPurifier: false,
      commuteOver10km: false,
      gasStoveOrKitchenExhaust: true,
    },
  },
  {
    id: "bengaluru_athlete",
    label: "Bengaluru · Outdoor Student",
    city: "Bengaluru",
    profile: "student_athlete",
    lifestyle: {
      hasAirPurifier: false,
      commuteOver10km: true,
      gasStoveOrKitchenExhaust: false,
    },
  },
];

const POPULAR_CITIES = [
  "Delhi",
  "Mumbai",
  "Kolkata",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

export default function HomeDashboard() {
  const [cityInput, setCityInput] = useState("Delhi");
  const [activeCity, setActiveCity] = useState("Delhi");
  const [profile, setProfile] = useState<HouseholdProfile>("family_with_kids");
  const [lifestyle, setLifestyle] = useState<LifestyleToggles>({
    hasAirPurifier: true,
    commuteOver10km: true,
    gasStoveOrKitchenExhaust: true,
  });
  const [language, setLanguage] = useState<Language>("en");

  // GPS coordinate state — set when "Use My Location" succeeds, cleared on city input / preset clicks
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);

  const [liveAqi, setLiveAqi] = useState<LiveAqiData | null>(null);
  const [recommendation, setRecommendation] = useState<GenAIRecommendation | null>(null);
  const [loadingAqi, setLoadingAqi] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveIstTime, setLiveIstTime] = useState<string>("");

  const isHindi = language === "hi";

  // Real-time ticking IST clock for the modern transparent navbar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveIstTime(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch AQI Data
  const loadAqiData = useCallback(
    async (cityName?: string, coords?: { lat: number; lon: number }) => {
      setLoadingAqi(true);
      setError(null);
      try {
        const url = coords
          ? `/api/aqi?lat=${coords.lat}&lon=${coords.lon}`
          : `/api/aqi?city=${encodeURIComponent(cityName || "Delhi")}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load air quality telemetry");
        const data: LiveAqiData = await res.json();
        setLiveAqi(data);
        setActiveCity(data.resolvedCity || cityName || "Delhi");
        return data;
      } catch (err) {
        console.error(err);
        setError("Unable to reach air quality telemetry. Please check location and try again.");
        return null;
      } finally {
        setLoadingAqi(false);
      }
    },
    []
  );

  // Generate GenAI Recommendation
  const loadRecommendation = useCallback(
    async (
      cityName: string,
      prof: HouseholdProfile,
      life: LifestyleToggles,
      lang: Language,
      aqiSnapshot?: LiveAqiData
    ) => {
      setLoadingAi(true);
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: cityName,
            profile: prof,
            lifestyle: life,
            language: lang,
            liveAqi: aqiSnapshot
              ? {
                  naqi: aqiSnapshot.naqi,
                  category: aqiSnapshot.category,
                  dominantPollutant: aqiSnapshot.dominantPollutant,
                  cleanAirWindow: aqiSnapshot.cleanAirWindow.label,
                  pm2_5: aqiSnapshot.current.pm2_5,
                  pm10: aqiSnapshot.current.pm10,
                }
              : undefined,
          }),
        });

        if (!res.ok) throw new Error("Failed to formulate recommendations");
        const json = await res.json();
        if (json.recommendation) {
          setRecommendation(json.recommendation);
        }
      } catch (err) {
        console.error("AI recommendation error:", err);
      } finally {
        setLoadingAi(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const aqi = await loadAqiData("Delhi");
      if (isMounted && aqi) {
        await loadRecommendation("Delhi", "family_with_kids", {
          hasAirPurifier: true,
          commuteOver10km: true,
          gasStoveOrKitchenExhaust: true,
        }, "en", aqi);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [loadAqiData, loadRecommendation]);

  // Handle Preset Click — resets GPS state since user is explicitly choosing a city
  const handleSelectPreset = async (preset: PresetScenario) => {
    setCityInput(preset.city);
    setActiveCity(preset.city);
    setProfile(preset.profile);
    setLifestyle(preset.lifestyle);
    setGpsCoords(null); // clear GPS so submit uses city name

    const aqi = await loadAqiData(preset.city);
    if (aqi) {
      await loadRecommendation(preset.city, preset.profile, preset.lifestyle, language, aqi);
    }
  };

  // Handle Manual Form Search & Generate
  // If gpsCoords is active, fetch by coordinates (not city name text) to avoid geocoder round-trip
  const handleSubmitSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cityInput.trim() && !gpsCoords) return;

    if (gpsCoords) {
      const aqi = await loadAqiData(undefined, gpsCoords);
      if (aqi) {
        await loadRecommendation(aqi.resolvedCity, profile, lifestyle, language, aqi);
      }
    } else {
      const aqi = await loadAqiData(cityInput.trim());
      if (aqi) {
        await loadRecommendation(cityInput.trim(), profile, lifestyle, language, aqi);
      }
    }
  };

  // Handle GPS Location Click — stores raw lat/lon so re-analyze never geocodes the placeholder string
  const handleUseLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError(
        isHindi
          ? "आपके ब्राउज़र में GPS स्थान समर्थित नहीं है।"
          : "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lon: longitude };
        try {
          const aqi = await loadAqiData(undefined, coords);
          if (aqi) {
            setGpsCoords(coords); // persist raw coords for subsequent "Analyze" clicks
            setCityInput(aqi.resolvedCity);
            await loadRecommendation(aqi.resolvedCity, profile, lifestyle, language, aqi);
          }
        } catch (err) {
          console.error(err);
          setError(
            isHindi
              ? "GPS स्थान के लिए वायु गुणवत्ता लोड करने में विफल।"
              : "Unable to retrieve air quality data for your GPS location."
          );
        } finally {
          setLocating(false);
        }
      },
      (geoErr) => {
        setLocating(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError(
            isHindi
              ? "स्थान की अनुमति अस्वीकृत कर दी गई। कृपया शहर का नाम दर्ज करके खोजें।"
              : "Location access was denied. Please allow location permissions in your browser or search by city name."
          );
        } else {
          setError(
            isHindi
              ? "GPS स्थान प्राप्त करने में असमर्थ। कृपया शहर का नाम दर्ज करें।"
              : "Unable to retrieve your current GPS coordinates. Please search by city name."
          );
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle Language
  const toggleLanguage = async (newLang: Language) => {
    setLanguage(newLang);
    if (liveAqi) {
      await loadRecommendation(activeCity, profile, lifestyle, newLang, liveAqi);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-[#0F172A] relative overflow-hidden">
      {/* Luminous translucent air-sphere glow centered behind the hero */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[680px] h-[680px] bg-gradient-to-tr from-teal-200/40 via-sky-200/35 to-indigo-200/25 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* 1. TOP NAVIGATION BAR (Transparent container with translucent glass controls) */}
      <header className="sticky top-0 z-40 bg-transparent border-none shadow-none px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <Logo showSubtitle={true} />

          {/* Right Controls: Live IST Clock + Data Source Pill + Language Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Live IST Time Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-slate-700 text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
              <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="font-mono text-[11px] text-teal-950 font-bold tracking-tight">
                {liveIstTime || "Live IST"}
              </span>
            </div>

            {/* Live Data Source Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-slate-700 text-xs font-medium shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">CPCB NAQI</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[11px]">Open-Meteo</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {liveAqi
                  ? new Date(liveAqi.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " IST"
                  : "Live"}
              </span>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-white/70 backdrop-blur-md border border-white/60 text-xs font-bold shadow-xs">
              <button
                onClick={() => toggleLanguage("en")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === "en"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-label="Switch to English"
              >
                English
              </button>
              <button
                onClick={() => toggleLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === "hi"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-label="Switch to Hindi"
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6 pb-28 focus:outline-none">
        {/* Semantic Level 1 Heading for Screen Readers */}
        <h1 className="sr-only">VayuMitra — Indian Urban Air Quality & Low-Emission Companion</h1>

        {/* 2. EVALUATOR QUICK-START BAR & SEARCH CONTROLS */}
        <section
          aria-label="Evaluator Presets and Context Controls"
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 md:p-6 border border-white/90 shadow-sm"
        >
          {/* Quick-Start Scenario Buttons for Judges */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#0D9488]" />
                {isHindi ? "त्वरित मूल्यांकन परिदृश्य (1-क्लिक परीक्षण)" : "Evaluator Quick-Start Presets (1-Click Test Scenarios)"}
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">PromptWars Challenge 06 Ready</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5" role="group" aria-label="Quick-start evaluator presets">
              {PRESET_SCENARIOS.map((preset) => {
                const isSelected = activeCity === preset.city && profile === preset.profile;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    aria-pressed={isSelected}
                    aria-label={`Select preset: ${preset.label}`}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-left transition-all border flex items-center justify-between focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                      isSelected
                        ? "bg-teal-50 border-teal-500 text-teal-950 shadow-xs ring-1 ring-teal-500"
                        : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300"
                    }`}
                  >
                    <span className="truncate">{preset.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#0D9488] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Search & Context Adjustments */}
          <form onSubmit={handleSubmitSearch} className="space-y-4 pt-3 border-t border-slate-100" aria-label="City search and context adjustments">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* City Input with prominent GPS button */}
              <div className="md:col-span-4">
                <label htmlFor="city-search-input" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {isHindi ? "भारतीय शहर" : "Indian City"}
                </label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <MapPin className={`w-4 h-4 absolute left-3.5 top-3 ${gpsCoords ? "text-teal-500" : "text-slate-400"}`} />
                    <input
                      id="city-search-input"
                      type="text"
                      value={cityInput}
                      onChange={(e) => { setCityInput(e.target.value); setGpsCoords(null); }}
                      placeholder="Enter city (e.g., Delhi, Pune, Patna)"
                      aria-label="Enter Indian city name"
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-medium focus-visible:ring-2 focus-visible:ring-teal-600 ${gpsCoords ? "border-teal-400 ring-1 ring-teal-200" : "border-slate-200"}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locating || loadingAqi}
                    aria-label="Detect my current city using GPS"
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                      gpsCoords
                        ? "border-teal-500 bg-teal-100 text-teal-900 ring-1 ring-teal-400"
                        : "border-teal-600/30 bg-teal-50 hover:bg-teal-100 text-teal-800"
                    }`}
                  >
                    {locating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                        <span className="hidden sm:inline">{isHindi ? "खोज..." : "Locating..."}</span>
                      </>
                    ) : gpsCoords ? (
                      <>
                        <Navigation className="w-4 h-4 text-teal-600" />
                        <span className="hidden sm:inline">{isHindi ? "GPS सक्रिय" : "GPS Active"}</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 text-teal-600" />
                        <span className="hidden sm:inline">{isHindi ? "मेरा स्थान" : "Use My Location"}</span>
                      </>
                    )}
                  </button>
                </div>
                {gpsCoords && (
                  <p className="mt-1 text-[10px] text-teal-700 font-medium flex items-center gap-1" role="status">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    {isHindi ? "लाइव GPS निर्देशांक सक्रिय — फिर से विश्लेषण करें" : "Live GPS coordinates active — re-analyze to refresh"}
                  </p>
                )}
              </div>

              {/* Household Profile Selector */}
              <div className="md:col-span-4">
                <label htmlFor="household-persona-select" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {isHindi ? "परिवार / व्यक्तिगत प्रोफ़ाइल" : "Household Persona"}
                </label>
                <select
                  id="household-persona-select"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value as HouseholdProfile)}
                  aria-label="Select household persona"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-medium text-slate-800 focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <option value="family_with_kids">Family with Young Kids</option>
                  <option value="senior_asthma">Senior Citizens / Asthma-Sensitive</option>
                  <option value="daily_commuter">Daily Office Commuter</option>
                  <option value="student_athlete">Student / Outdoor Athlete</option>
                </select>
              </div>

              {/* Action Button */}
              <div className="md:col-span-4 flex items-end">
                <button
                  type="submit"
                  disabled={loadingAqi || loadingAi}
                  aria-label={isHindi ? "वायु गुणवत्ता विश्लेषण और योजना" : "Analyze live air quality and generate plan"}
                  className="w-full mt-4 md:mt-0 py-2.5 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  {loadingAqi || loadingAi ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isHindi ? "अपडेट और AI विश्लेषण" : "Analyze Live AQI & Plan"}</span>
                </button>
              </div>
            </div>

            {/* Lifestyle Toggles Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1" role="group" aria-label="Lifestyle context toggles">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {isHindi ? "जीवनशैली टॉगल:" : "Household Context:"}
              </span>

              {/* Air Purifier Toggle */}
              <button
                type="button"
                onClick={() => setLifestyle((p) => ({ ...p, hasAirPurifier: !p.hasAirPurifier }))}
                aria-pressed={lifestyle.hasAirPurifier}
                aria-label={lifestyle.hasAirPurifier ? "Air purifier enabled" : "Air purifier disabled"}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                  lifestyle.hasAirPurifier
                    ? "bg-teal-50 border-teal-300 text-teal-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${lifestyle.hasAirPurifier ? "bg-teal-600" : "bg-slate-300"}`} />
                {isHindi ? "एयर प्यूरीफायर उपलब्ध" : "Has Air Purifier"}
              </button>

              {/* Commute Toggle */}
              <button
                type="button"
                onClick={() => setLifestyle((p) => ({ ...p, commuteOver10km: !p.commuteOver10km }))}
                aria-pressed={lifestyle.commuteOver10km}
                aria-label={lifestyle.commuteOver10km ? "Commute over 10 km enabled" : "Commute over 10 km disabled"}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                  lifestyle.commuteOver10km
                    ? "bg-teal-50 border-teal-300 text-teal-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${lifestyle.commuteOver10km ? "bg-teal-600" : "bg-slate-300"}`} />
                {isHindi ? "दैनिक यात्रा > 10 किमी" : "Commute > 10 km"}
              </button>

              {/* Kitchen Exhaust Toggle */}
              <button
                type="button"
                onClick={() => setLifestyle((p) => ({ ...p, gasStoveOrKitchenExhaust: !p.gasStoveOrKitchenExhaust }))}
                aria-pressed={lifestyle.gasStoveOrKitchenExhaust}
                aria-label={lifestyle.gasStoveOrKitchenExhaust ? "Kitchen exhaust enabled" : "Kitchen exhaust disabled"}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                  lifestyle.gasStoveOrKitchenExhaust
                    ? "bg-teal-50 border-teal-300 text-teal-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${lifestyle.gasStoveOrKitchenExhaust ? "bg-teal-600" : "bg-slate-300"}`} />
                {isHindi ? "गैस चूल्हा / रसोई एग्जॉस्ट" : "Gas Stove / Chimney"}
              </button>
            </div>
          </form>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* 3. LIVE AIR QUALITY TELEMETRY & 24H FORECAST HERO */}
        {liveAqi && (
          <section
            aria-live="polite"
            aria-label="Live Air Quality Telemetry & 24-Hour Forecast"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Live CPCB NAQI Scoreboard */}
            <div className="lg:col-span-5 bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-7 border border-white/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {isHindi ? "सत्यापित लाइव टेलीमेट्री" : "Real-Time Telemetry"}
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {liveAqi.resolvedCity}, {liveAqi.state || "India"}
                  </span>
                </div>

                {/* Score & Badge Display */}
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-6xl md:text-7xl font-extrabold font-mono tracking-tight text-slate-900">
                    {liveAqi.naqi}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <AqiBadge category={liveAqi.category} size="lg" />
                    <div className="text-xs font-semibold text-slate-500">
                      Indian CPCB NAQI (0–500)
                    </div>
                  </div>
                </div>

                {/* Dominant Pollutant Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium mb-4">
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    Dominant Pollutant: <strong className="font-bold">{liveAqi.dominantPollutant}</strong> (Sub-index:{" "}
                    {liveAqi.dominantPollutant === "PM2.5" ? liveAqi.subIndices.pm2_5 : liveAqi.subIndices.pm10})
                  </span>
                </div>

                {/* Health Advisory */}
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-5">
                  {liveAqi.healthAdvisory}
                </p>
              </div>

              {/* Sub-Pollutants Grid */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100">
                <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">PM2.5</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{liveAqi.current.pm2_5}</span>
                  <span className="block text-[9px] text-slate-400">µg/m³</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">PM10</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{liveAqi.current.pm10}</span>
                  <span className="block text-[9px] text-slate-400">µg/m³</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">NO₂</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{liveAqi.current.no2}</span>
                  <span className="block text-[9px] text-slate-400">µg/m³</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">CO</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{liveAqi.current.co}</span>
                  <span className="block text-[9px] text-slate-400">µg/m³</span>
                </div>
              </div>

              {/* Relatable Cigarette Equivalent Estimate */}
              <div className="mt-3.5 py-2 px-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-center justify-between text-xs">
                <span className="font-medium flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    ~<strong>{(liveAqi.current.pm2_5 / 22).toFixed(1)}</strong> passive cigarettes/day equivalent (est. 22 µg/m³ = 1)
                  </span>
                </span>
                <span className="text-[10px] text-amber-800 font-mono hidden sm:inline">
                  Berkeley Earth Model
                </span>
              </div>
            </div>

            {/* Right Column: 24h Hourly Trend & Clean-Air Window Hero */}
            <div className="lg:col-span-7">
              <HourlyForecastChart
                hourly={liveAqi.hourly}
                cleanWindow={liveAqi.cleanAirWindow}
              />
            </div>
          </section>
        )}

        {/* 4. 3-PILLAR GENAI ACTION PLAN */}
        {recommendation ? (
          <ActionPlanSection
            recommendation={recommendation}
            language={language}
            city={activeCity}
            liveAqi={liveAqi}
          />
        ) : (
          <div className="p-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/90 text-center flex flex-col items-center justify-center shadow-sm">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              {isHindi ? "वायुमित्र व्यक्तिगत कार्य योजना तैयार कर रहा है..." : "Formulating personalized low-emission action plan..."}
            </p>
          </div>
        )}

        {/* 5. ASK VAYUMITRA CONTEXTUAL Q&A */}
        {liveAqi && (
          <AskVayuMitra
            city={activeCity}
            liveAqi={liveAqi}
            profile={profile}
            language={language}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-white/40 backdrop-blur-md border-t border-white/60 py-8 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 font-sans">VayuMitra</span>
            <span>·</span>
            <span>Built for PromptWars Virtual Challenge 06 & Hack2skill</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>CPCB NAQI Standards</span>
            <span>·</span>
            <span>Open-Meteo Air Quality Engine</span>
            <span>·</span>
            <span>Gemini 2.5 Flash Grounding</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
