import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { checkoutId, amount, customerEmail, customerPhone } = await req.json();

    console.log("CF APP ID:", process.env.CASHFREE_APP_ID);
    console.log("CF SECRET:", process.env.CASHFREE_SECRET_KEY ? "loaded" : "missing");

    if (!checkoutId || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate checkoutId format
    if (typeof checkoutId !== "string" || checkoutId.trim() === "") {
      return NextResponse.json({ error: "Invalid checkoutId" }, { status: 400 });
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

    // Get base URL from environment variable, request origin, or fallback
    let baseUrl = process.env.NEXT_PUBLIC_URL || 
                  process.env.NEXT_PUBLIC_SITE_URL;
    
    // If no env var, try to get from request
    if (!baseUrl) {
      const origin = req.headers.get("origin") || req.nextUrl.origin;
      if (origin && origin !== "http://localhost:3000") {
        baseUrl = origin;
        console.log("📡 Using request origin as base URL:", baseUrl);
      }
    }
    
    // Final fallback - check for common deployment URLs
    if (!baseUrl) {
      // Check if we're on Vercel and can detect the deployment URL
      const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
      if (vercelUrl) {
        baseUrl = vercelUrl;
        console.log("📡 Using Vercel URL:", baseUrl);
      } else {
        // Fallback to production domain or localhost
        baseUrl = process.env.NODE_ENV === "production" ? "https://kokofresh.in" : "http://localhost:3000";
        console.log("📡 Using fallback URL:", baseUrl);
      }
    }

    // Ensure URL has protocol and is properly formatted
    baseUrl = baseUrl.trim();
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      // If no protocol, assume https in production, http in development
      baseUrl = process.env.NODE_ENV === "production" ? `https://${baseUrl}` : `http://${baseUrl}`;
    }
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, "");

    // Ensure URL is valid
    try {
      new URL(baseUrl);
    } catch (e) {
      console.error("❌ Invalid base URL:", baseUrl);
      baseUrl = process.env.NODE_ENV === "production" ? "https://kokofresh.in" : "http://localhost:3000";
    }

    // Build URLs with proper encoding
    const encodedCheckoutId = encodeURIComponent(checkoutId.trim());
    const returnUrl = `${baseUrl}/payment-success?checkoutId=${encodedCheckoutId}`;
    const notifyUrl = `${baseUrl}/api/cashfree/webhook`;

    // Validate URLs are valid
    try {
      new URL(returnUrl);
      new URL(notifyUrl);
    } catch (e) {
      console.error("❌ Invalid URL constructed:", { returnUrl, notifyUrl });
      return NextResponse.json({ 
        error: "Failed to construct valid payment URLs",
        details: "Please set NEXT_PUBLIC_URL environment variable"
      }, { status: 500 });
    }

    console.log("🌐 Base URL:", baseUrl);
    console.log("🔗 Return URL:", returnUrl);
    console.log("📡 Notify URL:", notifyUrl);
    console.log("📦 Checkout ID:", checkoutId);
    console.log("🔍 Environment:", {
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL ? "set" : "not set",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? "set" : "not set",
      VERCEL_URL: process.env.VERCEL_URL || "not set",
      NODE_ENV: process.env.NODE_ENV,
      requestOrigin: req.headers.get("origin") || req.nextUrl.origin,
    });

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
        return_url: returnUrl,
        notify_url: notifyUrl,
      },
    };

    console.log("CF REQUEST:", JSON.stringify(payload, null, 2));
    console.log("CF HEADERS:", { ...cfHeaders, "x-client-secret": "[REDACTED]" });

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
