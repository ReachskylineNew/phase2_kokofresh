import { NextRequest, NextResponse } from "next/server";
import { getWixServerClient } from "@/lib/wix-server-client";

/**
 * Update checkout with buyer info and shipping address
 */
const buildShippingOptions = (checkout: any) => {
  const logistics = checkout?.shippingInfo?.logistics;
  const availableMethods = logistics?.availableShippingMethods || [];
  const options: Array<{
    id: string;
    methodId?: string;
    title: string;
    description: string;
    cost: string;
    formattedCost: string;
  }> = [];

  availableMethods.forEach((method: any) => {
    const methodId = method?.id || method?._id;
    const baseTitle = method?.title || method?.name || "Standard Shipping";
    const baseDescription =
      method?.description || method?.deliveryTime || "Standard delivery";
    const baseCost =
      method?.cost?.price ||
      method?.cost ||
      { amount: "0", formattedAmount: "Free" };

    const pushOption = (option: any, fallbackTitle?: string) => {
      const optionId = option?.id || option?._id || methodId;
      if (!optionId) return;

      const optionTitle =
        option?.title || option?.name || fallbackTitle || baseTitle;
      const optionDescription =
        option?.description ||
        option?.deliveryTime ||
        baseDescription ||
        "";

      const optionCost =
        option?.cost?.price ||
        option?.cost ||
        baseCost ||
        { amount: "0", formattedAmount: "Free" };

      const costAmount =
        optionCost?.amount ??
        optionCost?.value ??
        optionCost?.price?.amount ??
        optionCost?.price?.value ??
        "0";

      const normalizedCost =
        typeof costAmount === "number"
          ? costAmount.toString()
          : costAmount || "0";

      const formattedCost =
        optionCost?.formattedAmount ||
        optionCost?.price?.formattedAmount ||
        (Number.parseFloat(normalizedCost || "0") > 0
          ? `₹${Number.parseFloat(normalizedCost).toFixed(2)}`
          : "Free");

      options.push({
        id: optionId,
        methodId,
        title: optionTitle,
        description: optionDescription,
        cost: normalizedCost,
        formattedCost,
      });
    };

    if (Array.isArray(method?.carrierServiceOptions)) {
      method.carrierServiceOptions.forEach((option: any) =>
        pushOption(option, baseTitle)
      );
    } else {
      pushOption(method, baseTitle);
    }
  });

  if (!options.length) {
    options.push({
      id: "standard",
      title: "Standard Delivery",
      description: "3-5 business days",
      cost: "0",
      formattedCost: "Free",
    });
  }

  return options;
};

const findCarrierOptionById = (checkout: any, targetId?: string) => {
  if (!targetId) return null;
  const methods =
    checkout?.shippingInfo?.logistics?.availableShippingMethods || [];

  for (const method of methods) {
    const carrierOptions = method?.carrierServiceOptions || [];
    for (const option of carrierOptions) {
      const optionId = option?.id || option?._id;
      if (optionId && optionId === targetId) {
        return option;
      }
    }

    const methodId = method?.id || method?._id;
    if (methodId && methodId === targetId) {
      if (carrierOptions.length) {
        return carrierOptions[0];
      }
      return method;
    }
  }

  return null;
};

const findFirstCarrierOption = (checkout: any) => {
  const methods =
    checkout?.shippingInfo?.logistics?.availableShippingMethods || [];
  for (const method of methods) {
    const carrierOptions = method?.carrierServiceOptions || [];
    if (carrierOptions.length) {
      return carrierOptions[0];
    }
    if (method) {
      return method;
    }
  }
  return null;
};

