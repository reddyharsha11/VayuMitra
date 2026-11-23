import { CpcbCategory, CleanAirWindow, HourlyAqiPoint } from "./types";

/**
 * Official CPCB (Central Pollution Control Board) NAQI Breakpoints
 * Formula:
 * Ip = [ (I_Hi - I_Lo) / (B_Hi - B_Lo) ] * (Cp - B_Lo) + I_Lo
 */
interface Breakpoint {
  bLo: number;
  bHi: number;
  iLo: number;
  iHi: number;
  category: CpcbCategory;
}

export const PM25_BREAKPOINTS: Breakpoint[] = [
  { bLo: 0, bHi: 30, iLo: 0, iHi: 50, category: "Good" },
  { bLo: 31, bHi: 60, iLo: 51, iHi: 100, category: "Satisfactory" },
  { bLo: 61, bHi: 90, iLo: 101, iHi: 200, category: "Moderate" },
  { bLo: 91, bHi: 120, iLo: 201, iHi: 300, category: "Poor" },
  { bLo: 121, bHi: 250, iLo: 301, iHi: 400, category: "Very Poor" },
  { bLo: 251, bHi: 350, iLo: 401, iHi: 500, category: "Severe" },
];

export const PM10_BREAKPOINTS: Breakpoint[] = [
  { bLo: 0, bHi: 50, iLo: 0, iHi: 50, category: "Good" },
  { bLo: 51, bHi: 100, iLo: 51, iHi: 100, category: "Satisfactory" },
  { bLo: 101, bHi: 250, iLo: 101, iHi: 200, category: "Moderate" },
  { bLo: 251, bHi: 350, iLo: 201, iHi: 300, category: "Poor" },
  { bLo: 351, bHi: 430, iLo: 301, iHi: 400, category: "Very Poor" },
  { bLo: 431, bHi: 500, iLo: 401, iHi: 500, category: "Severe" },
];

export const NAQI_COLORS: Record<CpcbCategory, string> = {
  Good: "#15803D",
  Satisfactory: "#65A30D",
  Moderate: "#CA8A04",
  Poor: "#EA580C",
  "Very Poor": "#DC2626",
  Severe: "#7F1D1D",
};

export const NAQI_ADVISORIES: Record<CpcbCategory, string> = {
  Good: "Air quality is good. Minimal impact. Ideal for all outdoor activities and natural home aeration.",
  Satisfactory: "Minor breathing discomfort to sensitive individuals. Generally safe for public activities.",
  Moderate: "Breathing discomfort to people with lungs, asthma, and heart conditions. Limit prolonged heavy outdoor exertion.",
  Poor: "Breathing discomfort to most people on prolonged exposure. Wear N95 masks during peak traffic hours.",
  "Very Poor": "Significant respiratory illness risk. Avoid outdoor jogging/exercise. Keep windows shut and run filtration.",
  Severe: "Emergency health advisory. Serious health impact on healthy people. Strictly avoid outdoor exposure.",
};

/**
 * Calculates sub-index for a single pollutant using linear interpolation across CPCB breakpoints.
 */
export function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration < 0 || isNaN(concentration)) return 0;

  // Handle value below lowest breakpoint
  if (concentration <= breakpoints[0].bHi) {
    const bp = breakpoints[0];
    const subIndex = ((bp.iHi - bp.iLo) / (bp.bHi - bp.bLo)) * (concentration - bp.bLo) + bp.iLo;
    return Math.round(Math.max(0, subIndex));
  }

  // Linear interpolation within breakpoints
  for (const bp of breakpoints) {
    if (concentration >= bp.bLo && concentration <= bp.bHi) {
      const subIndex = ((bp.iHi - bp.iLo) / (bp.bHi - bp.bLo)) * (concentration - bp.bLo) + bp.iLo;
      return Math.round(subIndex);
    }
  }

  // If concentration exceeds highest defined breakpoint, cap or linearly extrapolate to 500 max
  const lastBp = breakpoints[breakpoints.length - 1];
  if (concentration > lastBp.bHi) {
    // Severe range (capped at 500 NAQI scale)
    return 500;
  }

  return 0;
}

/**
 * Calculates PM2.5 sub-index using CPCB formula
 */
