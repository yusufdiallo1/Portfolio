import { NextResponse } from "next/server";
import { z } from "zod";

import { sendEmail } from "@/lib/email";
import { dashboardReply } from "@/lib/email-templates";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { createServiceClient } from "@/lib/supabase";

const schema = z.object({
  toEmail: z.string().email(),
  toName: z.string().min(1),
  subject: z.string().min(1),
  message: z.string().min(1),
  recordType: z.enum(["contact", "hire"]),
  recordId: z.string().uuid(),
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { toEmail, toName, subject, message, recordType, recordId } = parsed.data;

  try {
    await sendEmail({
      to: toEmail,
      subject,
      html: dashboardReply(toEmail, toName, message),
    });

    const supabase = createServiceClient();
    if (recordType === "contact") {
      await supabase.from("contact_messages").update({ replied: true }).eq("id", recordId);
    } else {
      await supabase.from("hire_requests").update({ replied: true }).eq("id", recordId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[dashboard/reply] POST", e);
    return NextResponse.json({ error: "Could not send email." }, { status: 500 });
  }
}

