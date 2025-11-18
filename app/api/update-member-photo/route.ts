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
    const { memberId, pictureUrl } = await req.json();

    if (!memberId || !pictureUrl) {
      return NextResponse.json(
        { error: "memberId and pictureUrl are required" },
        { status: 400 }
      );
    }

    console.log("📸 Updating member profile photo:", { memberId, pictureUrl });

    // Check env vars
    if (!process.env.WIX_API_KEY || !process.env.WIX_ACCOUNT_ID || !process.env.WIX_SITE_ID) {
      console.error("❌ Missing Wix env variables");
      return NextResponse.json(
        { error: "Wix API credentials missing. Check .env.local" },
        { status: 500 }
      );
    }

    const wixAdminClient = createAdminClient();

    // First, get the current member to see the structure
    try {
      const currentMemberResponse = await wixAdminClient.members.getMember(memberId);
      const currentMember = currentMemberResponse.member || currentMemberResponse;
      console.log("📋 Current member before update:", {
        memberId: currentMember?._id || currentMember?.id,
        hasProfile: !!currentMember?.profile,
        currentPhoto: currentMember?.profile?.profilePhoto,
        profileInfo: currentMember?.profileInfo,
      });
    } catch (getErr) {
      console.warn("⚠️ Could not get current member:", getErr);
    }

    // Update member profile photo
    // Wix stores profile photos in member.profile.profilePhoto
    // Try different update structures
    let updatedMemberResponse;
    try {
      // Try standard structure first
      updatedMemberResponse = await wixAdminClient.members.updateMember(memberId, {
        profile: {
          profilePhoto: {
            url: pictureUrl,
          },
        },
      });
    } catch (updateErr) {
      console.error("❌ Standard update failed, trying alternative structure:", updateErr.message);
      // Try alternative structure
      try {
        updatedMemberResponse = await wixAdminClient.members.updateMember(memberId, {
          profilePhoto: {
            url: pictureUrl,
          },
        });
      } catch (altErr) {
        throw new Error(`Failed to update member photo: ${altErr.message}`);
      }
    }

    const updatedMember = updatedMemberResponse.member || updatedMemberResponse;
    console.log("✅ Member profile photo updated:", {
      memberId: updatedMember?._id || updatedMember?.id,
      profilePhoto: updatedMember?.profile?.profilePhoto,
      profilePhotoUrl: updatedMember?.profile?.profilePhoto?.url,
      profileInfo: updatedMember?.profileInfo,
    });
    return NextResponse.json({
      success: true,
      member: updatedMember || updatedMemberResponse,
    });
  } catch (err: any) {
    console.error("❌ API /update-member-photo error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update member photo" },
      { status: 500 }
    );
  }
}

