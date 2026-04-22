import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("current_builds")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[dashboard/builds] GET error:", error);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[dashboard/builds] unexpected:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      title: string;
      description?: string;
      progress?: number;
      tech_stack?: string[];
      status?: string;
      emoji?: string;
      sort_order?: number;
      visible?: boolean;
    };

    if (!body.title) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("current_builds")
      .insert({
        title: body.title,
        description: body.description ?? null,
        progress: body.progress ?? 0,
        tech_stack: body.tech_stack ?? [],
        status: body.status ?? "building",
        emoji: body.emoji ?? "🔨",
        sort_order: body.sort_order ?? 0,
        visible: body.visible ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("[dashboard/builds] POST error:", error);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[dashboard/builds] POST unexpected:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
