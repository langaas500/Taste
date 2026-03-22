/**
 * Send all 6 email types to a test address.
 * Run: npx tsx scripts/test-emails.ts
 */

import "dotenv/config";

// Dynamically import after env is loaded
async function main() {
  const { sendWelcomeEmail, sendMatchReminderEmail, sendFridayPickEmail, sendWeeklyDigestEmail, sendMonthlyCoupleReport, sendDailyPickEmail } = await import("../src/lib/email");

  const to = "martinlangaas@live.no";
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  console.log("Sending 6 test emails to", to, "...\n");

  // 1. Welcome
  console.log("1/6 — Welcome...");
  await sendWelcomeEmail(to, "Martin");
  await delay(1000);

  // 2. Match Reminder
  console.log("2/6 — Match Reminder...");
  await sendMatchReminderEmail(to, "Breaking Bad", "tv");
  await delay(1000);

  // 3. Friday Pick
  console.log("3/6 — Friday Pick...");
  await sendFridayPickEmail(
    to,
    "Partner",
    "The Shawshank Redemption",
    "Severance",
    "/9O7gLzmreU0nGkIB6K3BsJbztNv.jpg",
    "/lFf6DEhbdRWagEOEOjxDpVfsr6F.jpg",
    "no"
  );
  await delay(1000);

  // 4. Weekly Digest
  console.log("4/6 — Weekly Digest...");
  await sendWeeklyDigestEmail(to, "Martin", {
    watchlistCount: 12,
    friendsActivity: 3,
    recommendations: [
      { title: "Interstellar", reason: "Basert på din smak" },
      { title: "Dark", reason: "Fordi du likte Stranger Things" },
    ],
    coupleMatches: 3,
    coupleLastMatch: "Dune: Part Two",
    locale: "no",
  });
  await delay(1000);

  // 5. Monthly Couple Report
  console.log("5/6 — Monthly Couple Report...");
  await sendMonthlyCoupleReport(
    to,
    "Partner",
    "Mars 2026",
    {
      compatibilityScore: 82,
      compatibilityChange: 5,
      moviesWatched: 14,
      favoriteTitle: "Breaking Bad",
      topGenre: "Drama",
      streakWeeks: 6,
    },
    "no",
    "Martin"
  );
  await delay(1000);

  // 6. Daily Tonight's Pick
  console.log("6/6 — Daily Tonight's Pick...");
  await sendDailyPickEmail(to, "no",
    { title: "Chinatown", poster_path: "/ew5FNKx3GGcuqKkk81M0U5KE2Jb.jpg", match_score: 85 },
    { title: "True Detective", poster_path: "/aoVRoxVq9mBkEWNBOmqMJKP8LZE.jpg", match_score: 91 }
  );

  console.log("\n✅ All 6 emails sent to", to);
}

main().catch((e) => { console.error("Error:", e.message); process.exit(1); });
