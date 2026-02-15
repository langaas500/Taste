import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || "/library";

  if (code) {
    const supabase = await createSupabaseServer();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session?.user) {
      // New user = has no titles yet → send to WT Beta for engagement
      const { count } = await supabase
        .from("user_titles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", data.session.user.id);

      const destination = count === 0 ? "/wt-beta" : next;
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
}
