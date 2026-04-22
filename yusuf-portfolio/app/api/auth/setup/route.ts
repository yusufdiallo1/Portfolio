import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  DASHBOARD_SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  signDashboardToken,
} from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    const { count, error: countError } = await supabase
      .from("admin_credentials")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: "Already configured" }, { status: 403 });
    }

    let body: { adminId?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const adminId = typeof body.adminId === "string" ? body.adminId.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (adminId.length < 4) {
      return NextResponse.json({ error: "Admin ID must be at least 4 characters" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { error: insertError } = await supabase.from("admin_credentials").insert({
      admin_id: adminId,
      password_hash,
    });

    if (insertError) {
      console.error("[setup] insert error:", insertError.code, insertError.message);
      const msg =
        insertError.code === "23505"
          ? "Admin ID already taken. Choose a different one."
          : `Could not save credentials (${insertError.code ?? "unknown"})`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const token = await signDashboardToken(adminId);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(DASHBOARD_SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (e) {
    console.error("[setup]", e);
    if (e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
