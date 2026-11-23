import React from "react";
import { CpcbCategory } from "@/lib/types";

interface AqiBadgeProps {
  category: CpcbCategory;
  naqi?: number;
  pm25?: number;
  showCigaretteEquiv?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BADGE_CONFIG: Record<
  CpcbCategory,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
    label: string;
  }
> = {
  Good: {
    bg: "bg-[#F0FDF4]",
    text: "text-[#15803D]",
    border: "border-[#BBF7D0]",
    dot: "bg-[#15803D]",
    label: "Good (0–50)",
  },
  Satisfactory: {
    bg: "bg-[#F7FEE7]",
    text: "text-[#4D7C0F]",
    border: "border-[#D9F99D]",
    dot: "bg-[#65A30D]",
    label: "Satisfactory (51–100)",
  },
  Moderate: {
    bg: "bg-[#FEFCE8]",
    text: "text-[#A16207]",
    border: "border-[#FEF08A]",
    dot: "bg-[#CA8A04]",
    label: "Moderate (101–200)",
  },
  Poor: {
    bg: "bg-[#FFF7ED]",
    text: "text-[#C2410C]",
    border: "border-[#FED7AA]",
    dot: "bg-[#EA580C]",
    label: "Poor (201–300)",
  },
  "Very Poor": {
    bg: "bg-[#FEF2F2]",
    text: "text-[#B91C1C]",
    border: "border-[#FECACA]",
    dot: "bg-[#DC2626]",
    label: "Very Poor (301–400)",
  },
  Severe: {
    bg: "bg-[#450A0A]",
    text: "text-[#FEE2E2]",
    border: "border-[#991B1B]",
    dot: "bg-[#EF4444]",
    label: "Severe (401–500)",
  },
};

export function AqiBadge({
  category,
  naqi,
  pm25,
  showCigaretteEquiv = false,
  size = "md",
  className = "",
}: AqiBadgeProps) {
  const config = BADGE_CONFIG[category] || BADGE_CONFIG.Moderate;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1.5",
    md: "px-3 py-1 text-sm font-semibold gap-2",
    lg: "px-4 py-1.5 text-base font-bold gap-2.5",
  }[size];

  const cigEquiv =
    pm25 !== undefined && pm25 > 0 ? (pm25 / 22).toFixed(1) : null;

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div
        className={`inline-flex items-center rounded-full border shadow-sm transition-all ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
        role="status"
        aria-label={`Air Quality Status: ${category}${naqi !== undefined ? `, NAQI ${naqi}` : ""}`}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}
          />
        </span>
        <span>{category}</span>
        {naqi !== undefined && (
          <span className="opacity-80 font-mono text-[0.9em] border-l border-current/20 pl-2">
            NAQI {naqi}
          </span>
        )}
      </div>

      {showCigaretteEquiv && cigEquiv && (
        <span className="text-[11px] text-slate-500 font-medium">
          ~{cigEquiv} passive cigarettes/day equivalent (est. 22 µg/m³ = 1)
        </span>
      )}
    </div>
  );
}
