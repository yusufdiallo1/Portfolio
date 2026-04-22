import { NextResponse } from "next/server";
import { z } from "zod";

import { sendEmail } from "@/lib/email";
import { newsletterWelcome } from "@/lib/email-templates";
import { createServiceClient } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const { email, name } = parsed.data;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, name: name ?? null });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error("[newsletter] insert error:", error);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    await Promise.allSettled([
      sendEmail({
        to: email,
        subject: "Welcome to YusufCreates newsletter",
        html: newsletterWelcome(email),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] unexpected error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
