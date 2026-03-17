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
          <span style="font-size:24px;font-weight:800;color:${RED};letter-spacing:2px;">LOGFLIX</span>
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

/* ── 2. Match Reminder ──────────────────────────────────── */

export async function sendMatchReminderEmail(
  email: string,
  title: string,
  type: "movie" | "tv"
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping match reminder email");
    return;
  }

  const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const titleUrl = `https://logflix.app/no/${type}/${slug}`;

  try {
    await resend.emails.send({
      from: "Logflix <hei@logflix.app>",
      to: email,
      subject: `Dere matchet på ${title}! \uD83C\uDF89`,
      html: wrap(`
        <tr><td align="center" style="padding-bottom:12px;">
          <p style="margin:0;font-size:13px;font-weight:600;color:${RED};letter-spacing:1.5px;text-transform:uppercase;">Det er en match!</p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:12px;">
          <h1 style="margin:0;font-size:26px;color:#ffffff;font-weight:700;">${title}</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:28px;">
          <p style="margin:0;font-size:15px;color:${TEXT};line-height:1.6;">Nå gjenstår bare én ting — finn ut hvor dere kan se den.</p>
        </td></tr>
        ${ctaButton("Finn hvor du kan streame", titleUrl)}
        <tr><td align="center" style="padding-bottom:20px;">
          <a href="https://logflix.app/together" style="color:${RED};font-size:13px;text-decoration:underline;">Prøv Se Sammen igjen</a>
        </td></tr>
        ${footer("Du ba om denne påminnelsen på logflix.app")}
      `),
    });
  } catch (err) {
    console.error("Failed to send match reminder email:", err);
  }
}

/* ── 3. Friday Pick ────────────────────────────────────── */

const fridayStrings: Record<string, {
  subject: string;
  heading: (partner: string) => string;
  movieLabel: string;
  seriesLabel: string;
  cta: string;
  footer: string;
}> = {
  no: {
    subject: "🍿 Fredagsfilmen deres er klar",
    heading: (p) => `Tonight's Pick for deg & ${p}`,
    movieLabel: "Film i kveld",
    seriesLabel: "Serie i kveld",
    cta: "Start Se Sammen",
    footer: "Du mottar denne fordi du har en koblet partner på logflix.app.",
  },
  en: {
    subject: "🍿 Your Friday pick is ready",
    heading: (p) => `Tonight's Pick for you & ${p}`,
    movieLabel: "Movie tonight",
    seriesLabel: "Series tonight",
    cta: "Start Watch Together",
    footer: "You're receiving this because you have a linked partner on logflix.app.",
  },
  dk: {
    subject: "🍿 Jeres fredagsfilm er klar",
    heading: (p) => `Tonight's Pick for dig & ${p}`,
    movieLabel: "Film i aften",
    seriesLabel: "Serie i aften",
    cta: "Start Se Sammen",
    footer: "Du modtager denne fordi du har en forbundet partner på logflix.app.",
  },
  se: {
    subject: "🍿 Er fredagsfilm är redo",
    heading: (p) => `Tonight's Pick för dig & ${p}`,
    movieLabel: "Film ikväll",
    seriesLabel: "Serie ikväll",
    cta: "Starta Se Tillsammans",
    footer: "Du får detta för att du har en kopplad partner på logflix.app.",
  },
  fi: {
    subject: "🍿 Perjantain elokuvavalintanne on valmis",
    heading: (p) => `Tonight's Pick sinulle & ${p}`,
    movieLabel: "Elokuva tänään",
    seriesLabel: "Sarja tänään",
    cta: "Aloita Katsotaan Yhdessä",
    footer: "Saat tämän koska sinulla on yhdistetty kumppani logflix.app-sivustolla.",
  },
};

function posterCard(label: string, title: string, posterUrl: string): string {
  return `<td width="50%" valign="top" style="padding:0 4px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
      <tr><td style="padding:12px 12px 6px;">
        <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_DIM};">${label}</p>
      </td></tr>
      <tr><td align="center" style="padding:0 12px;">
        <img src="${posterUrl}" alt="${title}" width="120" style="border-radius:8px;display:block;max-width:100%;" />
      </td></tr>
      <tr><td style="padding:8px 12px 12px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;line-height:1.3;">${title}</p>
      </td></tr>
    </table>
  </td>`;
}

