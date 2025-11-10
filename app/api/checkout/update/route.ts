import { NextRequest, NextResponse } from "next/server";
import { getWixServerClient } from "@/lib/wix-server-client";

/**
 * Update checkout with buyer info and shipping address
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutId, buyerInfo, shippingAddress, shippingOptionId } = body;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "checkoutId is required" },
        { status: 400 }
      );
    }

    const wixClient = await getWixServerClient();

    // Build update payload
    const updatePayload: any = {};

    // Add buyer info if provided
    if (buyerInfo) {
      updatePayload.buyerInfo = {
        ...(buyerInfo.email && { email: buyerInfo.email }),
        ...(buyerInfo.phone && { phone: buyerInfo.phone }),
        ...(buyerInfo.firstName && { firstName: buyerInfo.firstName }),
        ...(buyerInfo.lastName && { lastName: buyerInfo.lastName }),
      };
    }

    // Add shipping address if provided
    if (shippingAddress) {
      updatePayload.shippingInfo = {
        logistics: {
          shippingDestination: {
            address: {
              addressLine1: shippingAddress.line1,
              addressLine2: shippingAddress.line2 || "",
              city: shippingAddress.city,
              subdivision: shippingAddress.region,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country || "IN",
            },
            contactDetails: {
              ...(buyerInfo?.firstName && { firstName: buyerInfo.firstName }),
              ...(buyerInfo?.lastName && { lastName: buyerInfo.lastName }),
              ...(buyerInfo?.phone && { phone: buyerInfo.phone }),
            },
          },
        },
      };
    }

    // Update shipping method if provided
    if (shippingOptionId) {
      updatePayload.shippingInfo = {
        ...updatePayload.shippingInfo,
        logistics: {
          ...updatePayload.shippingInfo?.logistics,
          shippingMethod: {
            id: shippingOptionId,
          },
        },
      };
    }

    // Update checkout
    const updatedCheckout = await wixClient.checkout.updateCheckout(
      checkoutId,
      updatePayload
    );

    // Recalculate totals after update
    let calculatedTotals: any = {};
    try {
      const totalsResult = await wixClient.checkout.calculateTotals(checkoutId);
      
      // Handle different possible response structures
      if (totalsResult.totals) {
        calculatedTotals = {
          subtotal: totalsResult.totals.subtotal?.amount || "0",
          tax: totalsResult.totals.tax?.amount || "0",
          shipping: totalsResult.totals.shipping?.amount || "0",
          discount: totalsResult.totals.discount?.amount || "0",
          total: totalsResult.totals.total?.amount || "0",
        };
      } else if (totalsResult.subtotal) {
        calculatedTotals = {
          subtotal: totalsResult.subtotal?.amount || totalsResult.subtotal || "0",
          tax: totalsResult.tax?.amount || totalsResult.tax || "0",
          shipping: totalsResult.shipping?.amount || totalsResult.shipping || "0",
          discount: totalsResult.discount?.amount || totalsResult.discount || "0",
          total: totalsResult.total?.amount || totalsResult.total || "0",
        };
      } else {
        calculatedTotals = {
          subtotal: updatedCheckout.totals?.subtotal?.amount || "0",
          tax: updatedCheckout.totals?.tax?.amount || "0",
          shipping: updatedCheckout.totals?.shipping?.amount || "0",
          discount: updatedCheckout.totals?.discount?.amount || "0",
          total: updatedCheckout.totals?.total?.amount || "0",
        };
      }
    } catch (calcError: any) {
      console.warn("⚠️ Failed to recalculate totals:", calcError?.message);
      calculatedTotals = {
        subtotal: updatedCheckout.totals?.subtotal?.amount || "0",
        tax: updatedCheckout.totals?.tax?.amount || "0",
        shipping: updatedCheckout.totals?.shipping?.amount || "0",
        discount: updatedCheckout.totals?.discount?.amount || "0",
        total: updatedCheckout.totals?.total?.amount || "0",
      };
    }

    // Ensure all totals are strings
    const formatTotal = (value: any): string => {
      if (value === null || value === undefined) return "0";
      if (typeof value === "string") return value;
      if (typeof value === "number") return value.toString();
      return "0";
    };

    const finalTotals = {
      subtotal: formatTotal(calculatedTotals.subtotal),
      tax: formatTotal(calculatedTotals.tax),
      shipping: formatTotal(calculatedTotals.shipping),
      discount: formatTotal(calculatedTotals.discount),
      total: formatTotal(calculatedTotals.total),
    };

    return NextResponse.json({
      checkout: updatedCheckout,
      totals: finalTotals,
    });
  } catch (error: any) {
    console.error("❌ Checkout update error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to update checkout",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

