import { GoogleGenAI } from "@google/genai";
import { RecommendRequest, RecommendResponse, RecommendResponseSchema } from "./validation";
import { LiveAqiData } from "./types";

/**
 * Initializes Google GenAI client safely.
 * Returns null if GEMINI_API_KEY is not configured.
 */
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Profile human-readable descriptors
 */
const PROFILE_DESCRIPTIONS: Record<string, string> = {
  family_with_kids: "Family with young school-going children (sensitive lungs, active play)",
  senior_asthma: "Senior citizens and asthma/COPD-sensitive individuals (vulnerable airway)",
  daily_commuter: "Daily office commuter (20+ km transit via bike, auto, or metro during peak rush hours)",
  student_athlete: "Student and outdoor athlete (heavy aerobic breathing, outdoor training)",
};

/**
 * Generates structured AI recommendations using Gemini 2.5 Flash
 */
export async function generateAqiRecommendation(
  req: RecommendRequest,
  liveData: LiveAqiData
): Promise<RecommendResponse> {
  const ai = getGenAIClient();

  const profileDesc = PROFILE_DESCRIPTIONS[req.profile] || req.profile;
  const isHindi = req.language === "hi";

  if (!ai) {
    // Generate context-aware fallback response if no API key is provided
    return generateSmartFallback(req, liveData, isHindi);
  }

  const prompt = `
You are VayuMitra, an expert Indian Environmental Health Epidemiologist and Civic Sustainability Architect.
Analyze the following real-time air quality data for ${liveData.resolvedCity || req.city}, India and formulate an actionable, high-impact civic air quality advisory.

--- LIVE SENSOR TELEMETRY ---
- City: ${liveData.resolvedCity || req.city} (${liveData.state || "India"})
- Indian CPCB NAQI Score: ${liveData.naqi} (${liveData.category})
- Dominant Pollutant: ${liveData.dominantPollutant}
- Current PM2.5: ${liveData.current.pm2_5} µg/m³
- Current PM10: ${liveData.current.pm10} µg/m³
- Current NO2: ${liveData.current.no2} µg/m³
- Best 24-Hour Clean-Air Window Today: ${liveData.cleanAirWindow.label} (Avg PM2.5 ~ ${liveData.cleanAirWindow.avgPm25} µg/m³)

--- HOUSEHOLD PROFILE & CONTEXT ---
- Household Persona: ${profileDesc}
- Has Air Purifier: ${req.lifestyle.hasAirPurifier ? "Yes" : "No"}
- Commutes > 10 km daily: ${req.lifestyle.commuteOver10km ? "Yes" : "No"}
- Gas Stove / Kitchen Exhaust: ${req.lifestyle.gasStoveOrKitchenExhaust ? "Yes" : "No"}
- Target Language: ${isHindi ? "Hindi (Devanagari script with clear civic terms)" : "English"}

--- REQUIRED JSON OUTPUT STRUCTURE ---
Provide a strictly valid JSON response adhering to this schema:
{
  "severitySummary": "2 clear, empathetic sentences explaining what today's live AQI and PM2.5/PM10 levels mean specifically for this profile.",
  "dailyRoutine": {
    "morning": {
      "time": "6:00 AM – 10:00 AM",
      "title": "Short title",
      "action": "Practical action for morning routine taking into account morning smog / traffic inversion.",
      "emissionTip": "Low-emission civic tip for this time slot.",
      "exposureRisk": "Low" | "Moderate" | "High"
    },
    "afternoon": {
      "time": "12:00 PM – 4:00 PM",
      "title": "Short title incorporating clean-air window (${liveData.cleanAirWindow.label})",
      "action": "Specific instructions on natural ventilation, air intake, or safe outdoor movement during ${liveData.cleanAirWindow.label}.",
      "emissionTip": "Actionable energy/emission reduction step.",
      "exposureRisk": "Low" | "Moderate" | "High"
    },
    "evening": {
      "time": "6:00 PM – 10:00 PM",
      "title": "Short title",
      "action": "Evening commute/leisure guidance during evening peak traffic and cooling boundary layer.",
      "emissionTip": "Clean habit before sleeping.",
      "exposureRisk": "Low" | "Moderate" | "High"
    }
  },
  "indoorHacks": [
    {
      "id": "hack_1",
      "title": "Ventilation Strategy",
      "action": "Actionable cross-ventilation rule pegged specifically to ${liveData.cleanAirWindow.label}.",
      "impact": "Concrete percentage or exposure drop (e.g., -40% indoor PM2.5).",
      "category": "ventilation"
    },
    {
      "id": "hack_2",
      "title": "Wet Mopping vs Sweeping",
      "action": "Indian home cleaning tip: avoid dry jhadu (broom) which resuspends fine particulate dust.",
      "impact": "Prevents resuspension of 35-50% coarse dust indoors.",
      "category": "cleaning"
    },
    {
      "id": "hack_3",
      "title": "Air Filtration / Exhaust",
      "action": "${req.lifestyle.hasAirPurifier ? "Optimized CADR fan speed & closed-door sealing guidance." : "DIY HEPA / exhaust fan positioning and micro-fiber window screen."}",
      "impact": "Cuts particulate load in primary bedroom.",
      "category": "purification"
    },
    {
      "id": "hack_4",
      "title": "Bio-Purification & Kitchen IAQ",
      "action": "${req.lifestyle.gasStoveOrKitchenExhaust ? "Kitchen chimney / exhaust timing during tadka and LPG combustion." : "NASA-approved Indian indoor air plants (Areca Palm, Snake Plant) and moisture control."}",
      "impact": "Reduces indoor NO2 and VOC spikes.",
      "category": "plants"
    }
  ],
  "sustainableAlternatives": [
    {
      "currentHabit": "Single-occupancy car or petrol bike commute in peak hours",
      "sustainableAlternative": "Metro / electric bus / carpooling via dedicated transit",
      "whyItMatters": "Eliminates tailpipe emission exposure inside traffic corridors while cutting urban congestion.",
      "directImpactMetric": "~2.4 kg CO₂e saved per 15 km round-trip & 65% lower in-cabin PM2.5 inhalation"
    },
    {
      "currentHabit": "Opening balconies early morning at 6 AM during winter smog peak",
      "sustainableAlternative": "Strict seal until ${liveData.cleanAirWindow.label}, then 20-min cross-breeze purge",
      "whyItMatters": "Morning surface temperature inversion traps vehicular emissions close to ground level.",
      "directImpactMetric": "Prevents spike of 120+ µg/m³ PM2.5 from settling into bedrooms"
    },
    {
      "currentHabit": "Incense sticks (agarbatti), dhoop, or mosquito coils in closed rooms",
      "sustainableAlternative": "Electric vaporizers, sealed mosquito nets, and natural camphor diffusers with ventilation",
      "whyItMatters": "One incense stick releases PM2.5 equivalent to smoking 1–2 cigarettes in an enclosed room.",
      "directImpactMetric": "Drops indoor VOCs and ultra-fine carbon black particulate by >80%"
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text);
    const validated = RecommendResponseSchema.parse(parsed);
    return validated;
  } catch (error) {
    // If Gemini fails or response validation fails, fallback gracefully
    console.error("Gemini API call failed, using high-fidelity local reasoning engine:", error);
    return generateSmartFallback(req, liveData, isHindi);
  }
}

/**
 * Contextual follow-up chat with grounding in active city's AQI
 */
export async function answerContextualQuestion(
  message: string,
  city: string,
  liveData: LiveAqiData,
  profile: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const ai = getGenAIClient();

  if (!ai) {
    return generateMockChatAnswer(message, city, liveData, profile);
  }

  const systemInstruction = `
You are VayuMitra, an empathetic, scientific, civic-minded AI Air Quality Advisor for Indian cities.
You are assisting a resident in ${city}, India.
Current Real-Time Air Quality Snapshot:
- CPCB NAQI: ${liveData.naqi} (${liveData.category})
- Dominant Pollutant: ${liveData.dominantPollutant} (PM2.5: ${liveData.current.pm2_5} µg/m³, PM10: ${liveData.current.pm10} µg/m³)
- Best Clean-Air Window Today: ${liveData.cleanAirWindow.label}
- Resident Profile: ${profile}

Guidelines:
1. Always ground your medical/environmental advice in the active city's live CPCB numbers and the 24-hour clean air window (${liveData.cleanAirWindow.label}).
2. Be concise, actionable, and warm (under 150 words).
3. If they ask about morning walks or exercise, give exact timing recommendations based on the clean air window.
4. If they ask about masks, recommend certified N95/N99 respirators over cloth masks.
5. If in Hindi, respond in fluent Hindi.
6. STRICT CIVIC SCOPE GUARDRAIL: You are exclusively an Indian Urban Air Quality & Health Companion. If the user asks about unrelated topics (e.g., sports scores, movies, recipes, politics, general coding, or trivia), politely decline and state: "I specialize exclusively as an Indian Urban Air Quality & Health Companion. For your safety and focused guidance, I can only assist with air pollution, CPCB NAQI forecasts, ventilation windows, and low-emission commute advice."
`;

  try {
    const formattedHistory = history.slice(-4).map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: h.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user" as const, parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] },
      ],
      config: {
        temperature: 0.3,
      },
    });

    return response.text?.trim() || generateMockChatAnswer(message, city, liveData, profile);
  } catch (error) {
    console.error("Gemini chat error:", error);
    return generateMockChatAnswer(message, city, liveData, profile);
  }
}

/**
 * High-fidelity domain-expert fallback generator when Gemini API key is absent or network fails
 */
function generateSmartFallback(
  req: RecommendRequest,
  liveData: LiveAqiData,
  isHindi: boolean
): RecommendResponse {
  const isSevere = liveData.naqi >= 301;
  const isModerate = liveData.naqi >= 101 && liveData.naqi < 301;
  const windowLabel = liveData.cleanAirWindow.label;
  const profileDesc = PROFILE_DESCRIPTIONS[req.profile] || req.profile;

  if (isHindi) {
    return {
      severitySummary: `आज ${liveData.resolvedCity} में वायु गुणवत्ता सूचकांक (NAQI) ${liveData.naqi} (${liveData.category}) है, जिसमें मुख्य प्रदूषक ${liveData.dominantPollutant} है। ${PROFILE_DESCRIPTIONS[req.profile] || "आपके परिवार"} के लिए बाहरी संपर्क को सीमित रखना और स्वच्छ वायु खिड़की का उपयोग करना आवश्यक है।`,
      dailyRoutine: {
        morning: {
          time: "06:00 AM – 09:30 AM",
          title: "सुबह का स्मॉग और यातायात बचाव",
          action: isSevere
            ? "सुबह की सैर पूरी तरह टालें; खिड़कियां बंद रखें और घर पर हल्की स्ट्रेचिंग करें।"
            : "सुबह 7 बजे से पहले भारी व्यायाम न करें। बाहर निकलने पर N95 मास्क पहनें।",
          emissionTip: "कारपूलिंग या इलेक्ट्रिक मेट्रो का उपयोग करें; निजी वाहन का कम उपयोग करें।",
          exposureRisk: isSevere ? "High" : "Moderate",
        },
        afternoon: {
          time: "12:00 PM – 04:00 PM",
          title: `स्वच्छ वायु खिड़की (${windowLabel})`,
          action: `दोपहर ${windowLabel} के दौरान PM2.5 स्तर न्यूनतम रहता है। इसी समय घर के वेंटिलेशन और जरूरी काम निपटाएं।`,
          emissionTip: "कमरे में प्राकृतिक रोशनी का उपयोग करें, बिजली की बचत करें।",
          exposureRisk: "Low",
        },
        evening: {
          time: "06:00 PM – 10:00 PM",
          title: "शाम का शांत समय और वायु शोधन",
          action: req.lifestyle.hasAirPurifier
            ? "कमरे के दरवाजे बंद करके एयर प्यूरीफायर को मध्यम गति पर चलाएं।"
            : "गीले कपड़े से पोंछा लगाएं और खिड़कियां पूरी तरह बंद रखें।",
          emissionTip: "अगरबत्ती या मच्छर कॉइल के बजाय सुरक्षित विकल्पों का उपयोग करें।",
          exposureRisk: isSevere ? "High" : "Moderate",
        },
      },
      indoorHacks: [
        {
          id: "hack_1",
          title: "क्रॉस-वेंटिलेशन समय",
          action: `खिड़कियां केवल ${windowLabel} के बीच 15-20 मिनट के लिए खोलें ताकि ताजी हवा आ सके।`,
          impact: "इनडोर CO2 में 60% कमी और न्यूनतम बाहरी धूल।",
          category: "ventilation",
        },
        {
          id: "hack_2",
          title: "गीला पोंछा (Wet Mopping)",
          action: "सूखे झाड़ू के बजाय माइक्रोफाइबर मोप से गीला पोंछा लगाएं ताकि बारीक धूल हवा में न उड़े।",
          impact: "हवा में तैरते PM10 और PM2.5 में 40% की गिरावट।",
          category: "cleaning",
        },
        {
          id: "hack_3",
          title: "रसोई एग्जॉस्ट और चिमनी",
          action: "तड़के और गैस कुकिंग के समय एग्जॉस्ट पंखा खाना बनाने के 5 मिनट बाद तक चालू रखें।",
          impact: "इनडोर NO2 और हानिकारक वाष्प में 70% तक कमी।",
          category: "purification",
        },
        {
          id: "hack_4",
          title: "बायो-फिल्ट्रेशन पौधे",
          action: "कमरे में स्नेक प्लांट (Sansevieria) और एरेका पाम रखें जो रात में भी ऑक्सीजन छोड़ते हैं।",
          impact: "प्राकृतिक ऑक्सीजन वृद्धि और इनडोर VOCs में कमी।",
          category: "plants",
        },
      ],
      sustainableAlternatives: [
        {
          currentHabit: "अकेले निजी पेट्रोल/डीजल कार से दैनिक आवागमन",
          sustainableAlternative: "मेट्रो, इलेक्ट्रिक बस या ऑफिस शटल पूल का नियमित उपयोग",
          whyItMatters: "सड़क के मुख्य ट्रैफिक में टेलपाइप प्रदूषण से बचाव और शहरी उत्सर्जन में सीधा सुधार।",
          directImpactMetric: "प्रति यात्रा ~2.5 किग्रा CO₂e की बचत और 50% कम जहरीली गैसों का इनहेलेशन।"
        },
        {
          currentHabit: "सुबह 6 बजे भारी स्मॉग के समय बालकनी के दरवाजे खोलना",
          sustainableAlternative: `खिड़कियों को ${windowLabel} तक बंद रखना और दोपहर में सीमित वेंटिलेशन`,
          whyItMatters: "सुबह के समय जमीनी इनवर्जन के कारण वाहन प्रदूषण जमीन के सबसे करीब जमा रहता है।",
          directImpactMetric: "घर के अंदर 100+ µg/m³ PM2.5 घुसने से पूरी तरह रोकथाम।"
        },
        {
          currentHabit: "बंद कमरे में अगरबत्ती या मच्छर वाली कॉइल जलाना",
          sustainableAlternative: "मच्छरदानी, लिक्विड वेपोराइज़र और प्राकृतिक डिफ्यूज़र का उपयोग",
          whyItMatters: "एक अगरबत्ती का धुआं बंद कमरे में 1-2 सिगरेट के बराबर PM2.5 पैदा करता है।",
          directImpactMetric: "कमरे में कार्बन और कार्सिनोजेनिक कणों में 85% की भारी कमी।"
        }
      ],
    };
  }

  return {
    severitySummary: `Today in ${liveData.resolvedCity}, the Indian CPCB NAQI stands at ${liveData.naqi} (${liveData.category}) driven primarily by elevated ${liveData.dominantPollutant} concentrations. For a ${profileDesc.toLowerCase()}, prolonged outdoor respiration poses heightened airway irritation, making disciplined window-timing and personal exposure shielding critical.`,
    dailyRoutine: {
      morning: {
        time: "6:00 AM – 10:00 AM",
        title: "Smog Inversion & Commute Shielding",
        action: isSevere
          ? "Postpone outdoor jogging or walks entirely; substitute with indoor yoga or resistance training."
          : "Keep morning commutes enclosed. Wear a snug-fitting N95 respirator if riding a two-wheeler or walking along arterial roads.",
        emissionTip: "Combine school drops or errands into single multi-stop routes to minimize cold-engine emissions.",
        exposureRisk: isSevere ? "High" : "Moderate",
      },
      afternoon: {
        time: "12:00 PM – 4:00 PM",
        title: `Clean-Air Window Aeration (${windowLabel})`,
        action: `Take full advantage of today's best clean-air window (${windowLabel}) to aerate your home for 20 minutes and schedule essential outdoor movement.`,
        emissionTip: "Turn off standby appliances and use cross-breeze naturally to cut reliance on power plants.",
        exposureRisk: "Low",
      },
      evening: {
        time: "6:00 PM – 10:00 PM",
        title: "Evening Sealing & Bedroom Sanctuary",
        action: req.lifestyle.hasAirPurifier
          ? "Seal bedroom windows, close doors, and run your air purifier on medium CADR mode 45 minutes before sleep."
          : "Seal window edges with weather strips or damp towels; avoid indoor aerosol sprays and incense.",
        emissionTip: "Avoid burning mosquito coils or garden leaves in neighborhood colonies.",
        exposureRisk: isSevere ? "High" : "Moderate",
      },
    },
    indoorHacks: [
      {
        id: "hack_1",
        title: "Timed Cross-Ventilation",
        action: `Open opposite-facing windows strictly during ${windowLabel} for exactly 15–20 minutes to flush out built-up CO2 without letting heavy traffic soot settle.`,
        impact: "Reduces indoor CO2 to <700 ppm while keeping PM2.5 infiltration <15%.",
        category: "ventilation",
      },
      {
        id: "hack_2",
        title: "Damp Microfiber Mopping",
        action: "Completely replace dry jhadu (broom) sweeping with damp microfiber mopping once daily in the early afternoon.",
        impact: "Prevents resuspension of 40–55% of floor-settled coarse dust and particulate matter.",
        category: "cleaning",
      },
      {
        id: "hack_3",
        title: req.lifestyle.hasAirPurifier ? "CADR & Bedroom Optimization" : "DIY Exhaust Air Management",
        action: req.lifestyle.hasAirPurifier
          ? "Keep purifier 2 feet away from walls in the primary sleeping area; ensure intake grills are vacuumed weekly."
          : "Fit a high-mesh micro-screen on kitchen and bathroom exhaust fans to avoid back-draft of outdoor soot.",
        impact: req.lifestyle.hasAirPurifier ? "Maintains indoor PM2.5 < 25 µg/m³" : "Blocks 30% back-draft outdoor particulates",
        category: "purification",
      },
      {
        id: "hack_4",
        title: "Kitchen Exhaust & Bio-Filtration",
        action: "Run kitchen chimney/exhaust during all cooking and keep tadka sputtering enclosed; place Snake Plants in bedrooms.",
        impact: "Cuts localized indoor NO2 and ultrafine lipid aerosols by up to 75%.",
        category: "plants",
      },
    ],
    sustainableAlternatives: [
      {
        currentHabit: "Single-occupant petrol/diesel car drive in stop-and-go morning traffic",
        sustainableAlternative: "Metro transit, electric bus, or verified 3+ carpool corridor",
        whyItMatters: "Idling vehicles in Indian traffic corridors expose commuters to 4x higher toxic VOCs and black carbon.",
        directImpactMetric: "Saves ~2.4 kg CO₂e per 15 km round-trip and slashes commuter inhalation of toxic exhaust by 60%."
      },
      {
        currentHabit: "Airing out the house at 6:30 AM during winter thermal inversion",
        sustainableAlternative: `Sealing home until ${windowLabel}, then performing a rapid 20-minute purge`,
        whyItMatters: "Cold morning air traps heavy diesel soot, dust, and localized biomass smoke within 50 meters of ground level.",
        directImpactMetric: "Prevents an indoor spike of 120+ µg/m³ PM2.5 from settling into bedrooms."
      },
      {
        currentHabit: "Burning evening incense sticks (agarbatti) or dhoop in closed living rooms",
        sustainableAlternative: "Pure beeswax candles, essential oil reed diffusers, or chemical-free LED night lamps",
        whyItMatters: "A single incense stick emits PM2.5 particulate mass equivalent to smoking 1–2 cigarettes in an enclosed space.",
        directImpactMetric: "Lowers indoor volatile organic compounds (benzene, toluene) and ultrafine soot by >85%."
      }
    ],
  };
}

