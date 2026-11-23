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
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
