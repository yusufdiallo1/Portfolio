import { NextResponse } from "next/server";

import { contactFormSchema } from "@/lib/contact-schema";
import { contactConfirmation, newContactNotification } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, message } = parsed.data;

  try {
    const supabase = createServiceClient();

    const { error: insertError } = await supabase.from("contact_messages").insert({
      name,
      email,
      message,
    });
    if (insertError) {
      console.error("contact_messages insert:", insertError);
      return NextResponse.json({ error: "Could not save message. Try again." }, { status: 500 });
    }

    const ownerEmail = process.env.NOTIFICATION_EMAIL ?? "yusufdiallo11@gmail.com";
    await Promise.allSettled([
      sendEmail({
        to: ownerEmail,
        subject: `New contact message from ${name}`,
        html: newContactNotification(name, email, message),
      }),
      sendEmail({
        to: email,
        subject: "I received your message",
        html: contactConfirmation(name),
      }),
    ]);

    // Fire analytics event (best-effort)
    void Promise.resolve(
      supabase.from("analytics").insert({
        event: "contact_message",
        metadata: { name, email },
        ip_hash: null,
      })
    ).catch(() => {});
  } catch (e) {
    console.error("contact POST:", e);
    return NextResponse.json({ error: "Could not save message. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
