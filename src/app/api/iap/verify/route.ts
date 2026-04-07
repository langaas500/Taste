import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const APPLE_PROD_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";
const PRODUCT_ID = "app.logflix.premium.monthly";

async function verifyWithApple(
  receiptData: string,
  url: string
): Promise<{ status: number; latestReceipt?: Record<string, unknown> }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receiptData,
      password: process.env.APPLE_SHARED_SECRET,
      "exclude-old-transactions": true,
    }),
  });
  return res.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receiptData, userId } = body as {
      receiptData?: string;
      userId?: string;
    };

    if (!receiptData || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing receiptData or userId" },
        { status: 400 }
      );
    }

    if (!process.env.APPLE_SHARED_SECRET) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Try production first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = await verifyWithApple(receiptData, APPLE_PROD_URL);

    // Status 21007 = sandbox receipt sent to production → retry with sandbox
    if (result.status === 21007) {
      result = await verifyWithApple(receiptData, APPLE_SANDBOX_URL);
    }

    if (result.status !== 0) {
      return NextResponse.json(
        { success: false, error: `Apple verification failed (status ${result.status})` },
        { status: 400 }
      );
    }

    // Find active subscription for our product
    const latestInfo =
      result.latest_receipt_info ?? result.receipt?.in_app ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeSubscription = latestInfo.find((item: any) => {
      if (item.product_id !== PRODUCT_ID) return false;
      // Check expiry — expires_date_ms is in milliseconds
      const expiresMs = Number(item.expires_date_ms);
      return expiresMs > Date.now();
    });

    if (!activeSubscription) {
      return NextResponse.json(
        { success: false, error: "No active subscription found for this product" },
        { status: 400 }
      );
    }

    // Update premium status in Supabase
    const supabase = createSupabaseAdmin();
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_since: new Date().toISOString(),
        premium_source: "apple",
      })
      .eq("id", userId);

    if (dbError) {
      return NextResponse.json(
        { success: false, error: "Failed to update premium status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
