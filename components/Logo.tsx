import React from "react";

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({ className = "", showSubtitle = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <div className="flex items-center gap-2.5">
        <svg
          width="40"
          height="34"
          viewBox="0 0 40 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="windGrad" x1="0" y1="0" x2="36" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
          </defs>
          <path
            d="M3 10.5H23.5C26.2 10.5 28 8.8 28 6.5C28 4.4 26.3 3 24.3 3C22.7 3 21.5 3.9 21 5.2"
            stroke="url(#windGrad)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M2 17H29.5C32.3 17 34.2 15.2 34.2 12.8C34.2 10.6 32.5 9 30.4 9"
            stroke="url(#windGrad)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M6 23.5H20.5C22.9 23.5 24.5 25.1 24.5 27.2C24.5 29.2 22.9 30.6 21 30.6C19.4 30.6 18.2 29.7 17.8 28.5"
            stroke="url(#windGrad)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M31.5 24.5C31.5 20.5 34.5 17.5 38.5 17.5C38.5 21.5 35.5 24.5 31.5 24.5Z"
            fill="#10B981"
          />
          <path
            d="M31.5 24.5L35.5 20.5"
            stroke="#ECFDF5"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-2xl font-bold tracking-tight text-slate-900">VayuMitra</span>
      </div>
      {showSubtitle && (
        <>
          <span className="hidden sm:inline-block h-6 w-px bg-slate-300/80" aria-hidden="true" />
          <span className="hidden sm:inline-block text-xs sm:text-sm font-medium text-slate-600 leading-tight">
            Indian Urban<br className="hidden md:inline" /> Air Quality Assistant
          </span>
        </>
      )}
    </div>
  );
}
