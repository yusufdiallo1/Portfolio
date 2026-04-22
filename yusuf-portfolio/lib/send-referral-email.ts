import { Resend } from "resend";

type ReferralPayload = {
  referrerName: string;
  referrerEmail: string;
  referredName: string;
  referredEmail: string;
  message: string | null;
  id: string;
};

const safe = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[referral] RESEND_API_KEY not set — email skipped");
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Sends an internal notification when a referral is submitted. Fails silently if Resend is not configured.
 */
export async function sendReferralNotificationEmail(data: ReferralPayload): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const to = process.env.NOTIFICATION_EMAIL ?? "yusufdiallo11@gmail.com";
  const from = process.env.RESEND_FROM ?? "YusufCreates <onboarding@resend.dev>";

  const bodyMsg = data.message?.trim()
    ? `<p><strong>Message</strong></p><p style="white-space:pre-wrap">${safe(data.message)}</p>`
    : "<p><em>No message provided.</em></p>";

  const html = `
    <h1>New referral</h1>
    <p><strong>Ref ID:</strong> ${safe(data.id)}</p>
    <hr />
    <p><strong>Referrer</strong></p>
    <p>${safe(data.referrerName)} &lt;${safe(data.referrerEmail)}&gt;</p>
    <p><strong>Referred</strong></p>
    <p>${safe(data.referredName)} &lt;${safe(data.referredEmail)}&gt;</p>
    ${bodyMsg}
  `;

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: `New referral — ${data.referredName}`,
    html,
  });

  if (error) {
    console.error("[referral] internal Resend error:", error);
  }
}

/**
 * Sends a confirmation email back to the referrer.
 */
export async function sendReferralReferrerConfirmationEmail(data: ReferralPayload): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const from = process.env.RESEND_FROM ?? "YusufCreates <onboarding@resend.dev>";

  const html = `
    <h1>Thanks for your referral, ${safe(data.referrerName)}!</h1>
    <p>I got your referral for <strong>${safe(data.referredName)}</strong> and I will reach out shortly.</p>
    <p><strong>Referral ID:</strong> ${safe(data.id)}</p>
    <hr />
    <p><strong>What you referred:</strong></p>
    <p>${safe(data.referredName)} &lt;${safe(data.referredEmail)}&gt;</p>
    ${data.message?.trim() ? `<p><strong>Your note:</strong> ${safe(data.message)}</p>` : ""}
    <p style="margin-top:16px">You are awesome — I appreciate the trust.</p>
    <p>— Yusuf</p>
  `;

  const { error } = await resend.emails.send({
    from,
    to: [data.referrerEmail],
    subject: "Referral received — thank you",
    html,
  });

  if (error) {
    console.error("[referral] referrer confirmation Resend error:", error);
  }
}
