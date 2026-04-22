import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  url: z.string().min(1).optional(),
  image_url: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireDashboardSession(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("projects").update(parsed.data).eq("id", params.id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireDashboardSession(_req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("projects").delete().eq("id", params.id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
