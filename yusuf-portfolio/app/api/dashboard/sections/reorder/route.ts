import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

const schema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

export async function POST(req: Request) {
  const denied = await requireDashboardSession(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const updates = parsed.data.orderedIds.map((id, index) =>
      supabase.from("page_sections").update({ sort_order: index }).eq("id", id)
    );
    const results = await Promise.all(updates);
    const err = results.find((r) => r.error)?.error;
    if (err) {
      console.error(err);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
