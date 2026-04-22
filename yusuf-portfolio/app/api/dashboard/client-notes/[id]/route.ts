import { NextResponse } from "next/server";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireDashboardSession(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("client_notes").delete().eq("id", params.id);

    if (error) {
      console.error("client_notes delete:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
