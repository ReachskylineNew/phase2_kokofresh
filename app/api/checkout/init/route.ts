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

    // Calculate totals (this includes taxes, shipping, discounts)
    let calculatedTotals: any = {};
    try {
      const totalsResult = await wixClient.checkout.calculateTotals(checkoutId);
      console.log("💰 Calculated totals result:", JSON.stringify(totalsResult, null, 2));
      
      // Handle different possible response structures
      if (totalsResult.totals) {
        calculatedTotals = {
          subtotal: totalsResult.totals.subtotal?.amount || totalsResult.totals.subtotal?.value || fallbackSubtotal,
          tax: totalsResult.totals.tax?.amount || totalsResult.totals.tax?.value || "0",
          shipping: totalsResult.totals.shipping?.amount || totalsResult.totals.shipping?.value || "0",
          discount: totalsResult.totals.discount?.amount || totalsResult.totals.discount?.value || "0",
          total: totalsResult.totals.total?.amount || totalsResult.totals.total?.value || fallbackSubtotal,
        };
      } else if (totalsResult.subtotal) {
        // Direct totals object
        calculatedTotals = {
          subtotal: totalsResult.subtotal?.amount || totalsResult.subtotal?.value || totalsResult.subtotal || fallbackSubtotal,
          tax: totalsResult.tax?.amount || totalsResult.tax?.value || totalsResult.tax || "0",
          shipping: totalsResult.shipping?.amount || totalsResult.shipping?.value || totalsResult.shipping || "0",
          discount: totalsResult.discount?.amount || totalsResult.discount?.value || totalsResult.discount || "0",
          total: totalsResult.total?.amount || totalsResult.total?.value || totalsResult.total || fallbackSubtotal,
        };
      } else {
        // Fallback to checkout totals
        calculatedTotals = {
          subtotal: checkout.totals?.subtotal?.amount || checkout.totals?.subtotal?.value || fallbackSubtotal,
          tax: checkout.totals?.tax?.amount || checkout.totals?.tax?.value || "0",
          shipping: checkout.totals?.shipping?.amount || checkout.totals?.shipping?.value || "0",
          discount: checkout.totals?.discount?.amount || checkout.totals?.discount?.value || "0",
          total: checkout.totals?.total?.amount || checkout.totals?.total?.value || fallbackSubtotal,
        };
      }
    } catch (calcError: any) {
      console.warn("⚠️ Failed to calculate totals:", calcError?.message);
      console.warn("⚠️ Error details:", calcError);
      // Fallback to basic totals from checkout or line items
      calculatedTotals = {
        subtotal: checkout.totals?.subtotal?.amount || checkout.totals?.subtotal?.value || fallbackSubtotal,
        tax: checkout.totals?.tax?.amount || checkout.totals?.tax?.value || "0",
        shipping: checkout.totals?.shipping?.amount || checkout.totals?.shipping?.value || "0",
        discount: checkout.totals?.discount?.amount || checkout.totals?.discount?.value || "0",
        total: checkout.totals?.total?.amount || checkout.totals?.total?.value || fallbackSubtotal,
      };
    }

    // If totals are still 0, use line items calculation
    if (calculatedTotals.subtotal === "0" || parseFloat(calculatedTotals.subtotal) === 0) {
      console.log("⚠️ Subtotal is 0, using line items calculation");
      calculatedTotals.subtotal = fallbackSubtotal;
      if (calculatedTotals.total === "0" || parseFloat(calculatedTotals.total) === 0) {
        calculatedTotals.total = fallbackSubtotal;
      }
    }

    console.log("✅ Final calculated totals:", calculatedTotals);

    // Get available shipping options
    let shippingOptions: any[] = [];
    try {
      const shippingMethods = await wixClient.checkout.getAvailableShippingMethods(checkoutId);
      shippingOptions = shippingMethods.shippingMethods || [];
    } catch (shippingError: any) {
      console.warn("⚠️ Failed to fetch shipping methods:", shippingError?.message);
      // Fallback to default options
      shippingOptions = [
        {
          id: "standard",
          title: "Standard Delivery",
          description: "3-5 business days",
          cost: { amount: "0", formattedAmount: "Free" },
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

