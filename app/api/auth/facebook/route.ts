import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Facebook will redirect to our callback route, which then redirects to /auth/callback
    const callbackUri = `${req.nextUrl.origin}/api/auth/facebook/callback`;
    const finalRedirectUri = searchParams.get("redirect_uri") || `${req.nextUrl.origin}/auth/callback`;
    
    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      return NextResponse.json(
        { error: "Facebook OAuth not configured" },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      finalRedirectUri,
      timestamp: Date.now(),
    })).toString("base64url");

    // Store state in a cookie for verification
    const response = NextResponse.redirect(
      `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(callbackUri)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent("email public_profile")}&` +
      `response_type=code`
    );

    // Store state in httpOnly cookie
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error: any) {
    console.error("Facebook OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Facebook OAuth" },
      { status: 500 }
    );
  }
}

