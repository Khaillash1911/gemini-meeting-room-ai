import { NextResponse } from "next/server";
import { createBooking } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { roomId, date, time, duration, name } = body;

    // Basic validation
    if (!roomId || !date || !time) {
      return NextResponse.json(
        { error: "MISSING_FIELDS", details: "roomId, date, time are required" },
        { status: 400 }
      );
    }

    // Construct booking object
    // Note: In a real app, we should re-validate availability here to prevent race conditions.
    const bookingData = {
      roomId,
      date,
      time,
      duration: duration || 60,
      name: name || "AI Booking", // Default name if not provided
      createdAt: new Date().toISOString(),
    };

    const result = await createBooking(bookingData);

    return NextResponse.json({ success: true, booking: result }, { status: 200 });
  } catch (error) {
    console.error("Booking Create Error:", error);
    return NextResponse.json(
      { error: "SERVER_ERROR", details: String(error) },
      { status: 500 }
    );
  }
}
