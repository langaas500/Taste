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
  // TMDB blocks images loaded from email clients — show text-only card if no poster
  const hasImage = posterUrl && posterUrl.length > 10;
  const imageHtml = hasImage
    ? `<tr><td align="center" style="padding:0 12px;">
        <img src="${posterUrl}" alt="${title}" width="120" style="border-radius:8px;display:block;max-width:100%;" />
      </td></tr>`
    : "";
  return `<td width="50%" valign="top" style="padding:0 4px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
      <tr><td style="padding:12px 12px 6px;">
        <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_DIM};">${label}</p>
      </td></tr>
      ${imageHtml}
      <tr><td style="padding:8px 12px 12px;">
        <p style="margin:0;font-size:${hasImage ? "14" : "18"}px;font-weight:${hasImage ? "600" : "700"};color:#ffffff;line-height:1.3;">${title}</p>
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
  const moviePosterUrl = moviePoster ? `https://logflix.app/api/tmdb/image?w=300&path=${moviePoster}` : "";
  const seriesPosterUrl = seriesPoster ? `https://logflix.app/api/tmdb/image?w=300&path=${seriesPoster}` : "";

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

/* ── 4. Monthly Couple Report ──────────────────────────── */

const monthNames: Record<string, string[]> = {
  no: ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  dk: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
  se: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
  fi: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
};

const coupleReportStrings: Record<string, {
  subject: (month: string, name: string, partner: string) => string;
  heading: (name: string, partner: string) => string;
  scoreLabel: string;
  changeUp: (n: number) => string;
  changeDown: (n: number) => string;
  moviesLabel: string;
  favoriteLabel: string;
  genreLabel: string;
  streakLabel: string;
  streakWeeks: string;
  cta: string;
  footer: string;
}> = {
  no: {
    subject: (m, name, partner) => `${m} — ${name} & ${partner} sin filmrapport 🎬`,
    heading: (name, partner) => `${name} & ${partner}`,
    scoreLabel: "Taste Compatibility",
    changeUp: (n) => `↑ +${n}% fra forrige måned`,
    changeDown: (n) => `↓ ${n}% fra forrige måned`,
    moviesLabel: "filmer/serier sett",
    favoriteLabel: "Favoritt",
    genreLabel: "Top sjanger",
    streakLabel: "Streak",
    streakWeeks: "uker",
    cta: "Se hele par-rapporten",
    footer: "Du mottar denne fordi du har en koblet partner på logflix.app.",
  },
  en: {
    subject: (m) => `${m} — Your monthly movie report 🎬`,
    heading: (name, partner) => `${name} & ${partner}`,
    scoreLabel: "Taste Compatibility",
    changeUp: (n) => `↑ +${n}% from last month`,
    changeDown: (n) => `↓ ${n}% from last month`,
    moviesLabel: "movies/shows watched",
    favoriteLabel: "Favorite",
    genreLabel: "Top genre",
    streakLabel: "Streak",
    streakWeeks: "weeks",
    cta: "See full couple report",
    footer: "You're receiving this because you have a linked partner on logflix.app.",
  },
  dk: {
    subject: (m, name, partner) => `${m} — ${name} & ${partner}s månedlige filmrapport 🎬`,
    heading: (name, partner) => `${name} & ${partner}`,
    scoreLabel: "Smagskompatibilitet",
    changeUp: (n) => `↑ +${n}% fra sidste måned`,
    changeDown: (n) => `↓ ${n}% fra sidste måned`,
    moviesLabel: "film/serier set",
    favoriteLabel: "Favorit",
    genreLabel: "Top genre",
    streakLabel: "Streak",
    streakWeeks: "uger",
    cta: "Se hele par-rapporten",
    footer: "Du modtager denne fordi du har en forbundet partner på logflix.app.",
  },
  se: {
    subject: (m) => `${m} — Er månadsrapport 🎬`,
    heading: (name, partner) => `${name} & ${partner}`,
    scoreLabel: "Smakkompatibilitet",
    changeUp: (n) => `↑ +${n}% från förra månaden`,
    changeDown: (n) => `↓ ${n}% från förra månaden`,
    moviesLabel: "filmer/serier sedda",
    favoriteLabel: "Favorit",
    genreLabel: "Toppgenre",
    streakLabel: "Streak",
    streakWeeks: "veckor",
    cta: "Se hela par-rapporten",
    footer: "Du får detta för att du har en kopplad partner på logflix.app.",
  },
  fi: {
    subject: (m) => `${m} — Kuukausiraporttinne 🎬`,
    heading: (name, partner) => `${name} & ${partner}`,
    scoreLabel: "Makuyhteensopivuus",
    changeUp: (n) => `↑ +${n}% edellisestä kuukaudesta`,
    changeDown: (n) => `↓ ${n}% edellisestä kuukaudesta`,
    moviesLabel: "elokuvia/sarjoja katsottu",
    favoriteLabel: "Suosikki",
    genreLabel: "Suosituin genre",
    streakLabel: "Putki",
    streakWeeks: "viikkoa",
    cta: "Katso koko pariraportti",
    footer: "Saat tämän koska sinulla on yhdistetty kumppani logflix.app-sivustolla.",
  },
};

