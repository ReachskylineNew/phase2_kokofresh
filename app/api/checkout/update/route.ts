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

    // Update shipping method / selected carrier service option if provided
    if (shippingOptionId) {
      // Always ensure shippingInfo + logistics objects exist so we can safely extend them
      if (!updatePayload.shippingInfo) {
        updatePayload.shippingInfo = {};
      }
      if (!updatePayload.shippingInfo.logistics) {
        updatePayload.shippingInfo.logistics = {};
      }

      // Fetch current checkout so we can find the matching carrierServiceOption
      const checkout = await wixClient.checkout.getCheckout(checkoutId);
      const availableMethods =
        checkout.shippingInfo?.logistics?.availableShippingMethods || [];

      // A shippingOptionId might refer either to the method id or the carrierServiceOption id.
      // 1) Try to match by carrierServiceOption id
      let selectedCarrierServiceOption: any | null = null;
      for (const method of availableMethods) {
        const options = method?.carrierServiceOptions || [];
        const matchByOption = options.find(
          (opt: any) => opt?.id === shippingOptionId
        );
        if (matchByOption) {
          selectedCarrierServiceOption = matchByOption;
          break;
        }
      }

      // 2) If not found, try to match by method id and pick its first carrierServiceOption
      if (!selectedCarrierServiceOption) {
        const methodMatch = availableMethods.find(
          (m: any) => m?.id === shippingOptionId || m?._id === shippingOptionId
        );
        if (methodMatch?.carrierServiceOptions?.length) {
          selectedCarrierServiceOption = methodMatch.carrierServiceOptions[0];
        }
      }

      if (!selectedCarrierServiceOption) {
        console.warn(
          "⚠️ No matching carrierServiceOption found for shippingOptionId",
          shippingOptionId
        );
      } else {
        updatePayload.shippingInfo.logistics.selectedCarrierServiceOption =
          selectedCarrierServiceOption;
      }
    }

    // Update checkout
    const updatedCheckout = await wixClient.checkout.updateCheckout(
      checkoutId,
      updatePayload
    );

    // Get totals from updated checkout object (Wix SDK doesn't have calculateTotals method)
    // The checkout object uses priceSummary for totals
    const calculatedTotals = {
      subtotal: updatedCheckout.priceSummary?.subtotal?.amount || updatedCheckout.priceSummary?.subtotal?.value || "0",
      tax: updatedCheckout.priceSummary?.tax?.amount || updatedCheckout.priceSummary?.tax?.value || "0",
      shipping: updatedCheckout.priceSummary?.shipping?.amount || updatedCheckout.priceSummary?.shipping?.value || "0",
      discount: updatedCheckout.priceSummary?.discount?.amount || updatedCheckout.priceSummary?.discount?.value || "0",
      total: updatedCheckout.priceSummary?.total?.amount || updatedCheckout.priceSummary?.total?.value || "0",
    };

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

