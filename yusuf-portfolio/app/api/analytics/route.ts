import { createHash } from "crypto";
import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: { event?: string; metadata?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", body);
  }

  // Hash IP — never store raw address
  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ipHash = createHash("sha256").update(rawIp).digest("hex");

  try {
    const supabase = createServiceClient();
    await supabase.from("analytics").insert({
      event: typeof body.event === "string" ? body.event : "unknown",
      metadata: (body.metadata ?? {}) as object,
      ip_hash: ipHash,
    });
  } catch (e) {
    console.warn("[analytics] persist failed:", e);
  }

  return NextResponse.json({ ok: true });
}
