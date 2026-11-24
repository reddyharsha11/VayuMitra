import { z } from "zod";

export const RecommendRequestSchema = z.object({
  city: z.string().trim().min(1, "City is required").max(300, "City name cannot exceed 300 characters"),
  profile: z.enum([
    "family_with_kids",
    "senior_asthma",
    "daily_commuter",
    "student_athlete",
  ]),
  lifestyle: z.object({
    hasAirPurifier: z.boolean(),
    commuteOver10km: z.boolean(),
    gasStoveOrKitchenExhaust: z.boolean(),
  }),
  language: z.enum(["en", "hi"]).default("en"),
  liveAqi: z
    .object({
      naqi: z.number(),
      category: z.string().max(50),
      dominantPollutant: z.string().max(50),
      cleanAirWindow: z.string().max(100),
      pm2_5: z.number(),
      pm10: z.number(),
    })
    .optional(),
});

export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;

export const RoutineSlotSchema = z.object({
  time: z.string(),
  title: z.string(),
  action: z.string(),
  emissionTip: z.string(),
  exposureRisk: z.enum(["Low", "Moderate", "High"]),
});

export const IndoorHackSchema = z.object({
  id: z.string(),
  title: z.string(),
  action: z.string(),
  impact: z.string(),
  category: z.enum(["ventilation", "cleaning", "purification", "plants"]),
});

export const SustainableAlternativeSchema = z.object({
  currentHabit: z.string(),
  sustainableAlternative: z.string(),
  whyItMatters: z.string(),
  directImpactMetric: z.string(),
});

export const RecommendResponseSchema = z.object({
  severitySummary: z.string(),
  dailyRoutine: z.object({
    morning: RoutineSlotSchema,
    afternoon: RoutineSlotSchema,
    evening: RoutineSlotSchema,
  }),
  indoorHacks: z.array(IndoorHackSchema).length(4),
  sustainableAlternatives: z.array(SustainableAlternativeSchema).length(3),
});

export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;

export const ChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(300, "Message cannot exceed 300 characters"),
  city: z.string().trim().min(1).max(300, "City name cannot exceed 300 characters"),
  naqi: z.number(),
  category: z.string().max(50),
  cleanAirWindow: z.string().max(100),
  profile: z.string().max(100),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .optional()
    .default([]),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
