"use client";

import React, { useState } from "react";
import { CleanAirWindow, HourlyAqiPoint } from "@/lib/types";
import { Sparkles, Wind } from "lucide-react";

interface HourlyForecastChartProps {
  hourly: HourlyAqiPoint[];
  cleanWindow: CleanAirWindow;
}

export function HourlyForecastChart({
  hourly,
  cleanWindow,
}: HourlyForecastChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<HourlyAqiPoint | null>(null);

  if (!hourly || hourly.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 text-slate-500">
        <Wind className="w-5 h-5 mr-2 animate-spin text-teal-600" />
        Loading 24-hour forecast telemetry...
      </div>
    );
  }

  // Calculate SVG scale
  const maxPm25 = Math.max(...hourly.map((h) => h.pm2_5), 100);
  const chartHeight = 160;
  const chartWidth = 580;
  const barWidth = 16;
  const gap = (chartWidth - hourly.length * barWidth) / (hourly.length - 1);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-7 border border-white/90 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              24-Hour PM2.5 Trajectory
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md">
              µg/m³
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diurnal curve indicating surface thermal inversion and dispersion
          </p>
        </div>

        {/* Clean Window Highlight Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] shadow-sm">
          <Sparkles className="w-4 h-4 text-[#0D9488] shrink-0" />
          <div className="text-xs font-semibold">
            <span className="font-bold text-[#0D9488]">Best Window Today:</span>{" "}
            {cleanWindow.label}
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto pb-2">
        <div className="min-w-[560px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
            className="w-full h-44 overflow-visible"
            role="img"
            aria-label="24-Hour PM2.5 Forecast Bar Chart"
          >
            {/* Guide lines */}
            {[50, 100, 200].map((val) => {
              if (val > maxPm25 * 1.1) return null;
              const y = chartHeight - (val / (maxPm25 * 1.15)) * chartHeight;
              return (
                <g key={val}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={chartWidth - 4}
                    y={y - 3}
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    textAnchor="end"
                  >
                    {val} µg
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {hourly.map((point, index) => {
              const x = index * (barWidth + gap);
              const barH = Math.max(
                4,
                (point.pm2_5 / (maxPm25 * 1.15)) * chartHeight
              );
              const y = chartHeight - barH;
              const isClean = point.isCleanWindow;
              const isHovered = hoveredPoint?.time === point.time;

              return (
                <g
                  key={point.time}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer transition-all duration-150"
                >
                  {/* Clean Window background column highlight */}
                  {isClean && (
                    <rect
                      x={x - gap / 2}
                      y="0"
                      width={barWidth + gap}
                      height={chartHeight}
                      fill="#0D9488"
                      fillOpacity="0.08"
                      rx="4"
                    />
                  )}

                  {/* Main PM2.5 Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="4"
                    fill={
                      isClean
                        ? "#0D9488"
                        : point.pm2_5 > 120
                        ? "#EA580C"
                        : point.pm2_5 > 60
                        ? "#CA8A04"
                        : "#94A3B8"
                    }
                    className={`transition-all duration-200 ${
                      isHovered ? "opacity-100 filter drop-shadow-md" : "opacity-90"
                    }`}
                  />

                  {/* Clean window top indicator dot */}
                  {isClean && (
                    <circle
                      cx={x + barWidth / 2}
                      cy={Math.max(6, y - 6)}
                      r="2.5"
                      fill="#0D9488"
                    />
                  )}

                  {/* Hour labels (every 3 hours or clean window hours) */}
                  {(point.hour % 3 === 0 || isClean) && (
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 16}
                      fill={isClean ? "#0D9488" : "#64748B"}
                      fontSize={isClean ? "10" : "9"}
                      fontWeight={isClean ? "700" : "500"}
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                    >
                      {point.hour === 0
                        ? "12A"
                        : point.hour === 12
                        ? "12P"
                        : point.hour > 12
                        ? `${point.hour - 12}P`
                        : `${point.hour}A`}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Dynamic Hover Tooltip / Status Footer */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {hoveredPoint ? (
          <div className="flex items-center gap-3 text-slate-700">
            <span className="font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {new Date(hoveredPoint.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              PM2.5:{" "}
              <strong className="font-mono text-slate-900">
                {hoveredPoint.pm2_5} µg/m³
              </strong>
            </span>
            <span>
              NAQI:{" "}
              <strong className="font-mono text-slate-900">
                {hoveredPoint.naqi}
              </strong>
            </span>
            {hoveredPoint.isCleanWindow && (
              <span className="text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                ★ Best Window
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0D9488] inline-block" />
              Clean Window
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#CA8A04] inline-block" />
              Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EA580C] inline-block" />
              Elevated Exposure
            </span>
          </div>
        )}

        <div className="text-[11px] text-slate-400 font-mono">
          Avg Clean PM2.5: ~{cleanWindow.avgPm25} µg/m³
        </div>
      </div>
    </div>
  );
}
