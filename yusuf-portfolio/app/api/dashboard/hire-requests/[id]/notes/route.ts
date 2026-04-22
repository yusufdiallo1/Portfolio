import { NextResponse } from "next/server";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireDashboardSession(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("client_notes")
      .select("id, hire_request_id, note, created_at")
      .eq("hire_request_id", params.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notes: data ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
