import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "Chat endpoint — implement with your AI provider." });
}
