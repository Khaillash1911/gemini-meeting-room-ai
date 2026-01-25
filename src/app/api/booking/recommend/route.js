import { NextResponse } from "next/server";
import { runBookingRecommendation } from "@/mcp/controller/bookingController";

export async function POST(req) {
  try {
    const body = await req.json();
    const { roomId, requestText, date } = body;

    // roomId is optional for general search
    if (!requestText || !date) {
      return NextResponse.json(
        { blocked: true, error: "MISSING_FIELDS", details: ["requestText, date are required"] },
        { status: 400 }
      );
    }

    const result = await runBookingRecommendation({ roomId, requestText, date });

    if (!result.ok) {
      // Fail closed (Milestone 3 rule)
      return NextResponse.json(
        { blocked: true, error: result.error, details: result.details ?? null, raw: result.raw ?? null },
        { status: 503 }
      );
    }

    return NextResponse.json({ blocked: false, recommendation: result.recommendation }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { blocked: true, error: "SERVER_ERROR", details: String(e) },
      { status: 500 }
    );
  }
}
