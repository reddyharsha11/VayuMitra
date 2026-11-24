import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VayuMitra | Urban Air Quality & Low-Emission Companion",
  description:
    "AI-powered Indian civic environmental companion for real-time CPCB NAQI telemetry, clean-air ventilation windows, and personalized low-emission daily routines.",
  keywords: [
    "VayuMitra",
    "Indian AQI",
    "CPCB NAQI",
    "PM2.5",
    "Air Quality Index India",
    "Clean Air Window",
    "PromptWars",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body className="min-h-screen text-[#0F172A] antialiased">
        {/* Accessible Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white font-bold text-xs"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
