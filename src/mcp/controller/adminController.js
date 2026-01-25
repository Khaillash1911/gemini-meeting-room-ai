import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeRoomData({ requestText, rooms, bookings }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "MISSING_GEMINI_API_KEY" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // Prepare a concise summary of the data for the context window
  const totalCapacity = rooms.reduce((sum, r) => sum + (Number(r.capacity) || 0), 0);
  const roomSummaries = rooms.map(r => ({
      name: r.name,
      capacity: r.capacity,
      location: r.location,
      amenities: [
          r.wifi && "WiFi",
          r.hdmi && "HDMI", 
          r.micCam && "Mic/Cam",
          r.whiteboard && "Whiteboard",
          r.hasDisplay && "Display"
      ].filter(Boolean).join(", ")
  }));

  // Summarize bookings (e.g. valid for the last 30 days and upcoming)
  // For simplicity giving raw counts for now, or a subset
  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date());
  
  const context = {
      system_stats: {
          total_rooms: rooms.length,
          total_capacity: totalCapacity,
          total_upcoming_bookings: upcomingBookings.length
      },
      rooms: roomSummaries,
      // Sample of recent bookings to analyze trends
      recent_bookings_sample: bookings.slice(0, 20) // Limit token usage
  };

  const prompt = `
  You are an expert Data Analyst for a Meeting Room Booking System.
  User Request: "${requestText}"

  Analyze the provided data to answer the user's request.
  - Focus on capacity planning, utilization, and amenity needs.
  - Return the response as a **STRICT JSON ARRAY** of insight objects.
  - No markdown formatting in the JSON.
  
  Schema:
  [
      {
          "title": "Short Title (e.g. Peak Demand)",
          "severity": "neutral" | "warning" | "positive", 
          "content": "One or two concise sentences explaining the insight."
      }
  ]
  
  Data Context:
  ${JSON.stringify(context, null, 2)}
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // Clean potential markdown wrapping
    text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    
    const analysis = JSON.parse(text);
    return { ok: true, analysis }; // Return object, not string
  } catch (e) {
    console.error("Gemini Analysis Failed", e);
    // Fallback to simple text if JSON parse fails (rare but possible) or return error
    return { ok: false, error: "ANALYSIS_PARSING_FAILED", details: String(e) };
  }
}
