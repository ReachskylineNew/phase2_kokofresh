import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}/login?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}/login?error=missing_code_or_state`
      );
    }

    // Verify state from cookie
    const storedState = req.cookies.get("oauth_state")?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}/login?error=invalid_state`
      );
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${req.nextUrl.origin}/api/auth/facebook/callback`;

    if (!appId || !appSecret) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}/login?error=oauth_not_configured`
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`,
      {
        method: "GET",
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange error:", errorData);
      return NextResponse.redirect(
        `${req.nextUrl.origin}/login?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user info from Facebook
    const userInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?` +
      `fields=id,name,email,first_name,last_name,picture&` +
      `access_token=${access_token}`
    );

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}/login?error=failed_to_fetch_user_info`
      );
    }

    const userInfo = await userInfoResponse.json();
    console.log("✅ Facebook user info received:", { email: userInfo.email, name: userInfo.name });

    // Sync with Wix via VELO backend
    const wixFunctionUrl = "https://kokofresh.in/_functions/syncSocialAuth";
    const syncPayload = {
      provider: "facebook",
      email: userInfo.email,
      name: userInfo.name || "",
      firstName: userInfo.first_name || "",
      lastName: userInfo.last_name || "",
      picture: userInfo.picture?.data?.url || "",
      accessToken: access_token,
      facebookId: userInfo.id,
    };

    console.log("🔄 Calling Wix VELO function:", wixFunctionUrl);
    console.log("📦 Payload:", { ...syncPayload, accessToken: "[REDACTED]" });

    const syncResponse = await fetch(wixFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(syncPayload),
    });

    console.log("📊 Wix sync response status:", syncResponse.status, syncResponse.statusText);

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || "Unknown error" };
      }
      console.error("❌ Wix sync error:", {
        status: syncResponse.status,
        statusText: syncResponse.statusText,
        error: errorData,
      });
      return NextResponse.redirect(
        `${req.nextUrl.origin}/login?error=${encodeURIComponent(errorData.message || "wix_sync_failed")}`
      );
    }

    const syncData = await syncResponse.json();
    console.log("✅ Wix sync successful:", { 
      status: syncData.status, 
      hasSessionToken: !!syncData.sessionToken,
      memberId: syncData.memberId 
    });

    // Case 1: We have a session token from VELO → proceed to /auth/callback
    if (syncData.sessionToken) {
      const callbackUrl = new URL(`${req.nextUrl.origin}/auth/callback`);
      callbackUrl.searchParams.set("sessionToken", syncData.sessionToken);
      callbackUrl.searchParams.set("provider", "facebook");
      const response = NextResponse.redirect(callbackUrl.toString());
      response.cookies.delete("oauth_state");
      return response;
    }

    // Case 2: Direct tokens returned (uncommon) → proceed to /auth/callback
    if (syncData.accessToken && syncData.refreshToken) {
      const callbackUrl = new URL(`${req.nextUrl.origin}/auth/callback`);
      callbackUrl.searchParams.set("accessToken", syncData.accessToken);
      callbackUrl.searchParams.set("refreshToken", syncData.refreshToken);
      callbackUrl.searchParams.set("provider", "facebook");
      const response = NextResponse.redirect(callbackUrl.toString());
      response.cookies.delete("oauth_state");
      return response;
    }

    // Case 3: Existing member but no session token → fall back to Wix OAuth to link/login
    if (syncData.existing) {
      const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID!;
      const redirectUrl = `${req.nextUrl.origin}/auth/callback`;
      const statePayload = { redirectUrl, timestamp: Date.now() };
      const stateValue = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

      const wixAuthUrl = new URL("https://www.wix.com/apps/oauth/authorize");
      wixAuthUrl.searchParams.set("client_id", clientId);
      wixAuthUrl.searchParams.set("redirect_uri", redirectUrl);
      wixAuthUrl.searchParams.set("response_type", "code");
      wixAuthUrl.searchParams.set("scope", "members");
      wixAuthUrl.searchParams.set("mode", "login");
      wixAuthUrl.searchParams.set("state", stateValue);

      const res = NextResponse.redirect(wixAuthUrl.toString());
      res.cookies.set("oAuthRedirectData", JSON.stringify({ state: stateValue }), {
        httpOnly: false,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 600,
      });
      return res;
    }

    // Case 4: Unexpected shape
    return NextResponse.redirect(
      `${req.nextUrl.origin}/login?error=${encodeURIComponent("Unexpected sync response")}`
    );
  } catch (error: any) {
    console.error("Facebook OAuth callback error:", error);
    return NextResponse.redirect(
      `${req.nextUrl.origin}/login?error=${encodeURIComponent(error.message || "oauth_callback_failed")}`
    );
  }
}

