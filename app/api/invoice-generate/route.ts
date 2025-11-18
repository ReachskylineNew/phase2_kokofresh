import { NextRequest, NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { createClient, ApiKeyStrategy } from "@wix/sdk"
import { orders } from "@wix/ecom"

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    if (!orderId)
      return NextResponse.json({ error: "orderId required" }, { status: 400 })

    // 🔐 Connect to Wix API
    const wixClient = createClient({
      modules: { orders },
      auth: ApiKeyStrategy({
        apiKey: process.env.WIX_API_KEY!,
        siteId: process.env.WIX_SITE_ID!,
        accountId: process.env.WIX_ACCOUNT_ID!,
      }),
    })

    // 🧾 Fetch Order Details
    const orderDetails = await wixClient.orders.getOrder(orderId)
    if (!orderDetails)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const order = orderDetails

    // 🏢 Company Info
    const company = {
      name: "KOKO Fresh - Forgotten Recipes",
      address1: "112, 5th Cross Road",
      address2: "Bengaluru, Karnataka, India",
      phone: "+91 7892776610",
      email: "help@chinmaybhatk.wixsite.com/flavorzapp",
      gst: "29AALCC8084A1ZH",
      cin: "U56290KA2024PTC187789",
      fssai: "11224999000767",
    }

    // 👤 Customer Info
    const contact =
      order.shippingInfo?.logistics?.shippingDestination?.contactDetails ||
      order.billingInfo?.contactDetails
    const address =
      order.shippingInfo?.logistics?.shippingDestination?.address ||
      order.billingInfo?.address

    const customer = {
      name:
        `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() ||
        "Customer",
      email: order.buyerInfo?.email || "Email not available",
      phone: contact?.phone || "",
      address: [
        address?.addressLine1,
        address?.city,
        address?.subdivisionFullname,
        address?.postalCode,
        address?.countryFullname,
      ]
        .filter(Boolean)
        .join(", "),
    }

    // 🛍️ Line Items
    const items =
      order.lineItems?.map((item) => ({
        name: item.productName?.original || "Product",
        sku: item.physicalProperties?.sku || "",
        qty: item.quantity || 1,
        price: parseFloat(item.price?.amount || 0),
        total: parseFloat(item.totalPriceAfterTax?.amount || 0),
        weight:
          item.descriptionLines?.find((l) =>
            l.name?.original?.toLowerCase().includes("weight")
          )?.plainText?.original || "",
      })) || []

    const subtotal = parseFloat(order.priceSummary?.subtotal?.amount || 0)
    const tax = parseFloat(order.priceSummary?.tax?.amount || 0)
    const total = parseFloat(order.priceSummary?.total?.amount || 0)
    const paid = parseFloat(order.balanceSummary?.paid?.amount || 0)
    const balance = total - paid

    // 📄 Create PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const draw = (
      text: string,
      x: number,
      y: number,
      size = 11,
      boldText = false
    ) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: boldText ? bold : font,
        color: rgb(0, 0, 0),
      })
    }

    let y = height - 50

    // ---- Header ----
    draw(`Tax Invoice #${order.number}`, 50, y, 16, true)
    y -= 20
    draw(`Invoice for order: #${order.number}`, 50, y)
    y -= 15
    draw(`Issue Date: ${new Date(order._createdDate).toLocaleDateString()}`, 50, y)
    draw(`Due Date: ${new Date(order._createdDate).toLocaleDateString()}`, 300, y)
    y -= 25

    // ---- Company Info ----
    draw(company.name, 50, y, 12, true)
    draw(company.address1, 50, y - 15)
    draw(company.address2, 50, y - 30)
    draw(company.email, 50, y - 45)
    draw(`Phone: ${company.phone}`, 50, y - 60)
    draw(`Company ID: ${company.cin}`, 50, y - 75)

    // ---- Customer ----
    y -= 100
    draw("Bill To:", 50, y, 12, true)
    draw(customer.name, 50, y - 15)
    draw(customer.address, 50, y - 30)
    draw(customer.email, 50, y - 45)
    draw(`Phone: ${customer.phone}`, 50, y - 60)
    y -= 90

    // ---- Product Table ----
    draw("Product or Service", 50, y, 11, true)
    draw("Quantity", 300, y, 11, true)
    draw("Price", 380, y, 11, true)
    draw("Line Total", 460, y, 11, true)
    y -= 15

    items.forEach((item) => {
      draw(item.name, 50, y)
      draw(
        item.weight
          ? `SKU: ${item.sku}, weight: ${item.weight}`
          : `SKU: ${item.sku}`,
        50,
        y - 12,
        9
      )
      draw(String(item.qty), 310, y)
      draw(`INR ${item.price.toFixed(2)}`, 380, y)
      draw(`INR ${item.total.toFixed(2)}`, 460, y)
      y -= 28
    })

    // ---- Totals ----
    y -= 10
    draw(`Subtotal INR ${subtotal.toFixed(2)}`, 400, y)
    y -= 15
    draw(`Tax (0%) INR ${tax.toFixed(2)}`, 400, y)
    y -= 15
    draw(`Invoice Total INR ${total.toFixed(2)}`, 400, y, 12, true)
    y -= 15
    draw(`Amount Paid INR ${paid.toFixed(2)}`, 400, y)
    y -= 15
    draw(`Balance Due INR ${balance.toFixed(2)}`, 400, y)

    // ---- Payments ----
    y -= 40
    draw(`Payments received (${order.payments?.length || 1})`, 50, y, 11, true)
    y -= 15
    draw(
      `${new Date(order._createdDate).toLocaleDateString()} — ${
        order._id.slice(0, 8)
      } INR ${paid.toFixed(2)}`,
      50,
      y
    )

    // ---- Footer ----
    y -= 40
    draw("Thanks for your purchase!", 50, y)
    y -= 15
    draw("Keep shopping with us!", 50, y)
    y -= 20
    draw(`GSTN : ${company.gst}`, 50, y)
    draw(`CIN : ${company.cin}`, 50, y - 15)
    draw(`FSSAI License : ${company.fssai}`, 50, y - 30)
    draw("Any Queries? - help@chinmaybhatk.wixsite.com/flavorzapp", 50, y - 45)

    // ---- Save & Return ----
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${order.number}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("❌ Error generating invoice PDF:", error)
    return NextResponse.json(
      { error: error.message || "Unable to generate invoice PDF" },
      { status: 500 }
    )
  }
}
