import { NextRequest, NextResponse } from "next/server";
import { getWixServerClient } from "@/lib/wix-server-client";

/**
 * Place order from checkout
 * Supports both online payment (with payment intent) and COD
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutId, paymentMethod, paymentIntentId, paymentToken } = body;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "checkoutId is required" },
        { status: 400 }
      );
    }

    const wixClient = await getWixServerClient();

    // Build payment info based on method
    const paymentInfo: any = {};

    if (paymentMethod === "cod") {
      // Cash on Delivery - no payment processing needed
      paymentInfo.paymentProvider = "manual";
      paymentInfo.paymentMethod = "manual";
    } else if (paymentMethod === "online") {
      // Online payment - requires payment provider and credentials
      const { paymentProvider, paymentIntentId, paymentToken, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

      if (!paymentProvider) {
        return NextResponse.json(
          { error: "Payment provider is required for online payments" },
          { status: 400 }
        );
      }

      if (paymentProvider === "stripe") {
        if (!paymentIntentId) {
          return NextResponse.json(
            { error: "Stripe payment intent ID is required" },
            { status: 400 }
          );
        }
        // Verify payment intent was successful
        const Stripe = require("stripe");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
        
        try {
          const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
          if (intent.status !== "succeeded") {
            return NextResponse.json(
              { error: `Payment not completed. Status: ${intent.status}` },
              { status: 400 }
            );
          }
        } catch (stripeError: any) {
          console.error("Stripe verification error:", stripeError);
          return NextResponse.json(
            { error: "Failed to verify payment. Please try again." },
            { status: 500 }
          );
        }

        paymentInfo.paymentProvider = "external";
        paymentInfo.paymentMethod = "stripe";
        paymentInfo.paymentIntentId = paymentIntentId;
      } else if (paymentProvider === "razorpay") {
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
          return NextResponse.json(
            { error: "Razorpay order ID, payment ID, and signature are required" },
            { status: 400 }
          );
        }

        // Verify Razorpay signature
        const crypto = require("crypto");
        const Razorpay = require("razorpay");
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const text = `${razorpayOrderId}|${razorpayPaymentId}`;
        const generatedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
          .update(text)
          .digest("hex");

        if (generatedSignature !== razorpaySignature) {
          return NextResponse.json(
            { error: "Invalid Razorpay payment signature" },
            { status: 400 }
          );
        }

        paymentInfo.paymentProvider = "external";
        paymentInfo.paymentMethod = "razorpay";
        paymentInfo.razorpayOrderId = razorpayOrderId;
        paymentInfo.razorpayPaymentId = razorpayPaymentId;
      } else {
        return NextResponse.json(
          { error: `Unsupported payment provider: ${paymentProvider}` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid payment method. Use 'cod' or 'online'" },
        { status: 400 }
      );
    }

    // Place the order
    const order = await wixClient.checkout.placeOrder(checkoutId, {
      paymentInfo,
    });

    if (!order?._id) {
      return NextResponse.json(
        { error: "Failed to place order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order._id,
      orderNumber: order.number,
      order,
      success: true,
    });
  } catch (error: any) {
    console.error("❌ Place order error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to place order",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

