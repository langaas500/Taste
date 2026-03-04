import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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
      subject: "Velkommen til Logflix 🎬",
      html: `
<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f1428;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1428;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1f3d;border-radius:12px;padding:40px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <span style="font-size:28px;font-weight:bold;color:#ff2a2a;letter-spacing:1px;">LOGFLIX</span>
        </td></tr>
        <tr><td align="center" style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;">${greeting}</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:8px;">
          <h2 style="margin:0;font-size:18px;color:#ffffff;font-weight:normal;">Velkommen til Logflix</h2>
        </td></tr>
        <tr><td style="padding-bottom:32px;color:#c0c4d8;font-size:15px;line-height:1.6;text-align:center;">
          Du er nå klar til å finne filmer og serier du elsker.<br><br>
          Start med å prøve <strong style="color:#ffffff;">Se Sammen</strong> — sveip deg frem til enighet med noen du vil se med.
        </td></tr>
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="https://logflix.app/together"
             style="display:inline-block;background:#ff2a2a;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;">
            Gå til Se Sammen
          </a>
        </td></tr>
        <tr><td align="center" style="border-top:1px solid #2a2f4d;padding-top:20px;color:#6b7094;font-size:12px;">
          Du mottar denne e-posten fordi du registrerte deg på logflix.app
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

export async function sendMatchReminderEmail(
  email: string,
  title: string,
  type: "movie" | "tv"
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping match reminder email");
    return;
  }

  const searchUrl = `https://www.justwatch.com/no/search?q=${encodeURIComponent(title)}`;

  try {
    await resend.emails.send({
      from: "Logflix <hei@logflix.app>",
      to: email,
      subject: `Dere skal se ${title} i kveld 🎬`,
      html: `
<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f1428;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1428;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1f3d;border-radius:12px;padding:40px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <span style="font-size:28px;font-weight:bold;color:#ff2a2a;letter-spacing:1px;">LOGFLIX</span>
        </td></tr>
        <tr><td align="center" style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;">Ikke glem å se den i kveld!</h1>
        </td></tr>
        <tr><td style="padding-bottom:32px;color:#c0c4d8;font-size:15px;line-height:1.6;text-align:center;">
          Dere matchet på <strong style="color:#ffffff;">${title}</strong>.<br><br>
          Sett deg ned, finn fjernkontrollen, og trykk play.
        </td></tr>
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="${searchUrl}"
             style="display:inline-block;background:#ff2a2a;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;">
            Finn ${title}
          </a>
        </td></tr>
        <tr><td align="center" style="border-top:1px solid #2a2f4d;padding-top:20px;color:#6b7094;font-size:12px;">
          Du ba om denne påminnelsen på logflix.app
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
    });
  } catch (err) {
    console.error("Failed to send match reminder email:", err);
  }
}

export async function sendWeeklyDigestEmail(email: string): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping weekly digest email");
    return;
  }

  try {
    await resend.emails.send({
      from: "Logflix <hei@logflix.app>",
      to: email,
      subject: "🎬 Hva skal dere se i helgen?",
      html: `
<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f1428;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1428;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1f3d;border-radius:12px;padding:40px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <span style="font-size:28px;font-weight:bold;color:#ff2a2a;letter-spacing:1px;">LOGFLIX</span>
        </td></tr>
        <tr><td align="center" style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;">Helgen nærmer seg</h1>
        </td></tr>
        <tr><td style="padding-bottom:32px;color:#c0c4d8;font-size:15px;line-height:1.6;text-align:center;">
          Finn noe å se sammen. Åpne Se Sammen og sveip dere frem til enighet — det tar bare noen minutter.
        </td></tr>
        <tr><td align="center" style="padding-bottom:16px;">
          <a href="https://logflix.app/together"
             style="display:inline-block;background:#ff2a2a;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;">
            Start Se Sammen
          </a>
        </td></tr>
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="https://logflix.app/home"
             style="color:#ff2a2a;font-size:14px;text-decoration:underline;">
            Se anbefalinger
          </a>
        </td></tr>
        <tr><td align="center" style="border-top:1px solid #2a2f4d;padding-top:20px;color:#6b7094;font-size:12px;">
          Du mottar denne e-posten fordi du er registrert på logflix.app.<br>
          <a href="https://logflix.app/settings" style="color:#6b7094;text-decoration:underline;">Endre e-postinnstillinger</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
    });
  } catch (err) {
    console.error("Failed to send weekly digest email:", err);
  }
}
