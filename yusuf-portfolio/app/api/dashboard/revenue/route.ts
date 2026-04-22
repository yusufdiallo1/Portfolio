import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

const postSchema = z.object({
  client_name: z.string().min(1),
  project_title: z.string().min(1),
  project_type: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  status: z.enum(["paid", "pending", "refunded"]).default("paid"),
  hire_request_id: z.string().uuid().optional().nullable(),
  completed_at: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  const denied = await requireDashboardSession(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("revenue_entries")
      .select("id, client_name, project_title, project_type, amount, currency, status, hire_request_id, completed_at, notes, created_at")
      .order("completed_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entries: data ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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
      .from("revenue_entries")
      .insert({
        client_name: parsed.data.client_name,
        project_title: parsed.data.project_title,
        project_type: parsed.data.project_type ?? null,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        status: parsed.data.status,
        hire_request_id: parsed.data.hire_request_id ?? null,
        completed_at: parsed.data.completed_at,
        notes: parsed.data.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("revenue_entries insert:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, entry: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
