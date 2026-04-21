import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  DASHBOARD_SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  signDashboardToken,
} from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

type LoginBody = {
  step?: "id" | "password";
  adminId?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    let body: LoginBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const step = body.step;
    const adminId = typeof body.adminId === "string" ? body.adminId.trim() : "";

    if (step === "id") {
      if (!adminId) {
        return NextResponse.json({ error: "Admin ID required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("admin_credentials")
        .select("id")
        .eq("admin_id", adminId)
        .maybeSingle();

      if (error) {
        console.error("[login id]", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      if (!data) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 401 });
      }

      return NextResponse.json({ ok: true, step: "password" });
    }

    if (step === "password") {
      const password = typeof body.password === "string" ? body.password : "";
      if (!adminId || !password) {
        return NextResponse.json({ error: "Admin ID and password required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("admin_credentials")
        .select("password_hash")
        .eq("admin_id", adminId)
        .maybeSingle();

      if (error) {
        console.error("[login password]", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      if (!data?.password_hash) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 401 });
      }

      const match = await bcrypt.compare(password, data.password_hash);
      if (!match) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }

      const token = await signDashboardToken(adminId);
      const res = NextResponse.json({ ok: true });
      res.cookies.set(DASHBOARD_SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
      return res;
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (e) {
    console.error("[login]", e);
    if (e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
