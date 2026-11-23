import { NextRequest, NextResponse } from "next/server";
import { fetchLiveAqi } from "@/lib/aqi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const cityParam = searchParams.get("city");

    let aqiData;

    if (latParam !== null && lonParam !== null) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);

      if (isNaN(lat) || isNaN(lon)) {
        return NextResponse.json(
          { error: "Invalid latitude or longitude coordinate parameters" },
          { status: 400 }
        );
      }

      aqiData = await fetchLiveAqi(cityParam || "GPS Location", { lat, lon });
    } else {
      const city = cityParam || "Delhi";
      if (!city || city.trim().length === 0) {
        return NextResponse.json(
          { error: "City parameter cannot be empty" },
          { status: 400 }
        );
      }
      aqiData = await fetchLiveAqi(city.trim());
    }

    return NextResponse.json(aqiData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("AQI Route Error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve air quality data. Please check location parameters and try again.",
      },
      { status: 500 }
    );
  }
}