function getMonthName(month: string, locale: string): string {
  const names = monthNames[locale] || monthNames.en;
  const idx = parseInt(month.split("-")[1] || "1") - 1;
  return names[idx] || month;
}

function statCell(icon: string, value: string, label: string): string {
  return `<td width="50%" style="padding:8px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};border-radius:10px;border:1px solid ${BORDER};padding:14px 12px;">
      <tr><td>
        <span style="font-size:14px;">${icon}</span>
        <span style="font-size:16px;font-weight:700;color:#fff;margin-left:6px;">${value}</span>
        <br><span style="font-size:11px;color:${TEXT_DIM};margin-top:4px;display:inline-block;">${label}</span>
      </td></tr>
    </table>
  </td>`;
}

export async function sendMonthlyCoupleReport(
  email: string,
  partnerName: string,
  month: string,
  data: {
    moviesWatched: number;
    topGenre: string;
    favoriteTitle: string;
    compatibilityScore: number;
    compatibilityChange: number;
    streakWeeks: number;
  },
  locale: string,
  myName?: string,
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping monthly couple report email");
    return;
  }

  const t = coupleReportStrings[locale] || coupleReportStrings.en;
  const monthLabel = getMonthName(month, locale);
  const displayName = myName || "Du";

  const changeHtml = data.compatibilityChange !== 0
    ? `<p style="margin:4px 0 0;font-size:12px;color:${data.compatibilityChange > 0 ? "#22c55e" : "#ef4444"};">
        ${data.compatibilityChange > 0 ? t.changeUp(data.compatibilityChange) : t.changeDown(Math.abs(data.compatibilityChange))}
      </p>`
    : "";

  try {
    await resend.emails.send({
      from: "Logflix <hei@logflix.app>",
      to: email,
      subject: t.subject(monthLabel, displayName, partnerName),
      html: wrap(`
        <tr><td align="center" style="padding-bottom:6px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:${RED};letter-spacing:1.5px;text-transform:uppercase;">${monthLabel.toUpperCase()}</p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:20px;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">${t.heading(displayName, partnerName)}</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:4px;">
          <div style="display:inline-block;width:120px;height:120px;border-radius:60px;border:2px solid rgba(229,9,20,0.3);background:rgba(229,9,20,0.05);text-align:center;line-height:120px;">
            <span style="font-size:36px;font-weight:900;color:#fff;">${data.compatibilityScore}%</span>
          </div>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px;">
          <p style="margin:2px 0 0;font-size:11px;color:${TEXT_DIM};text-transform:uppercase;letter-spacing:1px;">${t.scoreLabel}</p>
          ${changeHtml}
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${statCell("🎬", String(data.moviesWatched), t.moviesLabel)}
              ${statCell("🏆", data.favoriteTitle || "—", t.favoriteLabel)}
            </tr>
            <tr>
              ${statCell("🎭", data.topGenre || "—", t.genreLabel)}
              ${statCell("🔥", `${data.streakWeeks} ${t.streakWeeks}`, t.streakLabel)}
            </tr>
          </table>
        </td></tr>
        ${ctaButton(t.cta, "https://logflix.app/couple-report")}
        ${footer(
          t.footer,
          '<a href="https://logflix.app/settings" style="color:' + TEXT_DIM + ';text-decoration:underline;">Innstillinger</a>'
        )}
      `),
    });
  } catch (err) {
    console.error("Failed to send monthly couple report email:", err);
  }
}

/* ── 5. Weekly Digest ───────────────────────────────────── */

