const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yusufdiallo.dev";

function esc(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout({ title, bodyHtml, ctaLabel, ctaUrl }: { title: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string }) {
  const cta =
    ctaLabel && ctaUrl
      ? `<a href="${esc(ctaUrl)}" style="display:inline-block;margin-top:20px;padding:10px 16px;border-radius:10px;background:#61dafb;color:#000;text-decoration:none;font-weight:600;">${esc(
          ctaLabel
        )}</a>`
      : "";

  return `
  <div style="margin:0;padding:24px;background:#000;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system;">
    <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.14);border-radius:16px;background:rgba(255,255,255,0.04);padding:24px;box-shadow:0 0 0 1px rgba(255,255,255,0.03) inset;">
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;font-weight:600;">${esc(title)}</h1>
      <div style="font-size:14px;line-height:1.65;color:rgba(255,255,255,0.88);">${bodyHtml}</div>
      ${cta}
      <p style="margin-top:24px;font-size:12px;color:rgba(255,255,255,0.52);">YusufCreates · Automated notification</p>
    </div>
  </div>
  `;
}

export function newContactNotification(name: string, email: string, message: string) {
  const body = `
    <p><strong>New contact submission.</strong></p>
    <p><strong>Name:</strong> ${esc(name)}</p>
    <p><strong>Email:</strong> ${esc(email)}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;background:rgba(255,255,255,0.03);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);color:#fff;">${esc(
      message
    )}</pre>
  `;
  return layout({
    title: "New Contact Message",
    bodyHtml: body,
    ctaLabel: "Reply in Dashboard →",
    ctaUrl: `${SITE_URL}/dashboard/contacts?tab=messages`,
  });
}

export function newHireRequestNotification(
  name: string,
  email: string,
  projectType: string,
  budget: string,
  description: string
) {
  const body = `
    <p><strong>New hire request submitted.</strong></p>
    <p><strong>Name:</strong> ${esc(name)}</p>
    <p><strong>Email:</strong> ${esc(email)}</p>
    <p><strong>Project type:</strong> ${esc(projectType)}</p>
    <p><strong>Budget:</strong> ${esc(budget)}</p>
    <p><strong>Description:</strong></p>
    <pre style="white-space:pre-wrap;background:rgba(255,255,255,0.03);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);color:#fff;">${esc(
      description
    )}</pre>
  `;
  return layout({
    title: "New Hire Request",
    bodyHtml: body,
    ctaLabel: "View Request →",
    ctaUrl: `${SITE_URL}/dashboard/contacts?tab=hires`,
  });
}

export function contactConfirmation(name: string) {
  const body = `<p>Thanks ${esc(
    name
  )}, I received your message and will respond within 24 hours.</p><p>— Yusuf</p>`;
  return layout({ title: "Message received", bodyHtml: body });
}

export function hireConfirmation(name: string, projectType: string) {
  const body = `<p>Thanks ${esc(name)}, I've received your ${esc(
    projectType
  )} request and will respond within 24 hours with a proposal.</p><p>— Yusuf</p>`;
  return layout({ title: "Hire request received", bodyHtml: body });
}

export function newsletterWelcome(email: string) {
  const body = `<p>Welcome to the YusufCreates newsletter.</p><p>Subscribed as: <strong>${esc(
    email
  )}</strong></p><p>You will get build updates, case studies, and practical dev notes.</p>`;
  return layout({ title: "Welcome aboard", bodyHtml: body });
}

export function dashboardReply(toEmail: string, toName: string, replyMessage: string) {
  const body = `
    <p>Hi ${esc(toName)},</p>
    <div style="white-space:pre-wrap">${esc(replyMessage)}</div>
    <p style="margin-top:18px;color:rgba(255,255,255,0.7);font-size:12px;">Sent to ${esc(toEmail)}</p>
  `;
  return layout({ title: "Reply from Yusuf Diallo", bodyHtml: body });
}

export function newReferralNotification(
  referrerName: string,
  referrerEmail: string,
  referredName: string,
  referredEmail: string,
  message?: string
) {
  const body = `
    <p><strong>New referral submitted.</strong></p>
    <p><strong>Referrer:</strong> ${esc(referrerName)} (${esc(referrerEmail)})</p>
    <p><strong>Referred:</strong> ${esc(referredName)} (${esc(referredEmail)})</p>
    <p><strong>Message:</strong> ${message ? esc(message) : "<em>None</em>"}</p>
  `;
  return layout({
    title: "New Referral",
    bodyHtml: body,
    ctaLabel: "Open Referrals →",
    ctaUrl: `${SITE_URL}/dashboard/referrals`,
  });
}

