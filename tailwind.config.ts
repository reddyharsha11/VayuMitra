import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFC",
        surface: "#FFFFFF",
        slate: {
          950: "#020617",
          900: "#0F172A",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          200: "#E2E8F0",
          100: "#F1F5F9",
        },
        brand: {
          DEFAULT: "#0D9488",
          dark: "#0F766E",
          light: "#CCFBF1",
          subtle: "#F0FDFA",
        },
        naqi: {
          good: "#15803D",
          satisfactory: "#65A30D",
          moderate: "#CA8A04",
          poor: "#EA580C",
          veryPoor: "#DC2626",
          severe: "#7F1D1D",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
