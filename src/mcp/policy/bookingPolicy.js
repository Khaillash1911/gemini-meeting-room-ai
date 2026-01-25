
export const POLICY = {
  officeHours: { start: "09:00", end: "18:00" },
  minDurationMins: 15,
  maxDurationMins: 120,
};

export function validateGeminiOutput(rec) {
  const errors = [];

  if (!rec || typeof rec !== "object") errors.push("No recommendation object");

  if (!rec.meeting_type || typeof rec.meeting_type !== "string") {
    errors.push("meeting_type missing/invalid");
  }

  if (!Number.isInteger(rec.recommended_duration_mins)) {
    errors.push("recommended_duration_mins must be an integer");
  } else {
    const d = rec.recommended_duration_mins;
    if (d < POLICY.minDurationMins || d > POLICY.maxDurationMins) {
      errors.push(`duration out of range (${POLICY.minDurationMins}-${POLICY.maxDurationMins})`);
    }
  }

  const tw = rec.preferred_time_window;
  if (!tw || typeof tw !== "object") errors.push("preferred_time_window missing");
  if (!tw?.start || !tw?.end) errors.push("preferred_time_window.start/end required");
  if (typeof tw?.start !== "string" || typeof tw?.end !== "string") {
    errors.push("preferred_time_window.start/end must be strings");
  }

  if (typeof rec.confidence !== "number" || rec.confidence < 0 || rec.confidence > 1) {
    errors.push("confidence must be a number between 0 and 1");
  }

  if (!rec.explanation || typeof rec.explanation !== "string") {
    errors.push("explanation missing/invalid");
  }

  return errors;
}
