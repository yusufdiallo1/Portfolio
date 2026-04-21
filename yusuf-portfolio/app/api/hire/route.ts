import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "Hire inquiry — implement handler." });
}
