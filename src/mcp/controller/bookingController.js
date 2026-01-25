import { getGeminiRecommendation } from "../model/geminiModel";
import { validateGeminiOutput } from "../policy/bookingPolicy";
import { getRooms, getAllBookings } from "@/lib/db";

export async function runBookingRecommendation({ roomId, requestText, date }) {
    // 1. Build model context
    const context = {
        roomId,
        requestText,
        date,
        roomConstraints: { singleRoom: true },
        orgPrefs: {
            timezone: "+08:00",
            officeHours: { start: "09:00", end: "18:00" },
        },
    };

    // 2. Call Gemini Model (Intent & Recommendation)
    const g = await getGeminiRecommendation(context);
    if (!g.ok) {
        return { ok: false, blocked: true, error: g.error, details: g.details, raw: g.raw };
    }

    // 3. Validate with Policy
    const errors = validateGeminiOutput(g.data);
    if (errors.length) {
        return { ok: false, blocked: true, error: "POLICY_VALIDATION_FAILED", details: errors, raw: g.raw };
    }

    const { recommended_duration_mins, preferred_time_window, meeting_type, meeting_date } = g.data;

    // Use the date inferred by Gemini (e.g. tomorrow) or fallback to today
    const targetDate = meeting_date || date;

    // 4. Check Availability (Controller Logic)
    try {
        const [allRooms, allBookings] = await Promise.all([getRooms(), getAllBookings()]);
        
        // Filter bookings for the requested date
        const dayBookings = allBookings.filter(b => b.date === targetDate);

        // Find available rooms
        const availableRooms = allRooms.filter(room => {
            // Check capacity or other constraints if Gemini provided them (omitted for now to focus on time)
            
            // Check time conflicts
            const roomBookings = dayBookings.filter(b => b.roomId === room.id);
            return isSlotAvailable(roomBookings, preferred_time_window, recommended_duration_mins);
        });

        if (availableRooms.length === 0) {
            return {
                ok: false,
                blocked: true, 
                error: "NO_AVAILABILITY",
                details: [`No rooms available on ${targetDate} between ${preferred_time_window.start} and ${preferred_time_window.end}`],
                raw: g.data 
            };
        }

        // 5. Select Best Room (Simple heuristic: pick first available)
        const selectedRoom = availableRooms[0];
        
        return { 
            ok: true, 
            blocked: false, 
            recommendation: {
                ...g.data,
                suggestedBooking: {
                    roomId: selectedRoom.id,
                    roomName: selectedRoom.name,
                    date: targetDate, // Use the correct target date
                    time: preferred_time_window.start, // Propose the start of the window provided by Gemini
                    duration: recommended_duration_mins
                }
            }
        };

    } catch (dbError) {
        console.error("DB Availability Check Failed", dbError);
        return { ok: false, blocked: true, error: "AVAILABILITY_CHECK_FAILED", details: String(dbError) };
    }
}

function isSlotAvailable(bookings, window, durationMins) {
    // Simple verification: strictly check if the requested start time (window.start) works.
    // In a real agent, we might slide the window. For M3, checking the exact start is a safe "Happy Path".
    
    // Convert times to minutes for comparison
    const [startH, startM] = window.start.split(':').map(Number);
    // const [endH, endM] = window.end.split(':').map(Number); // Not used for strictly fixed start check
    
    const reqStart = startH * 60 + startM;
    const reqEnd = reqStart + durationMins;

    for (const b of bookings) {
        const [bH, bM] = b.time.split(':').map(Number);
        const bStart = bH * 60 + bM;
        const bDuration = Number(b.duration) || 60;
        const bEnd = bStart + bDuration;

        // Check overlap
        if (reqStart < bEnd && reqEnd > bStart) {
            return false; // Collision
        }
    }
    return true;
}
