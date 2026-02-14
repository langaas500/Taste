import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { testAIConnection } from "@/lib/ai";

export async function GET() {
  try {
    await requireUser();
    const result = await testAIConnection();
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
