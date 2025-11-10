import { NextResponse, NextRequest } from "next/server";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { collections as collectionsModule } from "@wix/stores"; // ✅ Import collections module

// ✅ Revalidate every 60 seconds (optional)
export const revalidate = 60;

// ✅ Prevent build-time caching
export const dynamic = "force-dynamic";

// Mock fallback for local development
const mockCategories = [
  {
    _id: "1",
    name: "Everyday Kitchen Rituals",
    slug: "everyday-kitchen-rituals",
  },
  {
    _id: "2",
    name: "Single Origin Spices",
    slug: "single-origin-spices",
  },
  {
    _id: "3",
    name: "Power Foods",
    slug: "nutri-pack",
  },
  {
    _id: "4",
    name: "Everyday Kitchen Powders",
    slug: "everyday-kitchen-powders",
  },
  {
    _id: "5",
    name: "Signature Blends",
    slug: "signature-blends",
  },
];

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.WIX_API_KEY;
    const siteId = process.env.WIX_SITE_ID;

    // If no keys → return mock data
    if (!apiKey || !siteId) {
      console.log("⚠️ Using mock categories - Wix API keys not configured");
      return NextResponse.json({ categories: mockCategories });
    }

    // ✅ Initialize Wix SDK client
    const wixClient = createClient({
      modules: { collections: collectionsModule },
      auth: ApiKeyStrategy({ siteId, apiKey }),
    });

    // ✅ Fetch all collections (categories)
    const query = await wixClient.collections.queryCollections().find();

    // Format response
    const categories = (query.items || []).map((c: any) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
    }));

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("❌ Categories API error:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
