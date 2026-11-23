import { describe, it, expect } from "vitest";
import {
  calculatePM25SubIndex,
  calculatePM10SubIndex,
  calculateNAQI,
  getCategoryFromNAQI,
  findBestCleanAirWindow,
  buildHourlyForecast,
  calculateCigaretteEquivalent,
  calculateCommuteImpact,
  NAQI_COLORS,
} from "@/lib/aqi-math";
import { geocodeIndianCity, fetchLiveAqi, reverseGeocodeCoords } from "@/lib/aqi";
import { answerContextualQuestion } from "@/lib/gemini";

describe("CPCB NAQI Sub-Index Calculations", () => {
  it("calculates PM2.5 sub-index across official CPCB categories", () => {
    // Good: 0–30 µg/m³ -> 0–50 NAQI
    const goodSub = calculatePM25SubIndex(15);
    expect(goodSub).toBeGreaterThanOrEqual(0);
    expect(goodSub).toBeLessThanOrEqual(50);

    // Satisfactory: 31–60 µg/m³ -> 51–100 NAQI
    const satSub = calculatePM25SubIndex(45);
    expect(satSub).toBeGreaterThanOrEqual(51);
    expect(satSub).toBeLessThanOrEqual(100);

    // Moderate: 61–90 µg/m³ -> 101–200 NAQI
    const modSub = calculatePM25SubIndex(75);
    expect(modSub).toBeGreaterThanOrEqual(101);
    expect(modSub).toBeLessThanOrEqual(200);

    // Poor: 91–120 µg/m³ -> 201–300 NAQI
    const poorSub = calculatePM25SubIndex(105);
    expect(poorSub).toBeGreaterThanOrEqual(201);
    expect(poorSub).toBeLessThanOrEqual(300);

    // Very Poor: 121–250 µg/m³ -> 301–400 NAQI
    const vPoorSub = calculatePM25SubIndex(180);
    expect(vPoorSub).toBeGreaterThanOrEqual(301);
    expect(vPoorSub).toBeLessThanOrEqual(400);

    // Severe: 251–350+ µg/m³ -> 401–500 NAQI
    const severeSub = calculatePM25SubIndex(300);
    expect(severeSub).toBeGreaterThanOrEqual(401);
    expect(severeSub).toBeLessThanOrEqual(500);

    // Extreme off-scale capped at 500
    const extremeSub = calculatePM25SubIndex(600);
    expect(extremeSub).toBe(500);
  });

  it("calculates PM10 sub-index across official CPCB categories", () => {
    // Good: 0–50 µg/m³ -> 0–50 NAQI
    expect(calculatePM10SubIndex(25)).toBe(25);

    // Satisfactory: 51–100 µg/m³ -> 51–100 NAQI
    expect(calculatePM10SubIndex(75)).toBe(75);

    // Moderate: 101–250 µg/m³ -> 101–200 NAQI
    const mod10 = calculatePM10SubIndex(175);
    expect(mod10).toBeGreaterThanOrEqual(101);
    expect(mod10).toBeLessThanOrEqual(200);

    // Poor: 251–350 µg/m³ -> 201–300 NAQI
    const poor10 = calculatePM10SubIndex(300);
    expect(poor10).toBeGreaterThanOrEqual(201);
    expect(poor10).toBeLessThanOrEqual(300);

    // Very Poor: 351–430 µg/m³ -> 301–400 NAQI
    const vPoor10 = calculatePM10SubIndex(390);
    expect(vPoor10).toBeGreaterThanOrEqual(301);
    expect(vPoor10).toBeLessThanOrEqual(400);

    // Severe: 431+ µg/m³ -> 401–500 NAQI
    const severe10 = calculatePM10SubIndex(480);
    expect(severe10).toBeGreaterThanOrEqual(401);
    expect(severe10).toBeLessThanOrEqual(500);
  });

  it("correctly determines dominant pollutant and overall NAQI score", () => {
    // PM2.5 higher than PM10
    const res1 = calculateNAQI(110, 80); // PM2.5 in Poor, PM10 in Satisfactory
    expect(res1.dominantPollutant).toBe("PM2.5");
    expect(res1.category).toBe("Poor");
    expect(res1.categoryColor).toBe(NAQI_COLORS.Poor);

    // PM10 higher than PM2.5
    const res2 = calculateNAQI(20, 200); // PM2.5 in Good, PM10 in Moderate
    expect(res2.dominantPollutant).toBe("PM10");
    expect(res2.category).toBe("Moderate");
  });

  it("maps NAQI thresholds to official CPCB categories", () => {
    expect(getCategoryFromNAQI(45)).toBe("Good");
    expect(getCategoryFromNAQI(85)).toBe("Satisfactory");
    expect(getCategoryFromNAQI(150)).toBe("Moderate");
    expect(getCategoryFromNAQI(240)).toBe("Poor");
    expect(getCategoryFromNAQI(350)).toBe("Very Poor");
    expect(getCategoryFromNAQI(450)).toBe("Severe");
  });
});

