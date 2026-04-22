import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { SITE_CONFIG_KEYS } from "@/lib/site-config";
import { createServiceClient } from "@/lib/supabase";

const bodySchema = z.object({
  availability_visible: z.boolean(),
  availability_status: z.enum(["available", "busy", "unavailable"]),
  availability_message: z.string(),
  calendly_url: z.string(),
});

export async function PATCH(req: Request) {
  const denied = await requireDashboardSession(req);
  if (denied) return denied;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const rows: { key: string; value: string; updated_at: string }[] = [
    { key: SITE_CONFIG_KEYS.visible, value: d.availability_visible ? "true" : "false", updated_at: new Date().toISOString() },
    { key: SITE_CONFIG_KEYS.status, value: d.availability_status, updated_at: new Date().toISOString() },
    { key: SITE_CONFIG_KEYS.message, value: d.availability_message.trim(), updated_at: new Date().toISOString() },
    { key: SITE_CONFIG_KEYS.calendly, value: d.calendly_url.trim(), updated_at: new Date().toISOString() },
  ];

  try {
    const supabase = createServiceClient();
    for (const row of rows) {
      const { error } = await supabase.from("site_config").upsert(row, { onConflict: "key" });
      if (error) {
        console.error("[site-config]", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
