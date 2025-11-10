import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Google will redirect to our callback route, which then redirects to /auth/callback
    const callbackUri = `${req.nextUrl.origin}/api/auth/google/callback`;
    const finalRedirectUri = searchParams.get("redirect_uri") || `${req.nextUrl.origin}/auth/callback`;
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth not configured" },
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
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(callbackUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("openid email profile")}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`
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
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}

