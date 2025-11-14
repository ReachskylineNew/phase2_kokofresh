import { NextRequest, NextResponse } from "next/server";
import { getWixServerClient } from "@/lib/wix-server-client";

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

    // Get available shipping options from checkout
    // Wix SDK doesn't have getAvailableShippingMethods, so we use checkout shipping info
    let shippingOptions: any[] = [];
    
    // Try to get shipping methods from checkout object
    if (checkout.shippingInfo?.logistics?.availableShippingMethods) {
      shippingOptions = checkout.shippingInfo.logistics.availableShippingMethods.map((method: any) => ({
        id: method.id || method._id,
        title: method.title || method.name || "Standard Shipping",
        description: method.description || method.deliveryTime || "",
        cost: method.cost?.amount || "0",
        formattedCost: method.cost?.formattedAmount || "Free",
      }));
    } else {
      // Fallback to default options if not available
      shippingOptions = [
        {
          id: "standard",
          title: "Standard Delivery",
          description: "3-5 business days",
          cost: "0",
          formattedCost: "Free",
        },
      ];
    }

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

    return NextResponse.json({
      checkoutId,
      checkout,
      totals: finalTotals,
      shippingOptions: shippingOptions.map((option) => ({
        id: option.id || option._id,
        title: option.title || option.name || "Standard Shipping",
        description: option.description || option.deliveryTime || "",
        cost: option.cost?.amount || "0",
        formattedCost: option.cost?.formattedAmount || "Free",
      })),
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

