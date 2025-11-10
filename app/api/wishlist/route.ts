import { NextRequest, NextResponse } from "next/server";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { items } from "@wix/data";
import { mockWishlistAPI } from "@/lib/mockWishlistStorage";

// Create admin client for wishlist operations
function createAdminClient() {
  return createClient({
    modules: { items },
    auth: ApiKeyStrategy({
      apiKey: process.env.WIX_API_KEY!,
      accountId: process.env.WIX_ACCOUNT_ID!,
      siteId: process.env.WIX_SITE_ID!,
    }),
  });
}

// GET - Fetch wishlist items for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
    }

    console.log("📋 Fetching wishlist for contactId:", contactId);

    // Mock mode for testing - Enable by default since collection doesn't exist
    if (process.env.USE_MOCK_WISHLIST === "true" || !process.env.WIX_API_KEY) {
      console.log("🧪 Using mock mode for wishlist GET");
      const wishlist = mockWishlistAPI.getWishlist(contactId);
      return NextResponse.json({ wishlist });
    }

    // Try to check if collection exists first, fallback to mock mode
    try {
      const wixAdminClient = createAdminClient();
      const testQuery = wixAdminClient.items.query("wishlist").limit(1);
      await testQuery.find();
    } catch (collectionError: any) {
      if (collectionError.message?.includes("WDE0025") || collectionError.message?.includes("does not exist")) {
        console.log("🧪 Collection doesn't exist, falling back to mock mode for GET");
        const wishlist = mockWishlistAPI.getWishlist(contactId);
        return NextResponse.json({ wishlist });
      }
      throw collectionError; // Re-throw if it's a different error
    }

    // Check env vars
    if (!process.env.WIX_API_KEY || !process.env.WIX_ACCOUNT_ID || !process.env.WIX_SITE_ID) {
      console.error("❌ Missing Wix env variables");
      return NextResponse.json(
        { error: "Wix API credentials missing. Check .env.local" },
        { status: 500 }
      );
    }

    const wixAdminClient = createAdminClient();

    // Query wishlist items for the specific contact
    const query = wixAdminClient.items
      .query("wishlist")
      .eq("contactId", contactId)
      .ascending("_createdDate");

    const { items: wishlistItems } = await query.find();

    console.log("✅ Fetched wishlist items:", wishlistItems?.length || 0);

    return NextResponse.json({ wishlist: wishlistItems || [] });
  } catch (err: any) {
    console.error("❌ API /wishlist GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(req: NextRequest) {
  try {
    const { contactId, productId, productName, price, image, quantity = 1, catalogReference } = await req.json();

    if (!contactId || !productId) {
      return NextResponse.json(
        { error: "Missing required fields: contactId, productId" },
        { status: 400 }
      );
    }

    console.log("💝 Adding to wishlist:", { contactId, productId, productName });

    // Mock mode for testing - Enable by default since collection doesn't exist
    if (process.env.USE_MOCK_WISHLIST === "true" || !process.env.WIX_API_KEY) {
      console.log("🧪 Using mock mode for wishlist POST");
      
      // Check if item already exists
      if (mockWishlistAPI.itemExists(contactId, productId)) {
        return NextResponse.json(
          { error: "Item already in wishlist" },
          { status: 409 }
        );
      }
      
      const newItem = mockWishlistAPI.addToWishlist({
        contactId,
        productId,
        productName: productName || "Sample Product",
        price: price || { amount: "299.00", formattedAmount: "₹299.00" },
        image: image || { url: "/placeholder.svg" },
        quantity,
        catalogReference: catalogReference || {
          appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
          catalogItemId: productId
        }
      });
      
      return NextResponse.json({ success: true, item: newItem });
    }

    // Try to check if collection exists first, fallback to mock mode
    try {
      const wixAdminClient = createAdminClient();
      const testQuery = wixAdminClient.items.query("wishlist").limit(1);
      await testQuery.find();
    } catch (collectionError: any) {
      if (collectionError.message?.includes("WDE0025") || collectionError.message?.includes("does not exist")) {
        console.log("🧪 Collection doesn't exist, falling back to mock mode");
        
        // Check if item already exists
        if (mockWishlistAPI.itemExists(contactId, productId)) {
          return NextResponse.json(
            { error: "Item already in wishlist" },
            { status: 409 }
          );
        }
        
        const newItem = mockWishlistAPI.addToWishlist({
          contactId,
          productId,
          productName: productName || "Sample Product",
          price: price || { amount: "299.00", formattedAmount: "₹299.00" },
          image: image || { url: "/placeholder.svg" },
          quantity,
          catalogReference: catalogReference || {
            appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
            catalogItemId: productId
          }
        });
        
        return NextResponse.json({ success: true, item: newItem });
      }
      throw collectionError; // Re-throw if it's a different error
    }

    // Check env vars
    if (!process.env.WIX_API_KEY || !process.env.WIX_ACCOUNT_ID || !process.env.WIX_SITE_ID) {
      console.error("❌ Missing Wix env variables");
      return NextResponse.json(
        { error: "Wix API credentials missing. Check .env.local" },
        { status: 500 }
      );
    }

    const wixAdminClient = createAdminClient();

    // Check if item already exists in wishlist
    const existingQuery = wixAdminClient.items
      .query("wishlist")
      .eq("contactId", contactId)
      .eq("productId", productId);

    const { items: existingItems } = await existingQuery.find();

    if (existingItems && existingItems.length > 0) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 409 }
      );
    }

    // Create new wishlist item
    const wishlistItem = {
      contactId,
      productId,
      productName: productName || "",
      price: price || { amount: "0.00", formattedAmount: "₹0.00" },
      image: image || { url: "/placeholder.svg" },
      quantity,
      catalogReference: catalogReference || {
        appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
        catalogItemId: productId
      },
      addedDate: new Date().toISOString()
    };

    const createdItem = await wixAdminClient.items.createItem("wishlist", wishlistItem);

    console.log("✅ Added to wishlist:", createdItem._id);

    return NextResponse.json({ success: true, item: createdItem });
  } catch (err: any) {
    console.error("❌ API /wishlist POST error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const { contactId, itemId } = await req.json();

    if (!contactId || !itemId) {
      return NextResponse.json(
        { error: "Missing required fields: contactId, itemId" },
        { status: 400 }
      );
    }

    console.log("🗑️ Removing from wishlist:", { contactId, itemId });

    // Mock mode for testing - Enable by default since collection doesn't exist
    if (process.env.USE_MOCK_WISHLIST === "true" || !process.env.WIX_API_KEY) {
      console.log("🧪 Using mock mode for wishlist DELETE");
      const removed = mockWishlistAPI.removeFromWishlist(contactId, itemId);
      if (!removed) {
        return NextResponse.json(
          { error: "Item not found or unauthorized" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: "Item removed from wishlist" });
    }

    // Try to check if collection exists first, fallback to mock mode
    try {
      const wixAdminClient = createAdminClient();
      const testQuery = wixAdminClient.items.query("wishlist").limit(1);
      await testQuery.find();
    } catch (collectionError: any) {
      if (collectionError.message?.includes("WDE0025") || collectionError.message?.includes("does not exist")) {
        console.log("🧪 Collection doesn't exist, falling back to mock mode for DELETE");
        const removed = mockWishlistAPI.removeFromWishlist(contactId, itemId);
        if (!removed) {
          return NextResponse.json(
            { error: "Item not found or unauthorized" },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, message: "Item removed from wishlist" });
      }
      throw collectionError; // Re-throw if it's a different error
    }

    // Check env vars
    if (!process.env.WIX_API_KEY || !process.env.WIX_ACCOUNT_ID || !process.env.WIX_SITE_ID) {
      console.error("❌ Missing Wix env variables");
      return NextResponse.json(
        { error: "Wix API credentials missing. Check .env.local" },
        { status: 500 }
      );
    }

    const wixAdminClient = createAdminClient();

    // Verify the item belongs to the contact before deleting
    const item = await wixAdminClient.items.getItem("wishlist", itemId);
    
    if (!item || item.contactId !== contactId) {
      return NextResponse.json(
        { error: "Item not found or unauthorized" },
        { status: 404 }
      );
    }

    await wixAdminClient.items.removeItem("wishlist", itemId);

    console.log("✅ Removed from wishlist:", itemId);

    return NextResponse.json({ success: true, message: "Item removed from wishlist" });
  } catch (err: any) {
    console.error("❌ API /wishlist DELETE error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
