import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { checkoutId, amount, customerEmail, customerPhone } = await req.json();

    console.log("CF APP ID:", process.env.CASHFREE_APP_ID);
    console.log("CF SECRET:", process.env.CASHFREE_SECRET_KEY ? "loaded" : "missing");

    if (!checkoutId || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const cfHeaders = {
      "accept": "application/json",
      "content-type": "application/json",
      "x-client-id": process.env.CASHFREE_APP_ID!,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
      "x-api-version": "2023-08-01",
    };

    // Generate unique Cashfree order ID (must be unique per payment attempt)
    const cashfreeOrderId = `${checkoutId}-${Date.now()}`;

    const cleanPhone = customerPhone.replace(/\D/g, ""); // Remove spaces, +, -, etc.

    // Get base URL from environment variable or use current origin
    const baseUrl = process.env.NEXT_PUBLIC_URL || 
                   process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.NODE_ENV === "production" ? "https://kokofresh.in" : "http://localhost:3000");

    const payload = {
      order_id: cashfreeOrderId, // Unique per payment attempt
      order_amount: parseFloat(amount.toString()),
      order_currency: "INR",
      customer_details: {
        customer_id: "cust_" + checkoutId,
        customer_email: customerEmail,
        customer_phone: cleanPhone,
      },
      order_meta: {
        return_url: `${baseUrl}/payment-success?checkoutId=${checkoutId}`,
        notify_url: `${baseUrl}/api/cashfree/webhook`,
      },
    };

    console.log("CF REQUEST:", payload);
    console.log("CF HEADERS:", cfHeaders);

    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: cfHeaders,
      body: JSON.stringify(payload),
    });

    console.log("CF RAW RESPONSE:", response.status);

    const data = await response.json();
    console.log("Cashfree Session:", data);

    if (response.status === 200) {
      return NextResponse.json({
        success: true,
        payment_session_id: data.payment_session_id,
        order_id: data.order_id,
        order_status: data.order_status,
        checkoutId, // Include original checkoutId for frontend
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to create session",
      }, { status: response.status });
    }

  } catch (err: any) {
    console.error("Cashfree session error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