/**
 * Fallback answer for contextual chat
 */
function generateMockChatAnswer(
  message: string,
  city: string,
  liveData: LiveAqiData,
  profile: string
): string {
  const lower = message.toLowerCase();
  const windowLabel = liveData.cleanAirWindow.label;

  // Off-topic refusal guardrail
  const offTopicKeywords = [
    "cricket",
    "ipl",
    "football",
    "score",
    "movie",
    "cinema",
    "actor",
    "song",
    "recipe",
    "cook",
    "stock",
    "crypto",
    "bitcoin",
    "coding",
    "python",
    "javascript",
    "politics",
    "election",
    "president",
    "prime minister",
    "joke",
  ];

  if (offTopicKeywords.some((kw) => lower.includes(kw))) {
    return "I specialize exclusively as an Indian Urban Air Quality & Health Companion. For your safety and focused guidance, I can only assist with air pollution, CPCB NAQI forecasts, ventilation windows, and low-emission commute advice.";
  }

  if (lower.includes("walk") || lower.includes("jog") || lower.includes("run") || lower.includes("exercise") || lower.includes("morning")) {
    if (liveData.naqi > 200) {
      return `Based on today's CPCB NAQI of ${liveData.naqi} (${liveData.category}) in ${city}, early morning outdoor walks (6 AM – 9 AM) are strongly discouraged due to heavy surface smog inversion. For your household (${profile}), schedule essential outdoor movement during today's cleanest 2-hour window: ${windowLabel}, where PM2.5 drops to approximately ${liveData.cleanAirWindow.avgPm25} µg/m³. If walking outside, please wear a well-fitted N95 mask.`;
    }
    return `In ${city} today, air quality is ${liveData.category} (NAQI ${liveData.naqi}). Moderate outdoor walks are acceptable, but the safest time with the lowest particulate exposure is during the clean-air window from ${windowLabel}.`;
  }

  if (lower.includes("mask") || lower.includes("n95") || lower.includes("cloth")) {
    return `Given ${city}'s current dominant pollutant is ${liveData.dominantPollutant} with an NAQI of ${liveData.naqi}, standard cloth or surgical masks filter less than 20% of sub-micron particles. Use a certified N95 or FFP2 respirator with a tight nose-bridge seal when commuting or spending more than 15 minutes outdoors.`;
  }

  if (lower.includes("purifier") || lower.includes("filter") || lower.includes("indoor")) {
    return `To maximize indoor air quality in ${city} today, keep bedroom doors shut and position your purifier at least 2 feet from walls. If you don't own a purifier, avoid dry sweeping (which resuspends fine soot) and open windows strictly during the cleanest window (${windowLabel}) for a 20-minute cross-ventilation purge.`;
  }

  return `Currently in ${city}, the Indian CPCB NAQI is ${liveData.naqi} (${liveData.category}), with ${liveData.dominantPollutant} as the primary pollutant. For ${profile}, avoid peak roadside exposure during morning and evening rush hours. The optimal time for outdoor activities and home airing today is ${windowLabel}. Let me know if you need specific advice on transit, children's school routines, or indoor filtration!`;
}
