import { NextResponse } from "next/server";
import { requireUser, getUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServer();

    const { error } = await supabase
      .from("profiles")
      .update({ email_digest: true })
      .eq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("profiles")
      .update({ email_digest: false })
      .eq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return new NextResponse(
      `<!DOCTYPE html><html><body style="background:#0a0a0f;color:#fff;font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
        <div style="text-align:center;">
          <h2>Avmeldt ✅</h2>
          <p style="color:#888;">Du vil ikke lenger motta daglig Tonight's Pick på e-post.</p>
          <a href="https://logflix.app/settings" style="color:#ff2a2a;">Tilbake til innstillinger</a>
        </div>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
