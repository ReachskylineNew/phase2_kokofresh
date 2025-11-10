import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

/**
 * Create payment intent for Stripe or Razorpay
 * Returns client secret for Stripe or order details for Razorpay
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutId, amount, currency = "INR", provider = "stripe" } = body;

    if (!checkoutId || !amount) {
      return NextResponse.json(
        { error: "checkoutId and amount are required" },
        { status: 400 }
      );
    }

    // Convert amount to smallest currency unit (paise for INR, cents for USD)
    const amountInSmallestUnit = Math.round(
      typeof amount === "string" ? parseFloat(amount) * 100 : amount * 100
    );

    if (provider === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY." },
          { status: 500 }
        );
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInSmallestUnit,
          currency: currency.toLowerCase(),
          metadata: {
            checkoutId,
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          provider: "stripe",
        });
      } catch (stripeError: any) {
        console.error("Stripe error:", stripeError);
        return NextResponse.json(
          { error: stripeError.message || "Failed to create Stripe payment intent" },
          { status: 500 }
        );
      }
    } else if (provider === "razorpay") {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json(
          { error: "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
          { status: 500 }
        );
      }

      // Razorpay order creation
      const Razorpay = require("razorpay");
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      try {
        // Razorpay receipt field must be max 40 characters
        // "checkout_" is 9 chars, so we have 31 chars for checkoutId
        const receiptPrefix = "checkout_";
        const maxCheckoutIdLength = 40 - receiptPrefix.length;
        const truncatedCheckoutId = checkoutId.length > maxCheckoutIdLength 
          ? checkoutId.substring(0, maxCheckoutIdLength)
          : checkoutId;
        const receipt = `${receiptPrefix}${truncatedCheckoutId}`;

        const razorpayOrder = await razorpay.orders.create({
          amount: amountInSmallestUnit,
          currency: currency,
          receipt: receipt,
          notes: {
            checkoutId,
          },
        });

        return NextResponse.json({
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          provider: "razorpay",
        });
      } catch (razorpayError: any) {
        console.error("Razorpay error:", razorpayError);
        return NextResponse.json(
          { error: razorpayError.message || "Failed to create Razorpay order" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid payment provider. Use 'stripe' or 'razorpay'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("❌ Payment intent error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create payment intent",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

