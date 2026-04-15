/**
 * AI Script Generation Service
 *
 * Uses the Anthropic Messages API to generate video scripts.
 * Requires an API key set via environment variable VITE_ANTHROPIC_API_KEY.
 *
 * If no key is configured, the app falls back to a demo placeholder
 * so you can still test the teleprompter features.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

export async function generateScript({ topic, platform, duration, tone, language }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No API key found. Set VITE_ANTHROPIC_API_KEY in your .env file. See README for details."
    );
  }

  const wordRange =
    duration === "1-2 min" ? "200-350" :
    duration === "3-5 min" ? "500-900" :
    duration === "5-10 min" ? "900-1800" : "1800+";

  const langInstructions =
    language === "hinglish" ? "Hinglish (Hindi + English mixed)" :
    language === "hindi" ? "Hindi" : "English";

  const systemPrompt = `You are a viral content script writer. Write scripts that are natural, conversational, and optimized for ${platform}.
Rules:
- Write in ${langInstructions}
- Tone: ${tone}
- Target duration: ${duration} (approx ${wordRange} words)
- Include hooks, transitions, and a strong CTA
- Format as plain flowing text — no headers or markdown
- Add natural pauses marked with "..."
- Include engagement hooks like questions to the audience
- Make it sound like a real person talking, NOT robotic
- Research trending angles on this topic and incorporate them`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Write a ${platform} video script about: "${topic}"\n\nMake it trending, engaging, and thumb-stopping. Start with a powerful hook in the first line.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  if (!text.trim()) throw new Error("Empty response from AI");

  return text.trim();
}
