import { NextResponse } from "next/server";
import { getRooms, getAllBookings } from "@/lib/db";
import { analyzeRoomData } from "@/mcp/controller/adminController";

export async function POST(req) {
  try {
    const body = await req.json();
    const { requestText } = body;

    if (!requestText) {
      return NextResponse.json({ error: "Missing requestText" }, { status: 400 });
    }

    // Fetch fresh data to analyze
    const [rooms, bookings] = await Promise.all([
        getRooms(),
        getAllBookings()
    ]);

    const result = await analyzeRoomData({ 
        requestText, 
        rooms, 
        bookings 
    });

    if (!result.ok) {
        return NextResponse.json({ error: result.error, details: result.details }, { status: 500 });
    }

    return NextResponse.json({ analysis: result.analysis });

  } catch (error) {
    console.error("Admin Analysis API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