const buildCostAndRegion = (
  selectedCarrierServiceOption: any,
  checkoutSnapshot: any,
  normalizeMoney: (value: any, fallbackCurrency?: string) => { amount: string; currency: string },
  shippingAddress?: any
) => {
  const selectedCost =
    selectedCarrierServiceOption?.cost ||
    (checkoutSnapshot.shippingInfo as any)?.cost ||
    {};
  const selectedCostAny: any = selectedCost || {};

  const regionSource =
    (checkoutSnapshot.shippingInfo as any)?.region ||
    (shippingAddress?.country && {
      _id: "region-" + (shippingAddress?.country || "IN").toLowerCase(),
      name: shippingAddress?.country || "India",
    });

  return {
    cost: {
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
    },
    region: {
      _id:
        regionSource?._id ||
        "region-" + (shippingAddress?.country || "IN").toLowerCase(),
      name: regionSource?.name || shippingAddress?.country || "India",
    },
  };
};

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

    let checkoutSnapshot = await wixClient.checkout.getCheckout(checkoutId);
    let pendingShippingSelectionId: string | null = null;

    if (shippingOptionId) {
      const shippingInfoPayload = ensureShippingInfo();
      const selectedCarrierServiceOption = findCarrierOptionById(
        checkoutSnapshot,
        shippingOptionId
      );

      if (selectedCarrierServiceOption) {
        const { cost, region } = buildCostAndRegion(
          selectedCarrierServiceOption,
          checkoutSnapshot,
          normalizeMoney,
          shippingAddress
        );

        shippingInfoPayload.logistics.selectedCarrierServiceOption =
          selectedCarrierServiceOption;
        shippingInfoPayload.cost = cost;
        shippingInfoPayload.region = region;
      } else {
        pendingShippingSelectionId = shippingOptionId;
        console.warn(
          "⚠️ No matching carrierServiceOption found for shippingOptionId in current snapshot, will retry after update",
          shippingOptionId
        );
      }
    }

    const updatedCheckout = await wixClient.checkout.updateCheckout(
      checkoutId,
      updatePayload
    );

    checkoutSnapshot = updatedCheckout;

    const applyCarrierSelection = async (targetId?: string) => {
      let selectedOption = targetId
        ? findCarrierOptionById(checkoutSnapshot, targetId)
        : null;

      if (!selectedOption) {
        checkoutSnapshot = await wixClient.checkout.getCheckout(checkoutId);
        selectedOption = targetId
          ? findCarrierOptionById(checkoutSnapshot, targetId)
          : null;
      }

      if (!selectedOption && !targetId) {
        selectedOption = findFirstCarrierOption(checkoutSnapshot);
      }

      if (!selectedOption) {
        if (targetId) {
          console.warn(
            "⚠️ No matching carrierServiceOption found after retry and no fallback option available",
            targetId
          );
        } else {
          console.warn(
            "⚠️ No carrierServiceOption available after checkout update",
            checkoutId
          );
        }
        return;
      }

      const { cost, region } = buildCostAndRegion(
        selectedOption,
        checkoutSnapshot,
        normalizeMoney,
        shippingAddress
      );

      await wixClient.checkout.updateCheckout(checkoutId, {
        shippingInfo: {
          logistics: {
            selectedCarrierServiceOption: selectedOption,
          },
          cost,
          region,
        } as any,
      } as any);

      checkoutSnapshot = await wixClient.checkout.getCheckout(checkoutId);
    };

    if (pendingShippingSelectionId) {
      await applyCarrierSelection(pendingShippingSelectionId);
    }

    if (
      !(checkoutSnapshot.shippingInfo as any)?.logistics
        ?.selectedCarrierServiceOption
    ) {
      await applyCarrierSelection();
    }

    // Get totals from updated checkout object (Wix SDK doesn't have calculateTotals method)
    // The checkout object uses priceSummary for totals
    const priceSummary: any = checkoutSnapshot.priceSummary || {};
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

    const shippingOptions = buildShippingOptions(checkoutSnapshot);

    const selectedShippingOptionId =
      (checkoutSnapshot.shippingInfo as any)?.logistics
        ?.selectedCarrierServiceOption?._id ||
      (checkoutSnapshot.shippingInfo as any)?.logistics
        ?.selectedCarrierServiceOption?.id ||
      "";

    return NextResponse.json({
      checkout: checkoutSnapshot,
      totals: finalTotals,
      shippingOptions,
      selectedShippingOptionId,
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

