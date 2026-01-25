import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getGeminiRecommendation(context) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "MISSING_GEMINI_API_KEY" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview", 
    generationConfig: { responseMimeType: "application/json" } 
  });

  const schemaHint = {
    meeting_type: "string",
    meeting_date: "YYYY-MM-DD",
    recommended_duration_mins: "integer",
    preferred_time_window: { start: "HH:MM", end: "HH:MM" },
    confidence: "number 0..1",
    explanation: "string",
  };

  const prompt = `
You are the Model layer in an MCP system.
Return ONLY a strict JSON object.
The JSON must match this schema exactly (no extra keys):
${JSON.stringify(schemaHint)}

Context:
${JSON.stringify(context)}

Requirements:
- preferred_time_window.start/end must be in 24h HH:MM format
- meeting_date must be YYYY-MM-DD. Infer relative dates (e.g. "tomorrow", "next Friday") based on the "date" provided in Context.
- recommended_duration_mins must be a whole number
- confidence must be between 0 and 1
- explanation must be natural and helpful, like "I found a great room for you." Avoid technical details about extraction.
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Clean up markdown if present (e.g. ```json ... ```)
    text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "GEMINI_RETURNED_NON_JSON", raw: text };
    }

    return { ok: true, data: parsed, raw: text };
  } catch (e) {
    return { ok: false, error: "GEMINI_CALL_FAILED", details: String(e) };
  }
}
