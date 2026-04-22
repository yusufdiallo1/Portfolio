import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Yusuf Diallo's portfolio assistant. You help visitors understand who Yusuf is and what he builds.

About Yusuf:
- Full Stack Developer who ships fast
- Uses: ClaudeCode (Anthropic's terminal coding agent), Cursor (AI code editor), Next.js, React, TypeScript, Tailwind CSS, Supabase, Git, API integrations
- Live apps: thecuratedroute.us (travel discovery), noteley.lovable.app (AI notes), firststepfinder.lovable.app (goal discovery)
- Pricing: Starter $499 (landing pages, 3 days), Pro $1,299 (web apps, 7 days), Elite $2,499 (SaaS platforms, 14 days)

You can explain what any technology means (e.g. 'What is Supabase?', 'What does ClaudeCode do?', 'What is Next.js?').
You can help visitors decide which pricing tier fits their project.
You can explain Yusuf's process and how he works.
You can tell visitors how to contact Yusuf or start a project.

Be concise, friendly, and developer-like in tone. Use code formatting when relevant.
Do NOT answer questions unrelated to Yusuf or web development. If off-topic, redirect politely.`;

type ChatRole = "user" | "assistant";

function sanitizeMessages(raw: unknown): { role: ChatRole; content: string }[] | null {
  if (!Array.isArray(raw)) return null;
  const out: { role: ChatRole; content: string }[] = [];
  for (const m of raw) {
    if (typeof m !== "object" || m === null) return null;
    const role = (m as { role?: string }).role;
    const content = (m as { content?: string }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > 16000) return null;
    out.push({ role, content: trimmed });
  }
  if (out.length === 0) return null;
  if (out.length > 40) return out.slice(-40);
  return out;
}

/** Default Llama on Groq; override with GROQ_MODEL if you prefer another Groq-supported model. */
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat is not configured. Set GROQ_API_KEY on the server." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = sanitizeMessages((body as { messages?: unknown }).messages);
  if (!messages) {
    return NextResponse.json(
      { error: "Expected messages: non-empty array of { role: 'user' | 'assistant', content: string }" },
      { status: 400 }
    );
  }

  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;

  const payload = {
    model,
    messages: [{ role: "system" as const, content: SYSTEM_PROMPT }, ...messages],
    stream: true,
    max_tokens: 600,
  };

  let upstream: Response;
  try {
    upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Groq fetch:", e);
    return NextResponse.json({ error: "Could not reach the AI service." }, { status: 502 });
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    console.error("Groq error:", upstream.status, errText.slice(0, 500));
    return NextResponse.json(
      { error: "The AI service returned an error.", detail: errText.slice(0, 200) },
      { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502 }
    );
  }

  if (!upstream.body) {
    return NextResponse.json({ error: "Empty response from AI service." }, { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
