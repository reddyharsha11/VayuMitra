import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getAqi } from "@/app/api/aqi/route";
import { POST as postRecommend } from "@/app/api/recommend/route";
import { POST as postChat } from "@/app/api/chat/route";

describe("API Route Handlers", () => {
  describe("GET /api/aqi", () => {
    it("returns 200 with AQI payload for known Indian city", async () => {
      const req = new NextRequest("http://localhost:3000/api/aqi?city=Delhi");
      const res = await getAqi(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.city).toBe("Delhi");
      expect(data.naqi).toBeGreaterThanOrEqual(0);
      expect(data.category).toBeDefined();
      expect(data.cleanAirWindow).toBeDefined();
    });

    it("returns 200 with AQI payload for coordinates query", async () => {
      const req = new NextRequest("http://localhost:3000/api/aqi?lat=19.076&lon=72.8777");
      const res = await getAqi(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.coordinates).toBeDefined();
      expect(data.coordinates.lat).toBeCloseTo(19.076, 2);
      expect(data.coordinates.lon).toBeCloseTo(72.8777, 2);
      expect(data.resolvedCity).toBeDefined();
    });

    it("returns 400 when invalid coordinate parameters are provided", async () => {
      const req = new NextRequest("http://localhost:3000/api/aqi?lat=invalid&lon=invalid");
      const res = await getAqi(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });

  describe("POST /api/recommend", () => {
    it("returns 200 with recommendation payload for valid request", async () => {
      const body = {
        city: "Delhi",
        profile: "family_with_kids",
        lifestyle: {
          hasAirPurifier: true,
          commuteOver10km: false,
          gasStoveOrKitchenExhaust: true,
        },
        language: "en",
        liveAqi: {
          naqi: 220,
          category: "Poor",
          dominantPollutant: "PM2.5",
          cleanAirWindow: "1:00 PM – 4:00 PM IST",
          pm2_5: 95.0,
          pm10: 160.0,
        },
      };

      const req = new NextRequest("http://localhost:3000/api/recommend", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postRecommend(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.recommendation).toBeDefined();
      expect(data.recommendation.severitySummary).toBeDefined();
      expect(data.recommendation.dailyRoutine).toBeDefined();
      expect(data.recommendation.indoorHacks.length).toBe(4);
      expect(data.recommendation.sustainableAlternatives.length).toBe(3);
    });

    it("returns 400 for invalid request body missing required fields", async () => {
      const invalidBody = {
        city: "",
        profile: "invalid_profile_enum",
      };

      const req = new NextRequest("http://localhost:3000/api/recommend", {
        method: "POST",
        body: JSON.stringify(invalidBody),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postRecommend(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe("Invalid request payload");
    });
  });

  describe("POST /api/chat", () => {
    it("returns 200 with AI answer for valid air quality query", async () => {
      const body = {
        message: "When should I open my windows in Delhi today?",
        city: "Delhi",
        naqi: 250,
        category: "Poor",
        cleanAirWindow: "1:00 PM – 4:00 PM IST",
        profile: "family_with_kids",
      };

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postChat(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.reply).toBeDefined();
      expect(typeof data.reply).toBe("string");
      expect(data.reply.length).toBeGreaterThan(0);
    });

    it("returns 400 for empty chat message", async () => {
      const body = {
        message: "",
        city: "Delhi",
        naqi: 250,
        category: "Poor",
      };

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postChat(req);
      expect(res.status).toBe(400);
    });

    it("returns 200 with domain guardrail refusal for off-topic query", async () => {
      const body = {
        message: "What is the latest score in the football match?",
        city: "Delhi",
        naqi: 250,
        category: "Poor",
        cleanAirWindow: "1:00 PM – 4:00 PM IST",
        profile: "family_with_kids",
      };

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postChat(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.reply).toContain("specialize exclusively as an Indian Urban Air Quality & Health Companion");
    });
  });
});