export async function sendFridayPickEmail(
  email: string,
  partnerName: string,
  movieTitle: string,
  seriesTitle: string,
  moviePoster: string,
  seriesPoster: string,
  locale: string,
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping friday pick email");
    return;
  }

  const t = fridayStrings[locale] || fridayStrings.en;
  const moviePosterUrl = moviePoster ? `https://image.tmdb.org/t/p/w300${moviePoster}` : "";
  const seriesPosterUrl = seriesPoster ? `https://image.tmdb.org/t/p/w300${seriesPoster}` : "";

  let cardsHtml = "";
  if (movieTitle || seriesTitle) {
    cardsHtml = `<tr><td style="padding-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        ${movieTitle ? posterCard(`🎬 ${t.movieLabel}`, movieTitle, moviePosterUrl) : ""}
        ${seriesTitle ? posterCard(`📺 ${t.seriesLabel}`, seriesTitle, seriesPosterUrl) : ""}
      </tr></table>
    </td></tr>`;
  }

  try {
    await resend.emails.send({
      from: "Logflix <hei@logflix.app>",
      to: email,
      subject: t.subject,
      html: wrap(`
        <tr><td align="center" style="padding-bottom:8px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:${RED};letter-spacing:1.5px;text-transform:uppercase;">FRIDAY MOVIE NIGHT</p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">${t.heading(partnerName)}</h1>
        </td></tr>
        ${cardsHtml}
        ${ctaButton(t.cta, "https://logflix.app/together")}
        ${footer(
          t.footer,
          '<a href="https://logflix.app/settings" style="color:' + TEXT_DIM + ';text-decoration:underline;">Innstillinger</a>'
        )}
      `),
    });
  } catch (err) {
    console.error("Failed to send friday pick email:", err);
  }
}

/* ── 4. Weekly Digest ───────────────────────────────────── */

export async function sendWeeklyDigestEmail(
  email: string,
  name?: string,
  data?: {
    watchlistCount?: number;
    friendsActivity?: number;
    recommendations?: Array<{ title: string; reason: string }>;
  }
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping weekly digest email");
    return;
  }

  const greeting = name ? `Hei, ${name}! God helg.` : "Hei! God helg.";

  let dynamicRows = "";

  if (data?.watchlistCount && data.watchlistCount > 0) {
    dynamicRows += `<tr><td style="padding:10px 0;color:${TEXT};font-size:14px;line-height:1.6;">
      \uD83D\uDCCB&nbsp;&nbsp;Du har <strong style="color:#fff;">${data.watchlistCount} titler</strong> i watchlisten — kanskje en av dem i helgen?
    </td></tr>`;
  }

  if (data?.friendsActivity && data.friendsActivity > 0) {
    dynamicRows += `<tr><td style="padding:10px 0;color:${TEXT};font-size:14px;line-height:1.6;${dynamicRows ? `border-top:1px solid ${BORDER};` : ""}">
      \uD83D\uDC65&nbsp;&nbsp;Vennene dine logget <strong style="color:#fff;">${data.friendsActivity} nye filmer</strong> denne uken.
    </td></tr>`;
  }

  if (data?.recommendations && data.recommendations.length > 0) {
    const recs = data.recommendations.slice(0, 2);
    let recsHtml = `<tr><td style="padding:10px 0;color:${TEXT};font-size:14px;line-height:1.6;${dynamicRows ? `border-top:1px solid ${BORDER};` : ""}">
      \uD83C\uDFAF&nbsp;&nbsp;<strong style="color:#fff;">Basert på smaken din:</strong>
    </td></tr>`;
    for (const rec of recs) {
      recsHtml += `<tr><td style="padding:6px 0 6px 28px;color:${TEXT};font-size:13px;line-height:1.5;">
        <strong style="color:#fff;">${rec.title}</strong><br>
        <span style="color:${TEXT_DIM};font-size:12px;">${rec.reason}</span>
      </td></tr>`;
    }
    dynamicRows += recsHtml;
  }

  const hasDynamic = dynamicRows.length > 0;

  try {
    await resend.emails.send({
      from: "Logflix <hei@logflix.app>",
      to: email,
      subject: "God helg — hva skal dere se? \uD83C\uDF7F",
      html: wrap(`
        <tr><td align="center" style="padding-bottom:20px;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">${greeting}</h1>
        </td></tr>
        ${hasDynamic ? `<tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">${dynamicRows}</table>
        </td></tr>` : `<tr><td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:15px;color:${TEXT};line-height:1.6;">Finn noe å se sammen — åpne Se Sammen og sveip dere frem til enighet.</p>
        </td></tr>`}
        ${ctaButton("Start Se Sammen i helgen", "https://logflix.app/together")}
        ${footer(
          'Du mottar denne e-posten fordi du er registrert på logflix.app.',
          '<a href="https://logflix.app/settings" style="color:' + TEXT_DIM + ';text-decoration:underline;">Avslutt ukentlig digest</a>'
        )}
      `),
    });
  } catch (err) {
    console.error("Failed to send weekly digest email:", err);
  }
}
