import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

export async function requireDashboardSession(req: Request) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
