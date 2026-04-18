import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/* ── shared ─────────────────────────────────────────────── */

const BG = "#0a0a0f";
const CARD_BG = "#111118";
const BORDER = "#1e1e2a";
const RED = "#ff2a2a";
const TEXT = "#e0e0e8";
const TEXT_DIM = "#8888a0";
const FONT = "Arial, Helvetica, sans-serif";

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT};-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD_BG};border-radius:16px;border:1px solid ${BORDER};padding:40px 32px;">
        <tr><td align="center" style="padding-bottom:28px;">
          <img src="https://logflix.app/logo.png" alt="Logflix" width="120" height="36" style="display:block;margin:0 auto;" />
        </td></tr>
        ${body}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<tr><td align="center" style="padding-bottom:24px;">
  <a href="${href}" style="display:inline-block;background:${RED};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
    ${text}
  </a>
</td></tr>`;
}

function footer(text: string, extra?: string): string {
  return `<tr><td align="center" style="border-top:1px solid ${BORDER};padding-top:20px;color:${TEXT_DIM};font-size:11px;line-height:1.6;">
  ${text}${extra ? `<br>${extra}` : ""}
</td></tr>`;
}

/* ── 1. Welcome ─────────────────────────────────────────── */

export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping welcome email");
    return;
  }

  const greeting = name ? `Hei, ${name}!` : "Hei!";

  try {
    await resend.emails.send({
      from: "Logflix <hei@logflix.app>",
      to: email,
      subject: "Velkommen til Logflix \uD83C\uDFAC",
      html: wrap(`
        <tr><td align="center" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">${greeting}</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:16px;color:${TEXT};line-height:1.5;">Du er nå klar til å finne noe å se.</p>
        </td></tr>
        <tr><td style="padding-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;color:${TEXT};font-size:14px;line-height:1.6;">
              \uD83C\uDCCF&nbsp;&nbsp;<strong style="color:#fff;">Se Sammen</strong> — sveip og match med noen
            </td></tr>
            <tr><td style="padding:10px 0;color:${TEXT};font-size:14px;line-height:1.6;border-top:1px solid ${BORDER};">
              \uD83E\uDD16&nbsp;&nbsp;<strong style="color:#fff;">AI-anbefalinger</strong> — basert på din smak
            </td></tr>
            <tr><td style="padding:10px 0;color:${TEXT};font-size:14px;line-height:1.6;border-top:1px solid ${BORDER};">
              \uD83D\uDCDA&nbsp;&nbsp;<strong style="color:#fff;">Logg filmer</strong> — bygg biblioteket ditt
            </td></tr>
          </table>
        </td></tr>
        ${ctaButton("Start Se Sammen", "https://logflix.app/together")}
        <tr><td align="center" style="padding-bottom:20px;">
          <p style="margin:0;font-size:12px;color:${TEXT_DIM};font-style:italic;">Tips: inviter noen og prøv Se Sammen i kveld</p>
        </td></tr>
        ${footer("Du mottar denne e-posten fordi du registrerte deg på logflix.app")}
      `),
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