export function calculatePM25SubIndex(pm25: number): number {
  return calculateSubIndex(pm25, PM25_BREAKPOINTS);
}

/**
 * Calculates PM10 sub-index using CPCB formula
 */
export function calculatePM10SubIndex(pm10: number): number {
  return calculateSubIndex(pm10, PM10_BREAKPOINTS);
}

/**
 * Calculates passive cigarette equivalent per day from 24-hour PM2.5 concentration.
 * Epidemiological standard (Berkeley Earth / Muller et al.): 22 µg/m³ PM2.5 ≈ 1 cigarette/day.
 */
export function calculateCigaretteEquivalent(pm25: number): number {
  if (pm25 <= 0 || isNaN(pm25)) return 0;
  return Math.round((pm25 / 22) * 10) / 10;
}

export type CommuteMode = "car" | "public_transit_n95" | "wfh";

export interface CommuteImpactResult {
  co2eSavedKgWeek: number;
  exposureAvoidedUgDay: number;
  formulaNote: string;
}

/**
 * Estimates CO2e emissions avoided (kg/week) and inhaled PM2.5 exposure avoided (µg/day)
 * for sustainable commute alternatives compared to a solo petrol car baseline.
 *
 * Factors:
 * - Work week: 5 days, 2-way commute (weekly km = distanceKm * 2 * 5)
 * - Solo Petrol Car CO2e: ~0.15 kg/km
 * - Metro / Bus CO2e: ~0.04 kg/km (net reduction 0.11 kg/km)
 * - WFH / Combine Trips CO2e: 0.0 kg/km (net reduction 0.15 kg/km)
 * - PM2.5 on-road peak multiplier: 1.2x ambient
 * - Inhaled volume during commute: ~0.8 m³
 * - N95 particulate filtration efficiency: 95%
 */
export function calculateCommuteImpact(
  distanceKm: number,
  mode: CommuteMode,
  ambientPm25: number
): CommuteImpactResult {
  const safeDistance = Math.max(1, Math.min(distanceKm, 100));
  const safePm25 = Math.max(0, ambientPm25 || 50);

  // Weekly commute distance (5 round-trips)
  const weeklyKm = safeDistance * 2 * 5;

  let co2eSavedKgWeek = 0;
  if (mode === "public_transit_n95") {
    // 0.15 (car) - 0.04 (metro/bus) = 0.11 kg/km saved
    co2eSavedKgWeek = Math.round(weeklyKm * 0.11 * 10) / 10;
  } else if (mode === "wfh") {
    // 100% of car emissions saved = 0.15 kg/km
    co2eSavedKgWeek = Math.round(weeklyKm * 0.15 * 10) / 10;
  }

  // Baseline on-road commute inhalation (µg/day)
  // Standard human ventilation ~0.8 m³/hr in transit; trip factor scales with distance
  const tripHours = Math.min(safeDistance / 20, 2.0); // approx 20 km/h average Indian urban commute
  const baselineInhaledUg = safePm25 * 1.2 * 0.8 * Math.max(0.5, tripHours);

  let exposureAvoidedUgDay = 0;
  if (mode === "public_transit_n95") {
    // N95 mask filters 95% of PM2.5
    exposureAvoidedUgDay = Math.round(baselineInhaledUg * 0.95 * 10) / 10;
  } else if (mode === "wfh") {
    // Zero commute exposure avoided compared to on-road travel
    exposureAvoidedUgDay = Math.round(baselineInhaledUg * 1.0 * 10) / 10;
  }

  const formulaNote =
    "Calculated using 0.15 kg CO₂e/km (petrol car) vs 0.04 kg CO₂e/km (metro) over 5 round-trips/wk, and 95% N95 particulate efficiency during on-road transit.";

  return { co2eSavedKgWeek, exposureAvoidedUgDay, formulaNote };
}

/**
 * Maps an NAQI value (0–500) to its official CPCB Category
 */
export function getCategoryFromNAQI(naqi: number): CpcbCategory {
  if (naqi <= 50) return "Good";
  if (naqi <= 100) return "Satisfactory";
  if (naqi <= 200) return "Moderate";
  if (naqi <= 300) return "Poor";
  if (naqi <= 400) return "Very Poor";
  return "Severe";
}

/**
 * Calculates comprehensive Indian NAQI from PM2.5 and PM10 concentrations
 */
