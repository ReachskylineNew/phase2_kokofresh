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
    console.log("📩 Cashfree Webhook Received:", JSON.stringify(event, null, 2));

    const {
      order_id,
      order_status,
      payment_id,
      order_amount,
    } = event?.data ?? {};

    console.log("📊 Webhook data:", { order_id, order_status, payment_id, order_amount });

    if (order_status !== "PAID") {
      console.log("⚠️ Payment not completed. Status:", order_status);
      return NextResponse.json({ received: true, status: order_status });
    }

    if (!order_id) {
      console.error("❌ order_id missing in webhook event");
      return NextResponse.json(
        { error: "Missing order_id in webhook" },
        { status: 400 }
      );
    }

    // Extract checkoutId from "checkoutId-timestamp" format
    // Cashfree order_id is in format: checkoutId-timestamp
    const parts = order_id.split("-");
    let checkoutId: string | undefined;
    
    // Try to extract checkoutId by removing the last part (timestamp)
    if (parts.length > 1) {
      // Remove the last element (timestamp) and join the rest
      checkoutId = parts.slice(0, -1).join("-");
    } else {
      // If no dash, use the whole order_id as checkoutId
      checkoutId = order_id;
    }

    if (!checkoutId) {
      console.error("❌ checkoutId missing in webhook order_id:", order_id);
      return NextResponse.json(
        { error: "Invalid checkout ID", order_id },
        { status: 400 }
      );
    }

    console.log("🔍 Extracted checkoutId:", checkoutId, "from order_id:", order_id);

    const wixClient = await getWixServerClient();

    // First, verify the checkout exists and is valid
    let checkout;
    try {
      checkout = await wixClient.checkout.getCheckout(checkoutId);
      console.log("✅ Checkout found:", checkoutId);
      console.log("📦 Checkout channelInfo:", (checkout as any)?.channelInfo);
      console.log("📦 Checkout channelType:", (checkout as any)?.channelType);
    } catch (checkoutError: any) {
      console.error("❌ Failed to get checkout:", checkoutError.message);
      return NextResponse.json(
        { 
          error: "Checkout not found or invalid", 
          checkoutId,
          details: checkoutError.message 
        },
        { status: 404 }
      );
    }

    // 🛑 Prevent duplicate order creation
    let existingOrders;
    try {
      existingOrders = await wixClient.orders.searchOrders({
        search: {
          filter: {
            checkoutId: { $eq: checkoutId },
          },
          cursorPaging: { limit: 1 },
        },
      });
    } catch (queryError: any) {
      console.warn("⚠️ Failed to query existing orders:", queryError.message);
      // Continue with order creation
      existingOrders = { orders: [] };
    }

    if (existingOrders?.orders && existingOrders.orders.length > 0) {
      const existingOrder = existingOrders.orders[0];
      const orderId = (existingOrder as any)?._id;
      const orderNumber = (existingOrder as any)?.number;
      console.log("⚠️ Order already exists:", orderId);

      return NextResponse.json({
        success: true,
        message: "Order already exists",
        orderId,
        orderNumber,
      });
    }

    console.log("🟢 Creating new Wix order for:", checkoutId);

    // Get the final amount from checkout if order_amount is not provided
    const priceSummary: any = (checkout as any).priceSummary;
    const rawAmount = order_amount ?? 
                     priceSummary?.total?.amount ?? 
                     priceSummary?.total?.value ?? 
                     0;
    const finalAmount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount || "0"));

    // ⭐ FIX: TS-safe values (NO undefined allowed)
    const transactionId = payment_id || `cashfree-${checkoutId}-${Date.now()}`;
    const paidAmount = Number.isFinite(finalAmount) ? finalAmount : 0;

    console.log("💰 Payment details:", { transactionId, paidAmount, currency: "INR" });

    // Create Wix order with explicit payment info
    // IMPORTANT: Order must be created from a checkout with channelType: "WEB" to appear in Store Dashboard
    // The checkout should already have channelType: "WEB" from createCheckoutFromCurrentCart
    let order;
    try {
      // Ensure we're creating a store order, not a backoffice order
      // The checkout's channelType should be inherited by the order
      const checkoutChannelType = (checkout as any)?.channelType || (checkout as any)?.channelInfo?.type;
      console.log("🔍 Checkout channel type:", checkoutChannelType);
      
      const orderPayload: any = {
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
      };

      // If checkout has channelType, ensure order inherits it
      // Note: Wix should automatically inherit channelType from checkout, but we log it for debugging
      if (checkoutChannelType) {
        console.log("✅ Checkout has channelType:", checkoutChannelType, "- order should inherit this");
      } else {
        console.warn("⚠️ Checkout missing channelType - order may be created as backoffice order");
      }

      console.log("📦 Creating order with payload:", JSON.stringify(orderPayload, null, 2));
      console.log("📦 Checkout details:", {
        checkoutId,
        channelType: checkoutChannelType,
        hasLineItems: !!(checkout as any)?.lineItems?.length,
      });
      
      order = await wixClient.checkout.createOrder(orderPayload);

      console.log("📦 Order creation response:", JSON.stringify(order, null, 2));
      console.log("📦 Order channelInfo:", (order as any)?.channelInfo);
      console.log("📦 Order paymentStatus:", (order as any)?.paymentStatus);
      console.log("📦 Order status:", (order as any)?.status);
      
      // Verify order was created as WEB order, not BACKOFFICE
      const orderChannelType = (order as any)?.channelInfo?.type || (order as any)?.channelType;
      if (orderChannelType === "BACKOFFICE_MERCHANT" || orderChannelType === "BACKOFFICE") {
        console.error("❌ WARNING: Order created as BACKOFFICE instead of WEB!");
        console.error("❌ This order will NOT appear in Wix Store Dashboard");
        console.error("❌ Checkout channelType was:", checkoutChannelType);
      } else if (orderChannelType === "WEB") {
        console.log("✅ Order created as WEB order - will appear in Store Dashboard");
      }
    } catch (createError: any) {
      console.error("❌ Failed to create Wix order:", createError);
      console.error("❌ Error details:", JSON.stringify(createError, null, 2));
      throw new Error(`Failed to create Wix order: ${createError.message || createError}`);
    }

    // Handle different response structures from Wix
    const orderId = (order as any)?._id || (order as any)?.orderId || (order as any)?.order?._id;
    const orderNumber = (order as any)?.number || (order as any)?.order?.number;

    if (!orderId) {
      console.error("❌ Order created but no ID returned:", order);
      throw new Error("Failed to create Wix order - no order ID returned");
    }

    console.log("✅ Wix Order Created:", { 
      orderId, 
      orderNumber,
      paymentStatus: (order as any)?.paymentStatus,
      channelInfo: (order as any)?.channelInfo,
      checkoutId,
    });

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      paymentStatus: (order as any)?.paymentStatus,
      channelInfo: (order as any)?.channelInfo,
      message: "Order created via webhook",
    });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error);
    console.error("❌ Error stack:", error.stack);
    return NextResponse.json({ 
      error: error.message || "Internal server error", 
      received: true,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}
