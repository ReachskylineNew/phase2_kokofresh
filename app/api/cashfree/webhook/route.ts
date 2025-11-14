import { NextRequest, NextResponse } from "next/server";
import { getWixServerClient } from "@/lib/wix-server-client";

interface CashfreeWebhookEvent {
  data?: {
    order_id?: string;
    order_status?: string;
    payment_id?: string;
    order_amount?: number;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const event: CashfreeWebhookEvent = await req.json();
    console.log("📩 Cashfree Webhook Received:", event);

    const {
      order_id,
      order_status,
      payment_id,
      order_amount,
    } = event?.data ?? {};

    if (order_status !== "PAID") {
      console.log("⚠️ Payment not completed. Status:", order_status);
      return NextResponse.json({ received: true });
    }

    // Extract checkoutId from "checkoutId-timestamp"
    const checkoutId = order_id?.split("-").slice(0, -1).join("-");

    if (!checkoutId) {
      console.error("❌ checkoutId missing in webhook order_id");
      return NextResponse.json(
        { error: "Invalid checkout ID" },
        { status: 400 }
      );
    }

    console.log("🔍 Extracted checkoutId:", checkoutId);

    const wixClient = await getWixServerClient();

    // 🛑 Prevent duplicate order creation
    const existingOrders = await wixClient.orders.queryOrders({
      filter: { checkoutId },
    });

    if (existingOrders?.items?.length > 0) {
      const existingOrder = existingOrders.items[0];
      console.log("⚠️ Order already exists:", existingOrder._id);

      return NextResponse.json({
        success: true,
        message: "Order already exists",
        orderId: existingOrder._id,
        orderNumber: existingOrder.number,
      });
    }

    console.log("🟢 Creating new Wix order for:", checkoutId);

    // ⭐ FIX: TS-safe values (NO undefined allowed)
    const transactionId = payment_id ?? `cashfree-${checkoutId}`;
    const paidAmount = order_amount ?? 0;

    // Create Wix order
    const order = await wixClient.checkout.createOrder({
      checkoutId,
      paymentInfo: {
        paymentProvider: "CASHFREE",
        paymentMethod: "cashfree",
        paymentDetails: {
          externalTransactionId: transactionId,
          amount: paidAmount,
          currency: "INR",
        },
      },
    });

    if (!order?._id) {
      throw new Error("Failed to create Wix order");
    }

    console.log("✅ Wix Order Created:", order._id);

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.number,
      message: "Order created via webhook",
    });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ error: error.message, received: true });
  }
}
