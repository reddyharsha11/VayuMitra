import { NextRequest, NextResponse } from "next/server";
import { ChatRequestSchema } from "@/lib/validation";
import { fetchLiveAqi } from "@/lib/aqi";
import { answerContextualQuestion } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const parseResult = ChatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid chat payload",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { message, city, profile, history } = parseResult.data;

    const liveData = await fetchLiveAqi(city);
    const reply = await answerContextualQuestion(
      message,
      city,
      liveData,
      profile,
      history
    );

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("Chat API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Please try again." },
      { status: 500 }
    );
  }
}