describe("24-Hour Clean-Air Window Engine", () => {
  it("scans hourly PM2.5 forecast and identifies the minimum 2-hour window", () => {
    // 24 simulated hours with a distinct valley at index 14 & 15 (2 PM & 3 PM)
    const hourlyTimes = Array.from({ length: 24 }, (_, i) => {
      const d = new Date("2026-11-23T00:00:00Z");
      d.setUTCHours(i);
      return d.toISOString();
    });

    const hourlyPm25 = [
      120, 110, 100, 95, 90, 130, 150, 180, 160, 140, 100, 80, 60, 50, 25, 20, 45, 80, 110, 140, 160, 170, 150, 130,
    ];

    const window = findBestCleanAirWindow(hourlyTimes, hourlyPm25);

    expect(window).toBeDefined();
    // Indices 14 and 15 have values 25 and 20 -> avg = 22.5
    expect(window.avgPm25).toBe(22.5);
    expect(window.startHour).toBe(new Date(hourlyTimes[14]).getHours());
    expect(window.label).toContain("IST");
  });

  it("handles empty or sparse forecast arrays gracefully", () => {
    const fallbackWindow = findBestCleanAirWindow([], []);
    expect(fallbackWindow).toBeDefined();
    expect(fallbackWindow.startHour).toBe(14);
    expect(fallbackWindow.endHour).toBe(16);
  });

  it("builds hourly forecast with clean window flags", () => {
    const times = ["2026-11-23T14:00:00Z", "2026-11-23T15:00:00Z", "2026-11-23T16:00:00Z"];
    const pm25 = [30, 32, 70];
    const pm10 = [50, 55, 120];

    const cleanWindow = {
      startTime: "14:00",
      endTime: "16:00",
      startHour: new Date(times[0]).getHours(),
      endHour: new Date(times[2]).getHours(),
      avgPm25: 31,
      label: "2:00 PM – 4:00 PM IST",
      advice: "Ventilate",
    };

    const forecast = buildHourlyForecast(times, pm25, pm10, cleanWindow);
    expect(forecast.length).toBe(3);
    expect(forecast[0].isCleanWindow).toBe(true);
    expect(forecast[1].isCleanWindow).toBe(true);
    expect(forecast[2].isCleanWindow).toBe(false);
  });
});

