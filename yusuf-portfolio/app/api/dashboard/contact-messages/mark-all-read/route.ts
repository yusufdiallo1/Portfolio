import { NextResponse } from "next/server";

import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const denied = await requireDashboardSession(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("contact_messages").update({ read: true }).eq("read", false);

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
