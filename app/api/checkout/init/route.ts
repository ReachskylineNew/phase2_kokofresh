import { NextRequest, NextResponse } from "next/server";
import { getWixServerClient } from "@/lib/wix-server-client";

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

/**
 * Initialize checkout from current cart
 * Returns checkout ID, calculated totals, shipping options, and tax breakdown
 */
export async function POST(req: NextRequest) {
  try {
    const wixClient = await getWixServerClient();

    // Create checkout from current cart
    const { checkoutId } = await wixClient.currentCart.createCheckoutFromCurrentCart({
      channelType: "WEB",
    });

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    // Get checkout details to calculate totals
    const checkout = await wixClient.checkout.getCheckout(checkoutId);
    console.log("📦 Checkout object:", JSON.stringify(checkout, null, 2));

    // Calculate totals from line items as fallback
    let fallbackSubtotal = "0";
    if (checkout.lineItems && checkout.lineItems.length > 0) {
      fallbackSubtotal = checkout.lineItems.reduce((sum: number, item: any) => {
        const price = parseFloat(item.price?.amount || item.price?.value || "0");
        const qty = item.quantity || 1;
        return sum + price * qty;
      }, 0).toString();
      console.log("🛒 Calculated subtotal from line items:", fallbackSubtotal);
    }

    // Get totals from checkout object (Wix SDK doesn't have calculateTotals method)
    // The checkout object uses priceSummary for totals
    let calculatedTotals: any = {
      subtotal: checkout.priceSummary?.subtotal?.amount || checkout.priceSummary?.subtotal?.value || fallbackSubtotal,
      tax: checkout.priceSummary?.tax?.amount || checkout.priceSummary?.tax?.value || "0",
      shipping: checkout.priceSummary?.shipping?.amount || checkout.priceSummary?.shipping?.value || "0",
      discount: checkout.priceSummary?.discount?.amount || checkout.priceSummary?.discount?.value || "0",
      total: checkout.priceSummary?.total?.amount || checkout.priceSummary?.total?.value || fallbackSubtotal,
    };

    // If totals are still 0, use line items calculation
    if (calculatedTotals.subtotal === "0" || parseFloat(calculatedTotals.subtotal) === 0) {
      console.log("⚠️ Subtotal is 0, using line items calculation");
      calculatedTotals.subtotal = fallbackSubtotal;
      if (calculatedTotals.total === "0" || parseFloat(calculatedTotals.total) === 0) {
        calculatedTotals.total = fallbackSubtotal;
      }
    }

    console.log("✅ Final calculated totals:", calculatedTotals);

    const shippingOptions = buildShippingOptions(checkout);

    // Ensure all totals are strings (Wix returns amounts as strings)
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

    console.log("📊 Final totals being returned:", finalTotals);

    const selectedShippingOptionId =
      (checkout.shippingInfo as any)?.logistics?.selectedCarrierServiceOption?._id ||
      (checkout.shippingInfo as any)?.logistics?.selectedCarrierServiceOption?.id ||
      "";

    return NextResponse.json({
      checkoutId,
      checkout,
      totals: finalTotals,
      shippingOptions,
      selectedShippingOptionId,
      lineItems: checkout.lineItems || [],
    });
  } catch (error: any) {
    console.error("❌ Checkout init error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to initialize checkout",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

