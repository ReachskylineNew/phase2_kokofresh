import { NextRequest, NextResponse } from "next/server";
import { getWixServerClient } from "@/lib/wix-server-client";

/**
 * Apply gift card to checkout
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutId, giftCardCode } = body;

    if (!checkoutId || !giftCardCode) {
      return NextResponse.json(
        { error: "checkoutId and giftCardCode are required" },
        { status: 400 }
      );
    }

    const wixClient = await getWixServerClient();

    try {
      // Apply gift card using Wix checkout API
      // Note: Wix gift card API structure may vary - adjust based on actual API
      const updatedCheckout = await wixClient.checkout.updateCheckout(checkoutId, {
        discounts: {
          giftCardCode,
        },
      });

      // Get totals from updated checkout object (Wix SDK doesn't have calculateTotals method)
      // The checkout object uses priceSummary for totals
      const calculatedTotals = {
        subtotal: updatedCheckout.priceSummary?.subtotal?.amount || updatedCheckout.priceSummary?.subtotal?.value || "0",
        tax: updatedCheckout.priceSummary?.tax?.amount || updatedCheckout.priceSummary?.tax?.value || "0",
        shipping: updatedCheckout.priceSummary?.shipping?.amount || updatedCheckout.priceSummary?.shipping?.value || "0",
        discount: updatedCheckout.priceSummary?.discount?.amount || updatedCheckout.priceSummary?.discount?.value || "0",
        total: updatedCheckout.priceSummary?.total?.amount || updatedCheckout.priceSummary?.total?.value || "0",
      };

      const formatTotal = (value: any): string => {
        if (value === null || value === undefined) return "0";
        if (typeof value === "string") return value;
        if (typeof value === "number") return value.toString();
        return "0";
      };

      return NextResponse.json({
        success: true,
        checkout: updatedCheckout,
        totals: {
          subtotal: formatTotal(calculatedTotals.subtotal),
          tax: formatTotal(calculatedTotals.tax),
          shipping: formatTotal(calculatedTotals.shipping),
          discount: formatTotal(calculatedTotals.discount),
          total: formatTotal(calculatedTotals.total),
        },
      });
    } catch (error: any) {
      console.error("❌ Apply gift card error:", error);
      return NextResponse.json(
        {
          error: error.message || "Failed to apply gift card. Please check the code and try again.",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("❌ Apply gift card error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to apply gift card",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

