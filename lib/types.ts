export type HouseholdProfile =
  | "family_with_kids"
  | "senior_asthma"
  | "daily_commuter"
  | "student_athlete";

export interface LifestyleToggles {
  hasAirPurifier: boolean;
  commuteOver10km: boolean;
  gasStoveOrKitchenExhaust: boolean;
}

export type Language = "en" | "hi";

export type CpcbCategory =
  | "Good"
  | "Satisfactory"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe";

export interface PollutantSubIndex {
  pollutant: "PM2.5" | "PM10";
  concentration: number;
  subIndex: number;
  unit: string;
}

export interface CleanAirWindow {
  startTime: string; // e.g. "14:00"
  endTime: string; // e.g. "16:00"
  startHour: number;
  endHour: number;
  avgPm25: number;
  label: string; // e.g. "2:00 PM – 4:00 PM IST"
  advice: string;
}

export interface HourlyAqiPoint {
  time: string;
  hour: number;
  pm2_5: number;
  pm10: number;
  naqi: number;
  isCleanWindow: boolean;
}

export interface LiveAqiData {
  city: string;
  resolvedCity: string;
  state?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  timestamp: string;
  source: string;
  naqi: number;
  category: CpcbCategory;
  categoryColor: string;
  dominantPollutant: string;
  healthAdvisory: string;
  current: {
    pm2_5: number;
    pm10: number;
    no2: number;
    co: number;
    usAqi: number;
  };
  subIndices: {
    pm2_5: number;
    pm10: number;
  };
  hourly: HourlyAqiPoint[];
  cleanAirWindow: CleanAirWindow;
}

export interface GenAIRoutineSlot {
  time: string;
  title: string;
  action: string;
  emissionTip: string;
  exposureRisk: "Low" | "Moderate" | "High";
}

export interface IndoorHack {
  id: string;
  title: string;
  action: string;
  impact: string;
  category: "ventilation" | "cleaning" | "purification" | "plants";
}

export interface SustainableAlternative {
  currentHabit: string;
  sustainableAlternative: string;
  whyItMatters: string;
  directImpactMetric: string;
}

export interface GenAIRecommendation {
  severitySummary: string;
  dailyRoutine: {
    morning: GenAIRoutineSlot;
    afternoon: GenAIRoutineSlot;
    evening: GenAIRoutineSlot;
  };
  indoorHacks: IndoorHack[];
  sustainableAlternatives: SustainableAlternative[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}
