import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;

  function redirect(path: string, params: Record<string, string> = {}) {
    const url = new URL(path, origin);
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, v)
    );
    return NextResponse.redirect(url);
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return redirect("/login", { error });
    }

    if (!code || !state) {
      return redirect("/login", { error: "missing_code_or_state" });
    }

    // verify state
    const storedState = req.cookies.get("oauth_state")?.value;
    if (!storedState || storedState !== state) {
      return redirect("/login", { error: "invalid_state" });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${origin}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return redirect("/login", { error: "oauth_not_configured" });
    }

    // Exchange code → token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token error:", await tokenResponse.text());
      return redirect("/login", { error: "token_exchange_failed" });
    }

    const tokens = await tokenResponse.json();
    const { access_token } = tokens;

    // Get Google profile
    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!googleRes.ok) {
      return redirect("/login", { error: "failed_to_fetch_user_info" });
    }

    const userInfo = await googleRes.json();
    console.log("Google user:", userInfo);

    // Call VELO sync
    const wixBackendUrl = process.env.NEXT_PUBLIC_WIX_BACKEND_URL || process.env.WIX_BACKEND_URL || "https://backend.kokofresh.in";
    const wixRes = await fetch(`${wixBackendUrl}/_functions/syncSocialAuth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "google",
        email: userInfo.email,
        name: userInfo.name,
        firstName: userInfo.given_name || "",
        lastName: userInfo.family_name || "",
        picture: userInfo.picture || "",
      }),
    });

    // Parse response even if status is not ok (VELO returns 400 for PASSWORD_MISMATCH)
    let data;
    try {
      const responseText = await wixRes.text();
      data = JSON.parse(responseText);
      console.log("✅ Wix sync response:", JSON.stringify(data, null, 2));
      console.log("🔍 Response details:", {
        status: data.status,
        hasMemberId: !!data.memberId,
        memberId: data.memberId,
        hasContactId: !!data.contactId,
        contactId: data.contactId,
        hasSessionToken: !!data.sessionToken,
      });
    } catch (parseErr) {
      console.error("❌ Failed to parse Wix response:", parseErr);
      return redirect("/login", { error: "wix_sync_failed" });
    }

    // Handle errors (check before checking wixRes.ok)
    if (data.status === "error") {
      // Existing email/password user - they need to use email/password login
      if (data.code === "PASSWORD_MISMATCH") {
        return redirect("/login", {
          accountExists: "true",
          email: userInfo.email,
          error: "email_password_required",
        });
      }

      // Other errors
      return redirect("/login", {
        error: data.message || "authentication_failed",
        email: userInfo.email,
      });
    }

    // If response is not ok and we didn't handle it above, it's a real error
    if (!wixRes.ok) {
      console.error("❌ Wix sync failed with status:", wixRes.status);
      return redirect("/login", {
        error: data.message || "wix_sync_failed",
        email: userInfo.email,
      });
    }

    // Success cases - both new and existing users should have sessionToken
    if (data.status === "logged_in" && data.sessionToken) {
      // Update member profile photo if picture is provided
      // Try to get memberId from response or decode from session token if needed
      let memberIdToUse = data.memberId;
      
      // If memberId is not in response, try to decode from session token
      if (!memberIdToUse && data.sessionToken) {
        try {
          const tokenParts = data.sessionToken.split(".");
          if (tokenParts.length >= 2) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            const tokenData = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
            memberIdToUse = tokenData?.id;
            console.log("🔍 Decoded memberId from session token:", memberIdToUse);
          }
        } catch (decodeErr) {
          console.warn("⚠️ Could not decode memberId from session token:", decodeErr);
        }
      }

      // Update member profile photo - use picture from userInfo or from VELO response
      const pictureUrl = userInfo.picture || data.picture;
      
      if (pictureUrl && memberIdToUse) {
        console.log("🖼️ Attempting to update member photo:", {
          memberId: memberIdToUse,
          pictureUrl: pictureUrl,
        });
        try {
          // Call API to update member profile photo (await to ensure it completes)
          const photoUpdateRes = await fetch(`${origin}/api/update-member-photo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              memberId: memberIdToUse,
              pictureUrl: pictureUrl,
            }),
          });
          
          if (photoUpdateRes.ok) {
            const photoData = await photoUpdateRes.json();
            console.log("✅ Member photo update successful:", photoData);
          } else {
            const errorText = await photoUpdateRes.text();
            console.error("❌ Member photo update failed:", errorText);
          }
        } catch (err) {
          console.error("❌ Error updating member photo:", err);
        }
      } else {
        console.log("⚠️ Skipping photo update:", {
          hasPicture: !!pictureUrl,
          hasMemberId: !!memberIdToUse,
          memberIdFromResponse: data.memberId,
          memberIdDecoded: memberIdToUse,
          pictureFromUserInfo: userInfo.picture,
          pictureFromData: data.picture,
        });
      }

      // Redirect to auth callback page to properly convert session token to OAuth tokens
      // This ensures proper Wix SDK integration
      const callbackUrl = new URL("/auth/callback", origin);
      callbackUrl.searchParams.set("sessionToken", data.sessionToken);
      callbackUrl.searchParams.set("provider", "google");
      
      const res = NextResponse.redirect(callbackUrl);
      // Also set cookie as fallback
      res.headers.set(
        "Set-Cookie",
        `wixSession=${data.sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
      );
      return res;
    }

    // Fallback for new_user_created status (shouldn't happen with new VELO code, but handle it)
    if (data.status === "new_user_created" && data.socialPassword) {
      console.log("⚠️ Fallback: Attempting login for new user");
      const wixBackendUrl = process.env.NEXT_PUBLIC_WIX_BACKEND_URL || process.env.WIX_BACKEND_URL || "https://backend.kokofresh.in";
      const loginRes = await fetch(`${wixBackendUrl}/_functions/loginUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.socialPassword,
        }),
      });

      if (!loginRes.ok) {
        console.error("❌ Login failed for new user");
        return redirect("/login", { error: "login_failed" });
      }

      const loginJson = await loginRes.json();
      const sessionToken =
        loginJson.sessionToken ||
        loginJson.token ||
        loginJson.data?.sessionToken;

      if (!sessionToken) {
        return redirect("/login", { error: "no_session_token" });
      }

      const callbackUrl = new URL("/auth/callback", origin);
      callbackUrl.searchParams.set("sessionToken", sessionToken);
      callbackUrl.searchParams.set("provider", "google");
      
      const res = NextResponse.redirect(callbackUrl);
      res.headers.set(
        "Set-Cookie",
        `wixSession=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
      );
      return res;
    }

    // Unknown response
    console.error("❌ Unknown Wix sync response:", data);
    return redirect("/login", { error: "unknown_response" });
  } catch (err: any) {
    return redirect("/login", { error: err.message });
  }
}