export function calculateNAQI(pm25: number, pm10: number): {
  naqi: number;
  category: CpcbCategory;
  categoryColor: string;
  dominantPollutant: string;
  healthAdvisory: string;
  subIndices: { pm2_5: number; pm10: number };
} {
  const pm25Sub = calculatePM25SubIndex(pm25);
  const pm10Sub = calculatePM10SubIndex(pm10);

  const naqi = Math.max(pm25Sub, pm10Sub);
  const category = getCategoryFromNAQI(naqi);
  const dominantPollutant = pm25Sub >= pm10Sub ? "PM2.5" : "PM10";

  return {
    naqi,
    category,
    categoryColor: NAQI_COLORS[category],
    dominantPollutant,
    healthAdvisory: NAQI_ADVISORIES[category],
    subIndices: {
      pm2_5: pm25Sub,
      pm10: pm10Sub,
    },
  };
}

/**
 * Scans 24-hour hourly PM2.5 forecast to find the best 2-hour clean-air window
 */
export function findBestCleanAirWindow(
  hourlyTimes: string[],
  hourlyPm25: string[] | number[]
): CleanAirWindow {
  if (!hourlyTimes.length || !hourlyPm25.length) {
    return {
      startTime: "14:00",
      endTime: "16:00",
      startHour: 14,
      endHour: 16,
      avgPm25: 35,
      label: "2:00 PM – 4:00 PM IST",
      advice: "Lowest expected pollution level. Recommended for cross-ventilation and necessary errands.",
    };
  }

  // Take the first 24 hours
  const hoursCount = Math.min(24, hourlyPm25.length);
  const parsedPm25 = hourlyPm25.slice(0, hoursCount).map((v) => Number(v) || 0);

  let minAvg = Infinity;
  let bestStartIndex = 0;

  // Window size = 2 consecutive hours
  for (let i = 0; i <= hoursCount - 2; i++) {
    const avg = (parsedPm25[i] + parsedPm25[i + 1]) / 2;
    if (avg < minAvg) {
      minAvg = avg;
      bestStartIndex = i;
    }
  }

  const startDateStr = hourlyTimes[bestStartIndex] || "2026-11-23T14:00";
  const endDateStr = hourlyTimes[bestStartIndex + 2] || hourlyTimes[bestStartIndex + 1] || "2026-11-23T16:00";

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const startHour = startDate.getHours();
  const endHour = (startHour + 2) % 24;

  const format12h = (h: number): string => {
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${period}`;
  };

  const label = `${format12h(startHour)} – ${format12h(endHour)} IST`;
  const startTime = `${String(startHour).padStart(2, "0")}:00`;
  const endTime = `${String(endHour).padStart(2, "0")}:00`;

  return {
    startTime,
    endTime,
    startHour,
    endHour,
    avgPm25: Math.round(minAvg * 10) / 10,
    label,
    advice: `Optimal 2-hour window today with lowest PM2.5 (~${Math.round(minAvg)} µg/m³). Ideal for rapid cross-ventilation, drying laundry, and outdoor tasks.`,
  };
}

/**
 * Formats hourly forecast array with NAQI and flag for clean window
 */
export function buildHourlyForecast(
  times: string[],
  pm25Values: (number | null | undefined)[],
  pm10Values: (number | null | undefined)[],
  cleanWindow: CleanAirWindow
): HourlyAqiPoint[] {
  const points: HourlyAqiPoint[] = [];
  const limit = Math.min(24, times.length, pm25Values.length);

  for (let i = 0; i < limit; i++) {
    const date = new Date(times[i]);
    const hour = date.getHours();
    const pm25 = Number(pm25Values[i]) || 0;
    const pm10 = Number(pm10Values[i]) || Math.round(pm25 * 1.5);
    const { naqi } = calculateNAQI(pm25, pm10);

    const isCleanWindow =
      cleanWindow.startHour <= cleanWindow.endHour
        ? hour >= cleanWindow.startHour && hour < cleanWindow.endHour
        : hour >= cleanWindow.startHour || hour < cleanWindow.endHour;

    points.push({
      time: times[i],
      hour,
      pm2_5: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm10 * 10) / 10,
      naqi,
      isCleanWindow,
    });
  }

  return points;
}
