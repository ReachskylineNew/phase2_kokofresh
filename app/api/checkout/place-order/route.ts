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

    // Always fetch checkout so we can ensure shipping is valid and, for Cashfree,
    // get the final payable amount.
    let checkout = await wixClient.checkout.getCheckout(checkoutId);

    // ------------------------------------------------------------------
    // Ensure a selectedCarrierServiceOption exists on the checkout
    // ------------------------------------------------------------------
    try {
      const logistics: any = (checkout as any).shippingInfo?.logistics;
      const selected = logistics?.selectedCarrierServiceOption;

      if (!selected) {
        const available: any[] =
          logistics?.availableShippingMethods || [];

        let selectedCarrierServiceOption: any | null = null;

        // Prefer the first available carrier service option
        for (const method of available) {
          const options = method?.carrierServiceOptions || [];
          if (options.length > 0) {
            selectedCarrierServiceOption = options[0];
            break;
          }
        }

        if (selectedCarrierServiceOption) {
          await wixClient.checkout.updateCheckout(checkoutId, {
            shippingInfo: {
              logistics: {
                selectedCarrierServiceOption,
              },
            } as any,
          } as any);

          // Refresh checkout after update
          checkout = await wixClient.checkout.getCheckout(checkoutId);
        } else {
          console.warn(
            "⚠️ No carrierServiceOptions available to auto-select for checkout",
            checkoutId
          );
        }
      }
    } catch (shippingError) {
      console.warn(
        "⚠️ Failed to auto-select carrier service option:",
        shippingError
      );
    }

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
      // Use checkout info to get final payable amount from priceSummary
      const priceSummary: any = (checkout as any).priceSummary;
      const totals: any = (checkout as any).totals;

      const rawAmount =
        priceSummary?.total?.amount ??
        priceSummary?.total?.value ??
        totals?.grandTotal?.amount;

      const amountNumber =
        typeof rawAmount === "string"
          ? parseFloat(rawAmount)
          : typeof rawAmount === "number"
            ? rawAmount
            : 0;

      const safeAmount = Number.isFinite(amountNumber) ? amountNumber : 0;

      paymentInfo = {
        paymentProvider: "CASHFREE",
        paymentMethod: "cashfree",
        paymentDetails: {
          externalTransactionId: "cashfree-" + checkoutId,
          amount: safeAmount,
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
    // CHECK FOR EXISTING ORDER (webhook might have created it)
    // -----------------------------
    try {
      const existingOrders = await wixClient.orders.searchOrders({
        search: {
          filter: {
            checkoutId: { $eq: checkoutId },
          },
          cursorPaging: { limit: 1 },
        },
      });

      if (existingOrders?.orders && existingOrders.orders.length > 0) {
        const existingOrder = existingOrders.orders[0];
        const orderId = (existingOrder as any)?._id;
        const orderNumber = (existingOrder as any)?.number;
        console.log("⚠️ Order already exists for checkout:", orderId);
        return NextResponse.json({
          success: true,
          orderId,
          orderNumber,
          order: existingOrder,
          message: "Order already exists",
        });
      }
    } catch (queryError: any) {
      console.warn("⚠️ Failed to query existing orders, proceeding with creation:", queryError.message);
    }

    // -----------------------------
    // CREATE ORDER IN WIX
    // -----------------------------
    let order: any;
    try {
      order = await wixClient.checkout.createOrder(
        checkoutId,
        paymentInfo as any
      );
    } catch (createError: any) {
      // If order creation fails due to duplicate, try to fetch existing order
      if (createError.message?.includes("already exists") || createError.message?.includes("duplicate")) {
        console.log("⚠️ Order creation failed - order may already exist, querying...");
        try {
          const existingOrders = await wixClient.orders.searchOrders({
            search: {
              filter: {
                checkoutId: { $eq: checkoutId },
              },
              cursorPaging: { limit: 1 },
            },
          });
          if (existingOrders?.orders && existingOrders.orders.length > 0) {
            const existingOrder = existingOrders.orders[0];
            const orderId = (existingOrder as any)?._id;
            const orderNumber = (existingOrder as any)?.number;
            return NextResponse.json({
              success: true,
              orderId,
              orderNumber,
              order: existingOrder,
              message: "Order already exists",
            });
          }
        } catch (queryError) {
          console.error("Failed to query existing orders after creation error:", queryError);
        }
      }
      throw createError;
    }

    // Handle different response structures from Wix
    const orderId = (order as any)?._id || (order as any)?.orderId || (order as any)?.order?._id;
    const orderNumber = (order as any)?.number || (order as any)?.order?.number;

    if (!orderId) {
      console.error("❌ Order created but no ID returned:", order);
      return NextResponse.json(
        { error: "Wix failed to create order - no order ID returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      order,
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