describe("Geocoding & AQI Retrieval Resilience", () => {
  it("resolves pre-configured Indian cities instantly", async () => {
    const delhi = await geocodeIndianCity("Delhi");
    expect(delhi.name).toBe("New Delhi");
    expect(delhi.lat).toBeCloseTo(28.6139, 2);

    const mumbai = await geocodeIndianCity("Mumbai");
    expect(mumbai.name).toBe("Mumbai");
    expect(mumbai.lon).toBeCloseTo(72.8777, 2);

    const bengaluru = await geocodeIndianCity("Bengaluru");
    expect(bengaluru.name).toBe("Bengaluru");
  });

  it("fetches live AQI and builds comprehensive telemetry structure", async () => {
    const aqi = await fetchLiveAqi("Delhi");

    expect(aqi).toBeDefined();
    expect(aqi.city).toBe("Delhi");
    expect(aqi.naqi).toBeGreaterThanOrEqual(0);
    expect(aqi.category).toBeDefined();
    expect(aqi.dominantPollutant).toMatch(/PM2\.5|PM10/);
    expect(aqi.current.pm2_5).toBeGreaterThan(0);
    expect(aqi.hourly.length).toBeGreaterThan(0);
    expect(aqi.cleanAirWindow).toBeDefined();
    expect(aqi.source).toContain("Open-Meteo Air Quality API");
  });

  it("fetches live AQI directly using coordinates mode without geocoding", async () => {
    const coords = { lat: 28.6139, lon: 77.209 };
    const aqi = await fetchLiveAqi("Custom GPS Point", coords);

    expect(aqi).toBeDefined();
    expect(aqi.coordinates.lat).toBe(coords.lat);
    expect(aqi.coordinates.lon).toBe(coords.lon);
    // After Nominatim reverse-geocoding, resolvedCity is a real city name or fallback string
    expect(aqi.resolvedCity).toBeDefined();
    expect(typeof aqi.resolvedCity).toBe("string");
    expect(aqi.resolvedCity.length).toBeGreaterThan(0);
    expect(aqi.naqi).toBeGreaterThanOrEqual(0);
    expect(aqi.cleanAirWindow).toBeDefined();
    expect(aqi.current.pm2_5).toBeGreaterThan(0);
  });

  it("reverseGeocodeCoords returns a valid name and state string", async () => {
    // Using coords at (0, 0) — ocean — Nominatim may return a result or fail gracefully
    const result = await reverseGeocodeCoords(0, 0);
    expect(result).toBeDefined();
    expect(typeof result.name).toBe("string");
    expect(result.name.length).toBeGreaterThan(0);
    expect(typeof result.state).toBe("string");
    expect(result.state.length).toBeGreaterThan(0);
  });
});

describe("Relatable Health Context & Exposure Simulator Calculations", () => {
  it("calculates passive cigarette equivalent accurately", () => {
    // 22 µg/m³ PM2.5 = 1 cigarette
    expect(calculateCigaretteEquivalent(22)).toBe(1.0);
    expect(calculateCigaretteEquivalent(44)).toBe(2.0);
    expect(calculateCigaretteEquivalent(110)).toBe(5.0);
    expect(calculateCigaretteEquivalent(0)).toBe(0);
    expect(calculateCigaretteEquivalent(-10)).toBe(0);
  });

  it("calculates commute exposure avoided and CO2e savings correctly", () => {
    const ambientPm25 = 100;
    const distanceKm = 10; // 10 km one-way = 20 km/day = 100 km/week (5 workdays)

    // Solo Car baseline: 0 savings
    const carImpact = calculateCommuteImpact(distanceKm, "car", ambientPm25);
    expect(carImpact.co2eSavedKgWeek).toBe(0);
    expect(carImpact.exposureAvoidedUgDay).toBe(0);

    // Metro / Bus + N95: 100 km * 0.11 kg/km = 11 kg CO2e/week saved
    const transitImpact = calculateCommuteImpact(distanceKm, "public_transit_n95", ambientPm25);
    expect(transitImpact.co2eSavedKgWeek).toBe(11);
    expect(transitImpact.exposureAvoidedUgDay).toBeGreaterThan(0);
    expect(transitImpact.formulaNote).toBeDefined();

    // WFH / Combine Trips: 100 km * 0.15 kg/km = 15 kg CO2e/week saved
    const wfhImpact = calculateCommuteImpact(distanceKm, "wfh", ambientPm25);
    expect(wfhImpact.co2eSavedKgWeek).toBe(15);
    // WFH should avoid slightly more exposure than N95 (100% vs 95%)
    expect(wfhImpact.exposureAvoidedUgDay).toBeGreaterThan(transitImpact.exposureAvoidedUgDay);
  });

  it("enforces strict off-topic guardrail refusal for unrelated domain questions", async () => {
    const mockLiveData = await fetchLiveAqi("Delhi");
    const offTopicResponse = await answerContextualQuestion(
      "Who won the cricket match yesterday and what is the latest IPL score?",
      "Delhi",
      mockLiveData,
      "family_with_kids",
      []
    );

    expect(offTopicResponse).toBeDefined();
    expect(offTopicResponse).toContain("specialize exclusively as an Indian Urban Air Quality & Health Companion");
  });
});
