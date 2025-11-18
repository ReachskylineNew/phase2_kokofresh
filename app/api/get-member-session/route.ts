import { NextRequest, NextResponse } from "next/server";

/**
 * Decode JWT token (session token) to extract payload
 * Server-side: Uses Buffer for base64 decoding
 */
function decodeJWT(token: string): any {
  try {
    // JWT format: header.payload.signature (JWS format)
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    // Decode the payload (second part) using Buffer (Node.js server-side)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decodedPayload = Buffer.from(paddedPayload, "base64").toString("utf-8");
    const parsed = JSON.parse(decodedPayload);
    
    // The data field is JSON-encoded, so parse it
    if (parsed.data && typeof parsed.data === 'string') {
      parsed.data = JSON.parse(parsed.data);
    }
    
    return parsed;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Get current member using session token
 * Decodes the JWT session token to extract member ID, then fetches member data
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 400 }
      );
    }

    // Clean up token
    let cleanToken = sessionToken;
    try {
      cleanToken = JSON.parse(sessionToken);
      if (typeof cleanToken !== "string") {
        cleanToken = sessionToken;
      }
    } catch {
      cleanToken = sessionToken;
    }
    cleanToken = cleanToken.trim().replace(/^["']|["']$/g, "");

    // Remove "JWS." prefix if present
    if (cleanToken.startsWith("JWS.")) {
      cleanToken = cleanToken.replace("JWS.", "");
    }

    console.log("🔄 Decoding session token to extract member info...");

    // Decode the JWT to get member information
    const decoded = decodeJWT(cleanToken);
    if (!decoded || !decoded.data) {
      return NextResponse.json(
        { error: "Invalid session token format" },
        { status: 400 }
      );
    }

    // Parse the data field (it's JSON-encoded)
    let sessionData;
    try {
      sessionData = typeof decoded.data === "string" 
        ? JSON.parse(decoded.data) 
        : decoded.data;
    } catch {
      sessionData = decoded.data;
    }

    const memberId = sessionData.id;
    const contactId = sessionData.contactId;
    const siteId = sessionData.metaSiteId || process.env.WIX_SITE_ID;

    console.log("📋 Extracted from session token:", {
      memberId,
      contactId,
      siteId: siteId?.substring(0, 8) + "...",
    });

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID not found in session token" },
        { status: 400 }
      );
    }

    // Option 1: Try to get member by ID using Wix SDK Admin API
    try {
      const apiKey = process.env.WIX_API_KEY;
      const accountId = process.env.WIX_ACCOUNT_ID;

      if (apiKey && accountId && siteId) {
        // Use Wix SDK Admin client to get member
        const { createClient, ApiKeyStrategy } = await import("@wix/sdk");
        const { members } = await import("@wix/members");
        
        const adminClient = createClient({
          modules: { members },
          auth: ApiKeyStrategy({
            apiKey,
            accountId,
            siteId,
          }),
        });

        const member = await adminClient.members.getMember(memberId);
        if (member) {
          console.log("✅ Successfully got member using Admin SDK");
          return NextResponse.json({ member });
        }
      } else {
        console.warn("⚠️ Missing Wix Admin API credentials, falling back to session token data");
      }
    } catch (adminError: any) {
      console.warn("Admin SDK error:", adminError?.message || adminError);
      // Continue to fallback
    }

    // Option 2: Return member data from session token + fetch contact details
    // Get contact details using the contactId from the session token
    let contactDetails = null;
    if (contactId) {
      try {
        const contactResponse = await fetch(`${req.nextUrl.origin}/api/contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contactId }),
        });

        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          contactDetails = contactData.contact;
        }
      } catch (contactError) {
        console.warn("Failed to fetch contact details:", contactError);
      }
    }

    // Return member data combining session token info and contact details
    console.log("✅ Returning member data from session token");
    return NextResponse.json({
      member: {
        _id: memberId,
        id: memberId,
        contactId: contactId,
        loggedIn: true,
        owner: sessionData.owner || false,
        admin: sessionData.admin || false,
        // Add contact details if available
        ...(contactDetails && {
          profile: {
            nickname: contactDetails.info?.name?.first || contactDetails.primaryInfo?.email?.split("@")[0] || "User",
            email: contactDetails.primaryInfo?.email,
            phone: contactDetails.primaryInfo?.phone,
            // Profile photos are stored on Members, not Contacts
            // The /api/contacts route now fetches and attaches profilePhoto from member
            photo: contactDetails.profilePhoto || 
                  (contactDetails.info?.picture ? {
                    url: contactDetails.info.picture
                  } : undefined),
          },
          contactInfo: contactDetails.info,
        }),
        // Fallback profile if no contact details
        ...(!contactDetails && {
          profile: {
            nickname: "User",
            email: null,
          },
        }),
      },
      sessionData: {
        memberId,
        contactId,
        siteId,
      },
    });
  } catch (err: any) {
    console.error("❌ Error in get-member-session:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

