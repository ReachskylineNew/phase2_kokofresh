import { NextRequest, NextResponse } from "next/server";
import { getWixServerClient } from "@/lib/wix-server-client";

interface RequestBody {
  checkoutId: string;
  paymentMethod: "cod" | "cashfree";
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();

    const { checkoutId, paymentMethod } = body;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "checkoutId is required" },
        { status: 400 }
      );
    }

    const wixClient = await getWixServerClient();

    let paymentInfo: any = {};

    // -----------------------------
    // COD Case
    // -----------------------------
    if (paymentMethod === "cod") {
      paymentInfo = {
        paymentProvider: "MANUAL",
        paymentMethod: "manual",
      };
    }

    // -----------------------------
    // Cashfree Case
    // -----------------------------
    else if (paymentMethod === "cashfree") {
      // Fetch checkout info to get final amount
      const checkout = await wixClient.checkout.getCheckout(checkoutId);
      const amount = checkout.totals?.grandTotal?.amount;

      paymentInfo = {
        paymentProvider: "CASHFREE",
        paymentMethod: "cashfree",
        paymentDetails: {
          externalTransactionId: "cashfree-" + checkoutId,
          amount,
          currency: "INR",
        },
      };
    }

    // -----------------------------
    // Invalid Payment Method
    // -----------------------------
    else {
      return NextResponse.json(
        { error: "Invalid paymentMethod. Use 'cod' or 'cashfree'" },
        { status: 400 }
      );
    }

    console.log("Sending paymentInfo to Wix:", paymentInfo);

    // -----------------------------
    // CREATE ORDER IN WIX
    // -----------------------------
    const order = await wixClient.checkout.createOrder(checkoutId, paymentInfo);

    if (!order?.order?._id) {
      return NextResponse.json(
        { error: "Wix failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.order._id,
      orderNumber: order.order.number,
      order: order.order,
    });

  } catch (err: any) {
    console.error("❌ ORDER ERROR:", err);

    return NextResponse.json(
      {
        error: err.message || "Internal error",
      },
      { status: 500 }
    );
  }
}
