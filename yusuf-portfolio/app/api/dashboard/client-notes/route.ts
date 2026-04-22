import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

const postSchema = z.object({
  hire_request_id: z.string().uuid(),
  note: z.string().min(1).max(4000),
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

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("client_notes")
      .insert({ hire_request_id: parsed.data.hire_request_id, note: parsed.data.note })
      .select("id, note, created_at")
      .single();

    if (error) {
      console.error("client_notes insert:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, note: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