export async function sendWeeklyDigestEmail(
  email: string,
  name?: string,
  data?: {
    watchlistCount?: number;
    friendsActivity?: number;
    recommendations?: Array<{ title: string; reason: string }>;
    coupleMatches?: number;
    coupleLastMatch?: string;
    locale?: string;
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

  // Couple stats section for premium users with partner
  let coupleHtml = "";
  if (data?.coupleMatches && data.coupleMatches > 0) {
    const loc = data.locale || "no";
    const coupleDigestStrings: Record<string, { matched: (n: number) => string; latest: string; cta: string }> = {
      no: { matched: (n) => `Dere matchet ${n} gang${n > 1 ? "er" : ""} denne uken 🎬`, latest: "Siste match", cta: "Se par-rapporten deres →" },
      en: { matched: (n) => `You matched ${n} time${n > 1 ? "s" : ""} this week 🎬`, latest: "Latest match", cta: "See your couple report →" },
      dk: { matched: (n) => `I matchede ${n} gang${n > 1 ? "e" : ""} denne uge 🎬`, latest: "Seneste match", cta: "Se jeres par-rapport →" },
      se: { matched: (n) => `Ni matchade ${n} gång${n > 1 ? "er" : ""} denna vecka 🎬`, latest: "Senaste match", cta: "Se er par-rapport →" },
      fi: { matched: (n) => `Matchasitte ${n} kertaa tällä viikolla 🎬`, latest: "Viimeisin match", cta: "Katso pariraporttinne →" },
    };
    const cs = coupleDigestStrings[loc] || coupleDigestStrings.en;
    coupleHtml = `<tr><td style="padding:16px 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};border-radius:12px;border:1px solid ${BORDER};padding:16px;">
        <tr><td style="color:#fff;font-size:15px;font-weight:600;line-height:1.5;">
          ${cs.matched(data.coupleMatches)}
        </td></tr>
        ${data.coupleLastMatch ? `<tr><td style="color:${TEXT_DIM};font-size:13px;padding-top:4px;">
          ${cs.latest}: <strong style="color:#fff;">${data.coupleLastMatch}</strong>
        </td></tr>` : ""}
        <tr><td style="padding-top:10px;">
          <a href="https://logflix.app/couple-report" style="color:${RED};font-size:13px;font-weight:600;text-decoration:none;">${cs.cta}</a>
        </td></tr>
      </table>
    </td></tr>`;
  }

  const hasDynamic = dynamicRows.length > 0 || coupleHtml.length > 0;

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
          <table width="100%" cellpadding="0" cellspacing="0">${dynamicRows}${coupleHtml}</table>
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

/* ── 6. Daily Tonight's Pick ──────────────────────────── */

const dailyPickStrings: Record<string, {
  subject: string;
  heading: string;
  movieLabel: string;
  seriesLabel: string;
  cta: string;
  footer: string;
  unsub: string;
}> = {
  no: {
    subject: "🎬 Tonight's Pick er klar",
    heading: "Kveldens valg for deg",
    movieLabel: "Film i kveld",
    seriesLabel: "Serie i kveld",
    cta: "Åpne Logflix",
    footer: "Du mottar dette fordi du valgte daglig Tonight's Pick.",
    unsub: "Avslutt abonnement",
  },
  en: {
    subject: "🎬 Tonight's Pick is ready",
    heading: "Tonight's picks for you",
    movieLabel: "Movie tonight",
    seriesLabel: "Series tonight",
    cta: "Open Logflix",
    footer: "You're receiving this because you opted in to daily Tonight's Pick.",
    unsub: "Unsubscribe",
  },
  se: {
    subject: "🎬 Tonight's Pick är redo",
    heading: "Kvällens val för dig",
    movieLabel: "Film ikväll",
    seriesLabel: "Serie ikväll",
    cta: "Öppna Logflix",
    footer: "Du får detta för att du valde daglig Tonight's Pick.",
    unsub: "Avsluta prenumeration",
  },
  dk: {
    subject: "🎬 Tonight's Pick er klar",
    heading: "Aftenens valg til dig",
    movieLabel: "Film i aften",
    seriesLabel: "Serie i aften",
    cta: "Åbn Logflix",
    footer: "Du modtager dette fordi du valgte daglig Tonight's Pick.",
    unsub: "Afmeld",
  },
  fi: {
    subject: "🎬 Tonight's Pick on valmis",
    heading: "Illan valinnat sinulle",
    movieLabel: "Elokuva tänään",
    seriesLabel: "Sarja tänään",
    cta: "Avaa Logflix",
    footer: "Saat tämän koska valitsit päivittäisen Tonight's Pick -palvelun.",
    unsub: "Peruuta tilaus",
  },
};

export async function sendDailyPickEmail(
  email: string,
  locale: string,
  movie: { title: string; poster_path: string | null; match_score: number | null } | null,
  series: { title: string; poster_path: string | null; match_score: number | null } | null,
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping daily pick email");
    return;
  }

  const t = dailyPickStrings[locale] || dailyPickStrings.en;

  let cardsHtml = "";
  if (movie || series) {
    const movieHtml = movie
      ? posterCard(
          `🎬 ${t.movieLabel}`,
          `${movie.title}${movie.match_score ? ` — ★ ${movie.match_score}%` : ""}`,
          movie.poster_path ? `https://logflix.app/api/tmdb/image?w=300&path=${movie.poster_path}` : "",
        )
      : "";
    const seriesHtml = series
      ? posterCard(
          `📺 ${t.seriesLabel}`,
          `${series.title}${series.match_score ? ` — ★ ${series.match_score}%` : ""}`,
          series.poster_path ? `https://logflix.app/api/tmdb/image?w=300&path=${series.poster_path}` : "",
        )
      : "";
    cardsHtml = `<tr><td style="padding-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>${movieHtml}${seriesHtml}</tr></table>
    </td></tr>`;
  }

  try {
    await resend.emails.send({
      from: "Logflix <hei@logflix.app>",
      to: email,
      subject: t.subject,
      html: wrap(`
        <tr><td align="center" style="padding-bottom:8px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:${RED};letter-spacing:1.5px;text-transform:uppercase;">TONIGHT'S PICK</p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">${t.heading}</h1>
        </td></tr>
        ${cardsHtml}
        ${ctaButton(t.cta, "https://logflix.app/home")}
        ${footer(
          t.footer,
          '<a href="https://logflix.app/settings" style="color:' + TEXT_DIM + ';text-decoration:underline;">' + t.unsub + "</a>"
        )}
      `),
    });
  } catch (err) {
    console.error("Failed to send daily pick email:", err);
  }
}
