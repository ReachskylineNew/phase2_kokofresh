import { NextRequest, NextResponse } from "next/server";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { members } from "@wix/members";

function createAdminClient() {
  return createClient({
    modules: { members },
    auth: ApiKeyStrategy({
      apiKey: process.env.WIX_API_KEY!,
      accountId: process.env.WIX_ACCOUNT_ID!,
      siteId: process.env.WIX_SITE_ID!,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "memberId is required" },
        { status: 400 }
      );
    }

    // Check env vars
    if (!process.env.WIX_API_KEY || !process.env.WIX_ACCOUNT_ID || !process.env.WIX_SITE_ID) {
      return NextResponse.json(
        { error: "Wix API credentials missing" },
        { status: 500 }
      );
    }

    const wixAdminClient = createAdminClient();
    const memberResponse = await wixAdminClient.members.getMember(memberId);

    // Wix API returns member in different structures - handle both
    const member = memberResponse.member || memberResponse;
    
    console.log("📸 Member fetched - full structure:", JSON.stringify(memberResponse, null, 2));
    console.log("📸 Member extracted:", {
      memberId: member?._id || member?.id,
      hasProfile: !!member?.profile,
      profilePhoto: member?.profile?.profilePhoto,
      profilePhotoUrl: member?.profile?.profilePhoto?.url,
      profileInfo: member?.profileInfo,
    });

    return NextResponse.json({ 
      member: member || memberResponse,
      rawResponse: memberResponse, // Include raw for debugging
    });
  } catch (err: any) {
    console.error("❌ API /get-member error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to get member" },
      { status: 500 }
    );
  }
}

