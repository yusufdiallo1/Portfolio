import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

const createSchema = z.object({
  author_name: z.string().min(1),
  author_role: z.string().optional().nullable(),
  author_avatar: z.string().optional().nullable(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  approved: z.boolean().default(true),
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("testimonials").insert({
      author_name: parsed.data.author_name,
      author_role: parsed.data.author_role ?? null,
      author_avatar: parsed.data.author_avatar ?? null,
      content: parsed.data.content,
      rating: parsed.data.rating,
      approved: parsed.data.approved,
    });

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
