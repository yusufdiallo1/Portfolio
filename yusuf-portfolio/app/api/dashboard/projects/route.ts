import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  url: z.string().min(1),
  image_url: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
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
    const { data: last } = await supabase
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    const sort_order = (typeof last?.sort_order === "number" ? last.sort_order : 0) + 1;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        url: parsed.data.url,
        image_url: parsed.data.image_url ?? null,
        tags: parsed.data.tags.length ? parsed.data.tags : [],
        featured: parsed.data.featured,
        sort_order,
      })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
