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

    const ensureShippingInfo = () => {
      if (!updatePayload.shippingInfo) {
        updatePayload.shippingInfo = {};
      }
      const shippingInfoPayload = updatePayload.shippingInfo as any;
      if (!shippingInfoPayload.logistics) {
        shippingInfoPayload.logistics = {};
      }
      return shippingInfoPayload;
    };

    const normalizeMoney = (value: any, fallbackCurrency = "INR") => {
      if (!value) return { amount: "0", currency: fallbackCurrency };
      if (typeof value === "number") {
        return { amount: value.toString(), currency: fallbackCurrency };
      }
      if (typeof value === "string") {
        return { amount: value, currency: fallbackCurrency };
      }
      return {
        amount: (value.amount ?? value.value ?? 0).toString(),
        currency: value.currency || fallbackCurrency,
      };
    };

    // Add shipping address if provided
    if (shippingAddress) {
      const countryRaw = (shippingAddress.country || "").trim();
      const countryUpper = countryRaw.toUpperCase();
      const isIndia =
        !countryUpper ||
        countryUpper === "IN" ||
        countryUpper === "IND" ||
        countryUpper === "INDIA";

      if (!isIndia) {
        return NextResponse.json(
          {
            error:
              "We currently ship only within India. Please enter an Indian shipping address.",
          },
          { status: 400 }
        );
      }

      const countryCode = "IN";
      const countryName = countryRaw || "India";

      const shippingInfoPayload = ensureShippingInfo();
      shippingInfoPayload.logistics.shippingDestination = {
        address: {
          addressLine1: shippingAddress.line1,
          addressLine2: shippingAddress.line2 || "",
          city: shippingAddress.city,
          subdivision: shippingAddress.region,
          postalCode: shippingAddress.postalCode,
          country: countryCode,
        },
        contactDetails: {
          ...(buyerInfo?.firstName && { firstName: buyerInfo.firstName }),
          ...(buyerInfo?.lastName && { lastName: buyerInfo.lastName }),
          ...(buyerInfo?.phone && { phone: buyerInfo.phone }),
          ...(buyerInfo?.email && { email: buyerInfo.email }),
        },
      };

      shippingInfoPayload.region = {
        _id:
          (shippingInfoPayload.region?._id as string | undefined) ||
          "region-" + countryCode.toLowerCase(),
        name:
          (shippingInfoPayload.region?.name as string | undefined) ||
          countryName,
      };
    }

    // Update shipping method / selected carrier service option if provided
    if (shippingOptionId) {
      const shippingInfoPayload = ensureShippingInfo();

      const checkout = await wixClient.checkout.getCheckout(checkoutId);
      const logistics = (checkout.shippingInfo as any)?.logistics || {};
      const availableMethods = logistics.availableShippingMethods || [];

      let selectedCarrierServiceOption: any | null = null;
      let selectedMethod: any | null = null;

      for (const method of availableMethods) {
        const options = method?.carrierServiceOptions || [];
        const optionMatch = options.find(
          (opt: any) => opt?.id === shippingOptionId || opt?._id === shippingOptionId
        );
        if (optionMatch) {
          selectedCarrierServiceOption = optionMatch;
          selectedMethod = method;
          break;
        }
        if (method?.id === shippingOptionId || method?._id === shippingOptionId) {
          selectedMethod = method;
          if (options.length) {
            selectedCarrierServiceOption = options[0];
          }
          break;
        }
      }

      if (!selectedCarrierServiceOption && selectedMethod?.carrierServiceOptions?.length) {
        selectedCarrierServiceOption = selectedMethod.carrierServiceOptions[0];
      }

      if (!selectedCarrierServiceOption) {
        console.warn(
          "⚠️ No matching carrierServiceOption found for shippingOptionId",
          shippingOptionId
        );
      } else {
        shippingInfoPayload.logistics.selectedCarrierServiceOption =
          selectedCarrierServiceOption;

        const selectedCost =
          selectedCarrierServiceOption.cost ||
          selectedMethod?.cost ||
          (checkout.shippingInfo as any)?.cost ||
          {};
        const selectedCostAny: any = selectedCost || {};

        shippingInfoPayload.cost = {
          price: normalizeMoney(selectedCostAny.price || selectedCostAny),
          totalPriceBeforeTax: normalizeMoney(
            selectedCostAny.totalPriceBeforeTax || selectedCostAny
          ),
          totalPriceAfterTax: normalizeMoney(
            selectedCostAny.totalPriceAfterTax || selectedCostAny
          ),
          totalDiscount: normalizeMoney(selectedCostAny.totalDiscount),
          taxDetails: {
            totalTax: normalizeMoney(
              selectedCostAny.taxDetails?.totalTax,
              selectedCostAny.price?.currency || "INR"
            ),
          },
        };

        shippingInfoPayload.region = {
          _id:
            (checkout.shippingInfo as any)?.region?._id ||
            "region-" + (shippingAddress?.country || "IN").toLowerCase(),
          name:
            (checkout.shippingInfo as any)?.region?.name ||
            (shippingAddress?.country || "India"),
        };
      }
    }

    // Update checkout
    const updatedCheckout = await wixClient.checkout.updateCheckout(
      checkoutId,
      updatePayload
    );

    // Get totals from updated checkout object (Wix SDK doesn't have calculateTotals method)
    // The checkout object uses priceSummary for totals
    const priceSummary: any = updatedCheckout.priceSummary || {};
    const readMoney = (money: any) => {
      if (!money) return "0";
      if (typeof money === "number" || typeof money === "string") return money.toString();
      return (money.amount ?? money.value ?? 0).toString();
    };

    const calculatedTotals = {
      subtotal: readMoney(priceSummary.subtotal),
      tax: readMoney(priceSummary.tax),
      shipping: readMoney(priceSummary.shipping),
      discount: readMoney(priceSummary.discount),
      total: readMoney(priceSummary.total),
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

