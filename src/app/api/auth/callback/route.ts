import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || "/home";
  const from = req.nextUrl.searchParams.get("from");

  if (code) {
    const supabase = await createSupabaseServer();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session?.user) {
      // New user = has no titles yet → send to onboarding
      const { count } = await supabase
        .from("user_titles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", data.session.user.id);

      if (count === 0) {
        const { email, user_metadata } = data.session.user;
        if (email) {
          sendWelcomeEmail(email, user_metadata?.full_name).catch(() => {});
        }
      }

      let destination: string;
      if (count === 0) {
        destination = from === "together" ? "/onboarding?from=together" : "/onboarding";
      } else {
        destination = from === "together" ? "/together" : next;
      }
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
}
