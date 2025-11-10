import { NextResponse, NextRequest } from "next/server";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { products as productsModule } from "@wix/stores";

// Mock data for development when Wix API is not configured
const mockProducts = [
  {
    _id: "1",
    name: "Garam Masala",
    priceData: { price: 299, currency: "INR", formatted: { price: "₹299" } },
    media: {
      mainMedia: { image: { url: "/colorful-masala-spice-blend-in-wooden-bowl.jpg" } },
      items: [{ image: { url: "/colorful-masala-spice-blend-in-wooden-bowl.jpg" } }]
    },
    description: "Premium garam masala blend with authentic Indian spices",
    slug: "garam-masala",
    stock: { inStock: true },
    productType: "Spice Blend"
  },
  {
    _id: "2",
    name: "Biryani Masala",
    priceData: { price: 349, currency: "INR", formatted: { price: "₹349" } },
    media: {
      mainMedia: { image: { url: "/instant-spice-mix-packets-arranged-aesthetically.jpg" } },
      items: [{ image: { url: "/instant-spice-mix-packets-arranged-aesthetically.jpg" } }]
    },
    description: "Special biryani masala for authentic Hyderabadi taste",
    slug: "biryani-masala",
    stock: { inStock: true },
    productType: "Spice Blend"
  },
  {
    _id: "3",
    name: "Mint Chutney",
    priceData: { price: 199, currency: "INR", formatted: { price: "₹199" } },
    media: {
      mainMedia: { image: { url: "/green-mint-chutney-in-glass-jar-with-fresh-herbs.jpg" } },
      items: [{ image: { url: "/green-mint-chutney-in-glass-jar-with-fresh-herbs.jpg" } }]
    },
    description: "Fresh mint chutney made with traditional recipe",
    slug: "mint-chutney",
    stock: { inStock: true },
    productType: "Chutney"
  }
];

// ✅ Revalidate every 60 seconds (adjust as needed)
export const revalidate = 60;

// ✅ Prevent build-time caching
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.WIX_API_KEY;
    const siteId = process.env.WIX_SITE_ID;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If no API keys configured → fallback to mock data
    if (!apiKey || !siteId) {
      console.log("⚠️ Using mock data - Wix API keys not configured");

      if (id) {
        const product = mockProducts.find(p => p._id === id || p.slug === id);
        if (!product) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json({ product });
      }

      return NextResponse.json({ products: mockProducts });
    }

    const wixClient = createClient({
      modules: { products: productsModule },
      auth: ApiKeyStrategy({ siteId, apiKey }),
    });

    // ✅ If id → fetch single product
    if (id) {
      let product: any;
      try {
        // Try by ID
        product = await wixClient.products.getProduct(id);
      } catch {
        // Try by slug
        const q = await wixClient.products
          .queryProducts()
          .eq("slug", id)
          .limit(1)
          .find();

        if (!q?.items?.length) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        product = q.items[0];
      }

      return NextResponse.json({ product });
    }

    // ✅ Otherwise → fetch all products
    const query = await wixClient.products.queryProducts().find();
    return NextResponse.json({ products: query.items ?? [] });
  } catch (error: any) {
    console.error("❌ Product API error:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
