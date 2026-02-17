// Server-only AI provider abstraction
// Uses AI_PROVIDER env var to select between Anthropic and OpenAI

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function callAI(messages: AIMessage[], temperature = 0.3): Promise<string> {
  const provider = process.env.AI_PROVIDER || "anthropic";

  if (provider === "anthropic") {
    return callAnthropic(messages, temperature);
  } else if (provider === "openai") {
    return callOpenAI(messages, temperature);
  }
  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}

async function callAnthropic(messages: AIMessage[], temperature: number): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");

  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const userMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      temperature,
      system: systemMsg,
      messages: userMessages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.content[0]?.text || "";
}

async function callOpenAI(messages: AIMessage[], temperature: number): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
}

/** Safe JSON.parse wrapper — never throws. */
export function safeParseJson<T>(
  raw: string
): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(stripMarkdownFences(raw)) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export interface TasteInput {
  liked: { title: string; type: string; genres: string[] }[];
  disliked: { title: string; type: string; genres: string[] }[];
  neutral: { title: string; type: string; genres: string[] }[];
  feedbackNotForMe: { title: string; type: string }[];
}

export async function generateTasteSummary(input: TasteInput): Promise<{
  youLike: string;
  avoid: string;
  pacing: string;
}> {
  const prompt = `Analyze this user's viewing taste and return a JSON object with exactly these keys:
- "youLike": 2-3 sentences about what they enjoy (themes, genres, tones, storytelling styles)
- "avoid": 1-2 sentences about what they dislike or avoid
- "pacing": 1-2 sentences about their preferred pacing, tone, and recurring themes

Liked titles: ${JSON.stringify(input.liked)}
Disliked titles: ${JSON.stringify(input.disliked)}
Neutral titles: ${JSON.stringify(input.neutral)}
Rejected recommendations: ${JSON.stringify(input.feedbackNotForMe)}

Return ONLY valid JSON, no markdown fences.`;

  const result = await callAI([
    { role: "system", content: "You are a film/TV taste analyst. Return only valid JSON." },
    { role: "user", content: prompt },
  ], 0.3);

  const parsed = safeParseJson<{ youLike: string; avoid: string; pacing: string }>(result);
  if (!parsed.ok) throw new Error(`AI returned invalid JSON: ${parsed.error}`);
  return parsed.data;
}

export async function explainRecommendations(
  userTaste: { youLike: string; avoid: string },
  titles: { title: string; type: string; year: number | null; overview: string; genres: string[] }[]
): Promise<{ title: string; why: string; tags: string[] }[]> {
  const prompt = `Given this user's taste:
Likes: ${userTaste.youLike}
Avoids: ${userTaste.avoid}

For each title below, write:
1. A 1-2 sentence "why" explanation of why this matches the user
2. Exactly 3 short tags (2-3 words each) that describe the title's appeal

Titles:
${titles.map((t, i) => `${i + 1}. "${t.title}" (${t.type}, ${t.year}) - ${t.overview?.slice(0, 150)}`).join("\n")}

Return a JSON array of objects with keys: "title", "why", "tags" (array of 3 strings).
Return ONLY valid JSON, no markdown fences.`;

  const result = await callAI([
    { role: "system", content: "You are a personalized recommendation explainer. Return only valid JSON array." },
    { role: "user", content: prompt },
  ], 0.3);

  const parsed = safeParseJson<{ title: string; why: string; tags: string[] }[]>(result);
  if (!parsed.ok) throw new Error(`AI returned invalid JSON: ${parsed.error}`);
  return parsed.data;
}

export async function testAIConnection(): Promise<{ ok: boolean; provider: string; error?: string }> {
  const provider = process.env.AI_PROVIDER || "anthropic";
  try {
    await callAI([
      { role: "system", content: "Reply with: ok" },
      { role: "user", content: "Test" },
    ], 0);
    return { ok: true, provider };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, provider, error: msg };
  }
}
