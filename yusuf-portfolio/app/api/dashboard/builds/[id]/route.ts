import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  props: { params: { id: string } }
) {
  try {
    const { id } = props.params;
    const body = await req.json() as Record<string, unknown>;

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("current_builds")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[dashboard/builds/[id]] PATCH error:", error);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[dashboard/builds/[id]] PATCH unexpected:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  props: { params: { id: string } }
) {
  try {
    const { id } = props.params;
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("current_builds")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[dashboard/builds/[id]] DELETE error:", error);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[dashboard/builds/[id]] DELETE unexpected:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
