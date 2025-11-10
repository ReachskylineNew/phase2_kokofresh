import { NextRequest, NextResponse } from "next/server";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { items } from "@wix/data";

// Test endpoint to check wishlist functionality
export async function GET(req: NextRequest) {
  try {
    console.log("🧪 Testing wishlist setup...");
    
    // Check environment variables
    const hasApiKey = !!process.env.WIX_API_KEY;
    const hasAccountId = !!process.env.WIX_ACCOUNT_ID;
    const hasSiteId = !!process.env.WIX_SITE_ID;
    
    console.log("🔧 Environment check:", {
      hasApiKey,
      hasAccountId,
      hasSiteId,
      apiKeyLength: process.env.WIX_API_KEY?.length || 0
    });

    if (!hasApiKey || !hasAccountId || !hasSiteId) {
      return NextResponse.json({
        error: "Missing Wix environment variables",
        details: { hasApiKey, hasAccountId, hasSiteId },
        suggestion: "Enable mock mode by setting USE_MOCK_WISHLIST=true"
      }, { status: 500 });
    }

    // Try to create admin client and test connection
    const wixAdminClient = createClient({
      modules: { items },
      auth: ApiKeyStrategy({
        apiKey: process.env.WIX_API_KEY!,
        accountId: process.env.WIX_ACCOUNT_ID!,
        siteId: process.env.WIX_SITE_ID!,
      }),
    });

    // Test querying the wishlist collection
    try {
      const query = wixAdminClient.items.query("wishlist").limit(1);
      const { items: testItems } = await query.find();
      
      return NextResponse.json({
        success: true,
        message: "Wishlist collection is accessible",
        testItems: testItems?.length || 0,
        collectionExists: true
      });
    } catch (collectionError: any) {
      console.error("❌ Collection access error:", collectionError);
      
      return NextResponse.json({
        success: false,
        error: "Wishlist collection not accessible",
        details: collectionError.message,
        suggestion: "Create 'wishlist' collection in Wix Data or enable mock mode"
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error("❌ Test endpoint error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
      suggestion: "Check Wix API credentials and enable mock mode if needed"
    }, { status: 500 });
  }
}

// Test POST to check if we can create items
export async function POST(req: NextRequest) {
  try {
    const testData = {
      contactId: "test-contact-123",
      productId: "test-product-456",
      productName: "Test Product",
      price: { amount: "100.00", formattedAmount: "₹100.00" },
      image: { url: "/placeholder.svg" },
      quantity: 1,
      catalogReference: {
        appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
        catalogItemId: "test-product-456"
      },
      addedDate: new Date().toISOString()
    };

    console.log("🧪 Testing wishlist item creation...");

    if (!process.env.WIX_API_KEY || !process.env.WIX_ACCOUNT_ID || !process.env.WIX_SITE_ID) {
      return NextResponse.json({
        success: false,
        error: "Missing Wix environment variables",
        suggestion: "Enable mock mode by setting USE_MOCK_WISHLIST=true"
      }, { status: 500 });
    }

    const wixAdminClient = createClient({
      modules: { items },
      auth: ApiKeyStrategy({
        apiKey: process.env.WIX_API_KEY!,
        accountId: process.env.WIX_ACCOUNT_ID!,
        siteId: process.env.WIX_SITE_ID!,
      }),
    });

    try {
      const createdItem = await wixAdminClient.items.createItem("wishlist", testData);
      
      return NextResponse.json({
        success: true,
        message: "Successfully created test wishlist item",
        item: createdItem
      });
    } catch (createError: any) {
      console.error("❌ Item creation error:", createError);
      
      return NextResponse.json({
        success: false,
        error: "Failed to create wishlist item",
        details: createError.message,
        suggestion: "Check if 'wishlist' collection exists in Wix Data"
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error("❌ Test POST error:", err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
