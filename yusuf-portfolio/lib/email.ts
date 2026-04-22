import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error("RESEND_API_KEY or RESEND_FROM_EMAIL is missing");
  }

  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}

