import { NextRequest, NextResponse } from "next/server"
import { createClient, ApiKeyStrategy } from "@wix/sdk"
import { orders, orderFulfillments } from "@wix/ecom"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      )
    }

    const wixAdminClient = createClient({
      modules: { orders },
      auth: ApiKeyStrategy({
        apiKey: process.env.WIX_API_KEY!,
        siteId: process.env.WIX_SITE_ID!,
        accountId: process.env.WIX_ACCOUNT_ID!,
      }),
    })

    const order = await wixAdminClient.orders.getOrder(orderId)

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    console.error("❌ API /orders GET error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to fetch order" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { contactId } = await req.json()

    // ❌ Never allow fallback to all orders
    if (!contactId) {
      console.error("❌ Missing contactId in request")
      return NextResponse.json({ orders: [] }, { status: 400 })
    }

    const wixAdminClient = createClient({
      modules: { orders, orderFulfillments },
      auth: ApiKeyStrategy({
        apiKey: process.env.WIX_API_KEY!,
        siteId: process.env.WIX_SITE_ID!,
        accountId: process.env.WIX_ACCOUNT_ID!,
      }),
    })

    // ✅ Use correct $eq filter
    const response = await wixAdminClient.orders.searchOrders({
      search: {
        filter: {
          "buyerInfo.contactId": { $eq: contactId },
        },
        sort: [{ fieldName: "_createdDate", order: orders.SortOrder.DESC }],
        cursorPaging: { limit: 10 },
      },
    })

    console.log("📦 contactId:", contactId, "→ Orders:", response.orders?.length)

    const baseOrders = response.orders || []

    console.log("base orders",baseOrders)
    const orderIds = baseOrders.map((o: any) => o._id)

    // Bulk fetch fulfillments for all orders
    let fulfillmentsMap: Record<string, any[]> = {}
    try {
      const multi = await wixAdminClient.orderFulfillments.listFulfillmentsForMultipleOrders(orderIds)
      console.log("multi-fulfillments raw:", JSON.stringify(multi))
      // Handle various possible shapes from SDK
      const ordersArray =
        (multi as any)?.ordersWithFulfillments ||
        (multi as any)?.orders ||
        (multi as any)?.items ||
        (multi as any)?.ordersFulfillments ||
        []
      for (const entry of ordersArray) {
        const oid = entry?.orderId || entry?._id || entry?.id
        const fuls = entry?.fulfillments || entry?.items || []
        if (oid) fulfillmentsMap[oid] = fuls
      }
    } catch (e) {
      // Fallback: empty map, tracking will be empty until fulfillments exist
      fulfillmentsMap = {}
    }

    // If bulk returned nothing, try per-order fetch (fallback)
    if (!Object.keys(fulfillmentsMap).length && orderIds.length) {
      console.log("bulk returned empty; trying per-order fulfillments")
      for (const oid of orderIds) {
        try {
          const single = await wixAdminClient.orderFulfillments.listFulfillmentsForSingleOrder(oid)
          fulfillmentsMap[oid] = (single as any)?.fulfillments || (single as any)?.items || []
        } catch (e) {
          fulfillmentsMap[oid] = []
        }
      }
    }

    // Merge tracking per order
    const enriched = baseOrders.map((ord: any) => {
      const oid = ord._id
      const fList = fulfillmentsMap[oid] || []
      const fTracks = fList
        .map((f: any) => ({
          trackingNumber: f?.trackingInfo?.trackingNumber || f?.trackingInfo?.number || null,
          shippingProvider: f?.trackingInfo?.shippingProvider || f?.trackingInfo?.carrier || null,
          trackingLink:
            f?.trackingInfo?.trackingLink ||
            (f?.trackingInfo?.trackingNumber
              ? `https://shiprocket.co/tracking/${encodeURIComponent(f.trackingInfo.trackingNumber)}`
              : null),
        }))
        .filter((t: any) => t.trackingNumber)

      // If no fulfillment tracks, also consider any direct field already present (rare)
      const sTrackNumber = ord?.shippingInfo?.trackingNumber
      const sTrack = !fTracks.length && sTrackNumber
        ? [{
            trackingNumber: sTrackNumber,
            shippingProvider: ord?.shippingInfo?.shippingProvider || null,
            trackingLink: `https://shiprocket.co/tracking/${encodeURIComponent(sTrackNumber)}`,
          }]
        : []

      // Simple order status based on fulfillment status
      let orderStatus = "Processing"
      const normalized = fList.map((f: any) => String(f?.status || "").toUpperCase())
      
      if (fList.length > 0 && normalized.some((s: string) => s)) {
        const allFulfilled = normalized.length > 0 && normalized.every((s: string) => s === "FULFILLED")
        const anyInDelivery = normalized.some((s: string) => s === "IN_DELIVERY")
        const anyFulfilled = normalized.some((s: string) => s === "FULFILLED")

        if (allFulfilled) {
          orderStatus = "Shipped"
        } else if (anyInDelivery || anyFulfilled) {
          orderStatus = "Shipped"
        } else {
          orderStatus = "Processing"
        }
      } else {
        // Fallback to order-level fulfillmentStatus when fulfillment items don't expose status
        const orderFulfillmentStatus = String(ord?.fulfillmentStatus || "").toUpperCase()
        if (orderFulfillmentStatus === "FULFILLED") {
          orderStatus = "Shipped"
        } else if (orderFulfillmentStatus === "PARTIALLY_FULFILLED" || orderFulfillmentStatus === "IN_DELIVERY") {
          orderStatus = "Shipped"
        } else {
          orderStatus = "Processing"
        }
      }
      
      return { 
        ...ord, 
        tracking: [...fTracks, ...sTrack], 
        orderStatus
      }
    })

    return NextResponse.json({ orders: enriched })
  } catch (err: any) {
    console.error("❌ API /orders error:", err?.response?.data || err)
    return NextResponse.json(
      { error: err?.message || "Failed to fetch orders" },
      { status: 500 },
    )
  }
}
