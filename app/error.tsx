"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("VayuMitra Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl p-7 border border-slate-200/90 shadow-md text-center">
        <div className="flex justify-center mb-4">
          <Logo showSubtitle={false} />
        </div>

        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-1.5">
          Temporary Telemetry Interruption
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          VayuMitra encountered an unexpected issue while communicating with upstream air quality sensors or generating AI recommendations.
        </p>

        {error.message && (
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Diagnostic Context
            </span>
            <p className="text-xs font-mono text-slate-700 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.location.href = "/";
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
