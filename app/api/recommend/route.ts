import { NextRequest, NextResponse } from "next/server";
import { RecommendRequestSchema } from "@/lib/validation";
import { fetchLiveAqi } from "@/lib/aqi";
import { generateAqiRecommendation } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const parseResult = RecommendRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validReq = parseResult.data;

    // Fetch live AQI if not supplied or stale
    const liveAqi = await fetchLiveAqi(validReq.city);

    const recommendation = await generateAqiRecommendation(validReq, liveAqi);

    return NextResponse.json(
      {
        success: true,
        city: validReq.city,
        resolvedCity: liveAqi.resolvedCity,
        naqi: liveAqi.naqi,
        cleanAirWindow: liveAqi.cleanAirWindow,
        recommendation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Recommend API Route Error:", error);
    return NextResponse.json(
      {
        error: "An error occurred while generating recommendations. Please try again.",
      },
      { status: 500 }
    );
  }
}
