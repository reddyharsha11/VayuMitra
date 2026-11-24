import { describe, it, expect } from "vitest";
import {
  RecommendRequestSchema,
  RecommendResponseSchema,
  ChatRequestSchema,
} from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("RecommendRequestSchema", () => {
    it("validates a compliant recommendation request", () => {
      const validPayload = {
        city: "Delhi",
        profile: "family_with_kids",
        lifestyle: {
          hasAirPurifier: true,
          commuteOver10km: true,
          gasStoveOrKitchenExhaust: true,
        },
        language: "en",
        liveAqi: {
          naqi: 245,
          category: "Poor",
          dominantPollutant: "PM2.5",
          cleanAirWindow: "2:00 PM – 4:00 PM IST",
          pm2_5: 98.4,
          pm10: 165.2,
        },
      };

      const result = RecommendRequestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.city).toBe("Delhi");
        expect(result.data.profile).toBe("family_with_kids");
      }
    });

    it("rejects request with empty city name", () => {
      const invalidPayload = {
        city: "",
        profile: "senior_asthma",
        lifestyle: {
          hasAirPurifier: false,
          commuteOver10km: false,
          gasStoveOrKitchenExhaust: false,
        },
      };

      const result = RecommendRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects request with invalid profile enum", () => {
      const invalidPayload = {
        city: "Mumbai",
        profile: "random_unknown_profile",
        lifestyle: {
          hasAirPurifier: false,
          commuteOver10km: false,
          gasStoveOrKitchenExhaust: false,
        },
      };

      const result = RecommendRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("RecommendResponseSchema", () => {
    it("validates complete GenAI structured JSON response", () => {
      const validResponse = {
        severitySummary:
          "Today's air in Delhi indicates elevated PM2.5, presenting high respiratory exposure during morning peak traffic. Household precautions are advised.",
        dailyRoutine: {
          morning: {
            time: "6:00 AM – 10:00 AM",
            title: "Morning Smog Shielding",
            action: "Avoid outdoor cardio exercises; keep windows sealed.",
            emissionTip: "Carpool or use electric mass transit.",
            exposureRisk: "High",
          },
          afternoon: {
            time: "1:00 PM – 4:00 PM",
            title: "Clean Window Aeration",
            action: "Cross-ventilate home for 20 minutes during dispersion peak.",
            emissionTip: "Turn off high-power cooling appliances.",
            exposureRisk: "Low",
          },
          evening: {
            time: "6:00 PM – 10:00 PM",
            title: "Evening Sealing & Bedroom Sanctuary",
            action: "Run HEPA air purifier on medium speed 45 mins before sleep.",
            emissionTip: "Avoid burning mosquito coils.",
            exposureRisk: "Moderate",
          },
        },
        indoorHacks: [
          {
            id: "hack_1",
            title: "Cross-Ventilation",
            action: "Aerate home strictly during afternoon clean window.",
            impact: "-35% indoor CO2",
            category: "ventilation",
          },
          {
            id: "hack_2",
            title: "Wet Mopping",
            action: "Use damp microfiber mop instead of dry broom.",
            impact: "-45% resuspended dust",
            category: "cleaning",
          },
          {
            id: "hack_3",
            title: "HEPA Optimization",
            action: "Place purifier 2 ft away from walls with doors closed.",
            impact: "PM2.5 < 25 µg/m³",
            category: "purification",
          },
          {
            id: "hack_4",
            title: "Kitchen Chimney",
            action: "Run kitchen exhaust during tadka and LPG cooking.",
            impact: "-70% indoor NO2",
            category: "plants",
          },
        ],
        sustainableAlternatives: [
          {
            currentHabit: "Single-occupancy petrol vehicle commuting",
            sustainableAlternative: "Metro transit or electric public bus",
            whyItMatters: "Cuts personal exposure to direct vehicular tailpipes.",
            directImpactMetric: "Saves ~2.4 kg CO2e per 15 km round-trip",
          },
          {
            currentHabit: "Opening windows at 6 AM winter morning",
            sustainableAlternative: "Aerate during 2 PM clean air window",
            whyItMatters: "Prevents trapping cold thermal inversion smog indoors.",
            directImpactMetric: "Prevents indoor PM2.5 spike of 120+ µg/m³",
          },
          {
            currentHabit: "Burning incense sticks indoors",
            sustainableAlternative: "Natural reed diffuser or LED lights",
            whyItMatters: "Agarbatti smoke emits toxic VOCs and particulate.",
            directImpactMetric: "Reduces indoor soot by 85%",
          },
        ],
      };

      const result = RecommendResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("rejects response when indoorHacks count is not exactly 4", () => {
      const invalidResponse = {
        severitySummary: "Sample summary",
        dailyRoutine: {
          morning: { time: "6 AM", title: "M", action: "A", emissionTip: "E", exposureRisk: "Low" },
          afternoon: { time: "12 PM", title: "A", action: "A", emissionTip: "E", exposureRisk: "Low" },
          evening: { time: "6 PM", title: "E", action: "A", emissionTip: "E", exposureRisk: "Low" },
        },
        indoorHacks: [
          { id: "1", title: "T1", action: "A1", impact: "I1", category: "ventilation" },
        ], // only 1 hack instead of 4
        sustainableAlternatives: [
          { currentHabit: "C1", sustainableAlternative: "S1", whyItMatters: "W1", directImpactMetric: "D1" },
          { currentHabit: "C2", sustainableAlternative: "S2", whyItMatters: "W2", directImpactMetric: "D2" },
          { currentHabit: "C3", sustainableAlternative: "S3", whyItMatters: "W3", directImpactMetric: "D3" },
        ],
      };

      const result = RecommendResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("ChatRequestSchema", () => {
    it("validates contextual chat request", () => {
      const validChat = {
        message: "Can I jog at 6 AM in Delhi today?",
        city: "Delhi",
        naqi: 280,
        category: "Poor",
        cleanAirWindow: "2:00 PM – 4:00 PM IST",
        profile: "family_with_kids",
      };

      const result = ChatRequestSchema.safeParse(validChat);
      expect(result.success).toBe(true);
    });

    it("rejects empty message in chat request", () => {
      const invalidChat = {
        message: "",
        city: "Delhi",
        naqi: 280,
        category: "Poor",
        cleanAirWindow: "2:00 PM – 4:00 PM IST",
        profile: "family_with_kids",
      };

      const result = ChatRequestSchema.safeParse(invalidChat);
      expect(result.success).toBe(false);
    });

    it("rejects message exceeding 300 characters", () => {
      const longMessage = "a".repeat(301);
      const invalidChat = {
        message: longMessage,
        city: "Delhi",
        naqi: 280,
        category: "Poor",
        cleanAirWindow: "2:00 PM – 4:00 PM IST",
        profile: "family_with_kids",
      };

      const result = ChatRequestSchema.safeParse(invalidChat);
      expect(result.success).toBe(false);
    });

    it("rejects city name exceeding 300 characters", () => {
      const longCity = "c".repeat(301);
      const invalidChat = {
        message: "Is it safe to go out?",
        city: longCity,
        naqi: 280,
        category: "Poor",
        cleanAirWindow: "2:00 PM – 4:00 PM IST",
        profile: "family_with_kids",
      };

      const result = ChatRequestSchema.safeParse(invalidChat);
      expect(result.success).toBe(false);
    });
  });
});
