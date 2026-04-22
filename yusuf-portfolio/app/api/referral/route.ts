import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { newReferralNotification } from "@/lib/email-templates";
import { referralSubmitSchema } from "@/lib/referral-schema";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = referralSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;

  try {
    const supabase = createServiceClient();
    const { data: row, error } = await supabase
      .from("referrals")
      .insert({
        referrer_name: d.referrerName,
        referrer_email: d.referrerEmail,
        referred_name: d.referredName,
        referred_email: d.referredEmail,
        message: d.message?.trim() || null,
      })
      .select("id")
      .single();

    if (error || !row?.id) {
      console.error("referrals insert:", error);
      return NextResponse.json({ error: "Could not save referral." }, { status: 500 });
    }

    const ownerEmail = process.env.NOTIFICATION_EMAIL ?? "yusufdiallo11@gmail.com";
    await Promise.allSettled([
      sendEmail({
        to: ownerEmail,
        subject: `New referral from ${d.referrerName}`,
        html: newReferralNotification(
          d.referrerName,
          d.referrerEmail,
          d.referredName,
          d.referredEmail,
          d.message
        ),
      }),
    ]);
  } catch (e) {
    console.error("POST /api/referral", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
