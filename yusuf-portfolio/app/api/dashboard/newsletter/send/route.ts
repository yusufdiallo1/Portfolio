import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { subject, body, previewText } = await req.json() as {
      subject: string;
      body: string;
      previewText?: string;
    };

    if (!subject || !body) {
      return NextResponse.json({ ok: false, error: "subject and body are required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: subscribers, error } = await supabase
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("confirmed", true);

    if (error) {
      console.error("[newsletter/send] fetch subscribers error:", error);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    if (!subscribers?.length) {
      return NextResponse.json({ ok: true, sent: 0, message: "No confirmed subscribers" });
    }

    const html = `<div style="font-family:monospace;max-width:600px;margin:0 auto;color:#fff;background:#000;padding:32px;border-radius:12px;">${
      previewText ? `<p style="color:#888;font-size:12px;margin-bottom:24px;">${previewText}</p>` : ""
    }<div>${body}</div><hr style="border-color:#333;margin:32px 0;"/><p style="color:#666;font-size:11px;">Unsubscribe anytime · Powered by Resend</p></div>`;
    await Promise.allSettled(
      subscribers.map((s) =>
        sendEmail({
          to: String(s.email),
          subject,
          html,
        })
      )
    );

    return NextResponse.json({ ok: true, sent: subscribers.length });
  } catch (err) {
    console.error("[newsletter/send] unexpected:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
