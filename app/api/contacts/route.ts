import { NextRequest, NextResponse } from "next/server";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { products, collections } from "@wix/stores";
import { contacts } from "@wix/crm";
import { members } from "@wix/members";

// Mock data for fallback/testing
const mockContact = {
  _id: "mock-contact-123",
  info: {
    name: { first: "Test", last: "User" },
    emails: { items: [{ email: "test@example.com", primary: true }] },
    phones: { items: [{ phone: "+911234567890", primary: true }] },
  },
  primaryInfo: {
    email: "test@example.com",
    phone: "+911234567890",
  },
};

// ✅ Build Admin Client directly here
function createAdminClient() {
  return createClient({
    modules: { products, collections, contacts, members },
    auth: ApiKeyStrategy({
      apiKey: process.env.WIX_API_KEY!,
      accountId: process.env.WIX_ACCOUNT_ID!,
      siteId: process.env.WIX_SITE_ID!,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { contactId } = await req.json();

    if (!contactId) {
      return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
    }

    console.log("📩 Received contactId:", contactId);

    // Mock mode
    if (process.env.USE_MOCK_CONTACTS === "true") {
      console.log("⚠️ Returning mock contact");
      return NextResponse.json({ contact: { ...mockContact, _id: contactId } });
    }

    // Check env vars
    if (!process.env.WIX_API_KEY || !process.env.WIX_ACCOUNT_ID || !process.env.WIX_SITE_ID) {
      console.error("❌ Missing Wix env variables");
      return NextResponse.json(
        { error: "Wix API credentials missing. Check .env.local" },
        { status: 500 }
      );
    }

    // ✅ Create admin client inline
    const wixAdminClient = createAdminClient();
    const contact = await wixAdminClient.contacts.getContact(contactId, {
      fieldsets: ["FULL"],
    });

    console.log("✅ Contact fetched from Wix:", contact._id,contact);
    
    // Profile photos are stored on Members, not Contacts
    // If contact has memberInfo, fetch the member's profile photo
    let profilePhoto = null;
    const memberId = contact.memberInfo?.memberId;
    
    if (memberId) {
      try {
        console.log("📸 Fetching member profile photo for memberId:", memberId);
        const memberResponse = await wixAdminClient.members.getMember(memberId);
        const member = memberResponse.member || memberResponse;
        
        // Extract profile photo from member object
        const photoUrl = member?.profile?.profilePhoto?.url || 
                        member?.profilePhoto?.url ||
                        member?.profileInfo?.profilePhoto?.url;
        
        if (photoUrl) {
          profilePhoto = { url: photoUrl };
          console.log("✅ Found member profile photo:", photoUrl);
        } else {
          console.log("⚠️ No profile photo found for member:", memberId);
        }
      } catch (memberErr: any) {
        console.warn("⚠️ Could not fetch member profile photo:", memberErr?.message);
      }
    } else {
      console.log("⚠️ Contact has no memberInfo.memberId, cannot fetch profile photo");
    }
    
    console.log("📸 Contact picture fields:", {
      "info.picture": contact.info?.picture,
      "info.image": contact.info?.image,
      "picture": contact.picture,
      "image": contact.image,
      "memberProfilePhoto": profilePhoto,
    });
    
    // Return contact with profile photo if available
    return NextResponse.json({ 
      contact: {
        ...contact,
        // Attach profile photo to contact for easier access
        profilePhoto: profilePhoto || undefined,
      },
    });
  } catch (err: any) {
    console.error("❌ API /contacts error:", err);
    return NextResponse.json(
      { error: err?.message || "Something broke in /contacts" },
      { status: 500 }
    );
  }
}
