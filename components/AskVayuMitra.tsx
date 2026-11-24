"use client";

import React, { useState, useRef, useEffect } from "react";
import { LiveAqiData, Language } from "@/lib/types";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  ChevronDown,
  RotateCcw,
  ShieldAlert,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

interface AskVayuMitraProps {
  city: string;
  liveAqi: LiveAqiData;
  profile: string;
  language: Language;
}

interface ChatItem {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isOffTopic?: boolean;
}

export function AskVayuMitra({
  city,
  liveAqi,
  profile,
  language,
}: AskVayuMitraProps) {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHindi = language === "hi";

  // 3 Suggested prompt chips
  const suggestedQueries = isHindi
    ? [
        "क्या बच्चों का बाहर खेलना सुरक्षित है?",
        "खिड़कियां खोलने का सबसे अच्छा समय?",
        "यात्रा के लिए N95 मास्क पहनें?",
      ]
    : [
        "Is it safe for kids to play outside?",
        "Best time to open windows today?",
        "Should I wear an N95 mask for my commute?",
      ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Keyboard accessibility: Escape closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatItem = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsOpen(true);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          city,
          naqi: liveAqi.naqi,
          category: liveAqi.category,
          cleanAirWindow: liveAqi.cleanAirWindow.label,
          profile,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const replyText = data.reply || "";

      // Detect off-topic guardrail trigger
      const isRefusal =
        replyText.toLowerCase().includes("specialize exclusively") ||
        replyText.toLowerCase().includes("only assist with air pollution") ||
        replyText.toLowerCase().includes("climate & aqi scope") ||
        replyText.toLowerCase().includes("environmental companion");

      const assistantMsg: ChatItem = {
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOffTopic: isRefusal,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatItem = {
        role: "assistant",
        content: isHindi
          ? "क्षमा करें, वायु गुणवत्ता उत्तर प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।"
          : "Sorry, I could not synthesize atmospheric telemetry at this moment. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setIsOpen(false);
  };

  return (
    <aside
      aria-label="VayuMitra Floating Assistant"
      className="fixed bottom-5 z-40 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-none select-none"
    >
      <div className="pointer-events-auto">
        {/* 1. EXPANDABLE FROSTED-GLASS CHAT DRAWER */}
        {isOpen && (
          <div className="mb-2 bg-white/90 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ring-1 ring-slate-900/5 animate-scale-in">
            {/* Compact Header */}
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <Bot className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  VayuMitra · Grounded in {city} (NAQI {liveAqi.naqi})
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                  AI Companion
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear history"
                    aria-label="Clear chat history"
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-[11px] font-semibold flex items-center gap-1 px-2 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isHindi ? "मिटाएं" : "Clear"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize drawer"
                  aria-label="Minimize chat drawer"
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors text-[11px] font-semibold flex items-center gap-1 px-2 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>{isHindi ? "छोटा करें" : "Minimize"}</span>
                </button>
              </div>
            </div>

            {/* Message History Container */}
            <div className="max-h-72 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/40 to-white/60">
              {messages.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-teal-600" />
                  <p className="font-medium text-slate-600">
                    {isHindi
                      ? `${city} की हवा और अपनी दिनचर्या के बारे में कोई भी प्रश्न पूछें`
                      : `Ask any question about today's live air quality or low-emission routines in ${city}`}
                  </p>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs md:text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-slate-900 text-white rounded-tr-none shadow-xs font-medium"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200/90 shadow-xs"
                      }`}
                    >
                      {/* Polished Off-Topic Guardrail Badge */}
                      {m.role === "assistant" && m.isOffTopic && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 mb-1.5">
                          <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Climate & AQI Scope Only</span>
                        </div>
                      )}

                      <p className="whitespace-pre-line select-text">{m.content}</p>
                      <span
                        className={`block text-[9px] mt-1 font-mono text-right ${
                          m.role === "user" ? "text-slate-400" : "text-slate-400"
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    </div>
                    {m.role === "user" && (
                      <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Live Typing & Synthesizing State */}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-teal-800 py-1.5 px-3 rounded-xl bg-teal-50/80 border border-teal-200 w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span className="font-semibold animate-pulse">
                    {isHindi ? "लाइव NAQI विश्लेषण जारी..." : "Analyzing live NAQI..."}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* 2. SUGGESTED PROMPT CHIPS (Visible above pill) */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Suggested questions">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white/70 backdrop-blur-md px-2 py-1 rounded-full border border-white/60 shadow-2xs flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span className="hidden sm:inline">{isHindi ? "सुझाव:" : "Suggested:"}</span>
          </span>
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={loading}
              aria-label={`Ask suggested question: ${q}`}
              className="text-[11px] px-3 py-1 rounded-full bg-white/85 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200/80 hover:border-teal-400 transition-all font-semibold shadow-2xs truncate backdrop-blur-md shrink-0 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              {q}
            </button>
          ))}
        </div>

        {/* 3. FLOATING INPUT PILL */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="bg-white/95 backdrop-blur-xl border border-teal-600/30 shadow-2xl rounded-2xl p-1.5 pl-3.5 flex items-center gap-2 ring-1 ring-black/5"
          aria-label="Ask VayuMitra Form"
        >
          <div className="flex items-center gap-2 flex-1">
            <Bot className="w-4 h-4 text-teal-600 shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => {
                if (messages.length > 0) setIsOpen(true);
              }}
              aria-expanded={isOpen}
              aria-label="Ask VayuMitra a question"
              placeholder={
                isHindi
                  ? `${city} की हवा, मास्क या वेंटिलेशन के बारे में पूछें...`
                  : `Ask VayuMitra about air quality, outdoor walks, or N95 masks in ${city}...`
              }
              disabled={loading}
              className="w-full text-xs md:text-sm bg-transparent placeholder-slate-400 text-slate-800 focus:outline-none font-medium focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send query to VayuMitra"
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isHindi ? "पूछें" : "Ask"}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
