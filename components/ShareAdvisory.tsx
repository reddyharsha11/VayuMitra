"use client";

import React, { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { calculateCigaretteEquivalent } from "@/lib/aqi-math";
import { Language } from "@/lib/types";

interface ShareAdvisoryProps {
  city: string;
  naqi: number;
  category: string;
  cleanAirWindow: string;
  pm2_5: number;
  topActions: string[];
  language?: Language;
  className?: string;
}

export function ShareAdvisory({
  city,
  naqi,
  category,
  cleanAirWindow,
  pm2_5,
  topActions,
  language = "en",
  className = "",
}: ShareAdvisoryProps) {
  const [copied, setCopied] = useState(false);
  const isHindi = language === "hi";

  const handleCopy = async () => {
    const cigEquiv = calculateCigaretteEquivalent(pm2_5);
    const actionsFormatted =
      topActions.length > 0
        ? topActions.slice(0, 2).map((a, i) => `${i + 1}. ${a}`).join("\n")
        : "1. Prioritize outdoor errands during clean-air window\n2. Keep children & seniors indoors during peak traffic hours";

    const text = isHindi
      ? `🌬️ वायुमित्र वायु गुणवत्ता परामर्श — ${city}
📊 लाइव CPCB NAQI: ${naqi} (${category})
💨 PM2.5 स्तर: ${pm2_5} µg/m³ (लगभग ${cigEquiv} सिगरेट/दिन के बराबर)
⏰ आज का सबसे स्वच्छ वायु अंतराल: ${cleanAirWindow}

🛡️ परिवार व बच्चों के लिए मुख्य सावधानियाँ:
${actionsFormatted}

साझा किया गया: वायुमित्र (VayuMitra) — Google & Hack2skill PromptWars Challenge 06`
      : `🌬️ VayuMitra Family & Community Air Advisory — ${city}
📊 Live CPCB NAQI: ${naqi} (${category})
💨 PM2.5: ${pm2_5} µg/m³ (~${cigEquiv} passive cigarettes/day equiv.)
⏰ Best Clean-Air Window Today: ${cleanAirWindow}

🛡️ Top Actionable Steps for Family & Vulnerable Groups:
${actionsFormatted}

Shared via VayuMitra — Google & Hack2skill PromptWars Challenge 06`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy advisory:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy family and community air quality advisory to clipboard"
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer select-none ${
        copied
          ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
          : "bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-600/30 hover:border-teal-600/50"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-white animate-scale-in" />
          <span>{isHindi ? "परामर्श कॉपी हुआ!" : "Advisory Copied!"}</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-teal-700" />
          <span>{isHindi ? "परिवार / समुदाय परामर्श कॉपी करें" : "Copy Family / Community Advisory"}</span>
        </>
      )}
    </button>
  );
}
