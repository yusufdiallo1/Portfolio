import { NextResponse } from "next/server";

import { hireConfirmation, newHireRequestNotification } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { hireFormSchema } from "@/lib/hire-schema";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = hireFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const prefsBlock = [
    "",
    "--- Client preferences ---",
    `Deploy: ${data.deployTarget}`,
    `Theme: ${data.themePreference}`,
    `Color accents: ${data.colorAccents.join(", ")}`,
  ].join("\n");

  try {
    const supabase = createServiceClient();

    const { error: insertError } = await supabase.from("hire_requests").insert({
      name: data.name,
      email: data.email,
      project_type: data.projectType,
      budget: data.budget,
      timeline: data.timeline,
      tech_stack: data.techPreferences,
      description: `${data.description}\n${prefsBlock}`,
    });
    if (insertError) {
      console.error("hire_requests insert:", insertError);
      return NextResponse.json({ error: "Could not save request. Try again." }, { status: 500 });
    }

    const ownerEmail = process.env.NOTIFICATION_EMAIL ?? "yusufdiallo11@gmail.com";
    await Promise.allSettled([
      sendEmail({
        to: ownerEmail,
        subject: `New hire request from ${data.name}`,
        html: newHireRequestNotification(
          data.name,
          data.email,
          data.projectType,
          data.budget,
          `${data.description}\n${prefsBlock}`
        ),
      }),
      sendEmail({
        to: data.email,
        subject: "Your request was received",
        html: hireConfirmation(data.name, data.projectType),
      }),
    ]);

    void Promise.resolve(
      supabase.from("analytics").insert({
        event: "hire_request",
        metadata: { project_type: data.projectType, budget: data.budget },
        ip_hash: null,
      })
    ).catch(() => {});
  } catch (e) {
    console.error("hire POST:", e);
    return NextResponse.json({ error: "Could not save request. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
