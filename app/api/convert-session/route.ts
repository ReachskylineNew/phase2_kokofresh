import { NextRequest, NextResponse } from "next/server";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { members } from "@wix/members";

export async function POST(req: NextRequest) {
  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 400 }
      );
    }

    // Create a client with the same client ID as the frontend
    const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID || "2656201f-a899-4ec4-8b24-d1132bcf5405";
    
    console.log("🔄 Converting session token to member tokens...");
    console.log("Client ID:", clientId);
    console.log("Session token preview:", sessionToken.substring(0, 50) + "...");

    try {
      // Try method 1: Use SDK's getMemberTokensForDirectLogin
      const wixClient = createClient({
        modules: { members },
        auth: OAuthStrategy({
          clientId,
        }),
      });

      const tokens = await wixClient.auth.getMemberTokensForDirectLogin(sessionToken);

      if (tokens?.accessToken && tokens?.refreshToken) {
        console.log("✅ Successfully converted session token using SDK method");
        return NextResponse.json({
          accessToken: {
            value: tokens.accessToken.value,
            expiresAt: tokens.accessToken.expiresAt,
          },
          refreshToken: {
            value: tokens.refreshToken.value,
            expiresAt: tokens.refreshToken.expiresAt,
          },
        });
      }
    } catch (sdkError: any) {
      console.warn("SDK method failed, trying direct API call:", sdkError.message);
      
      // Try method 2: Call Wix OAuth token endpoint directly
      // Try different grant types that might work with session tokens
      const grantTypes = [
        { grant_type: "direct_login", session_token: sessionToken },
        { grant_type: "session_token", session_token: sessionToken },
        { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: sessionToken },
      ];

      let lastError: any = null;
      
      for (const grantConfig of grantTypes) {
        try {
          console.log(`Trying grant type: ${grantConfig.grant_type}`);
          const tokenResponse = await fetch("https://www.wixapis.com/oauth2/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...grantConfig,
              client_id: clientId,
            }),
          });

          const tokenData = await tokenResponse.json();

          if (tokenResponse.ok && tokenData.access_token && tokenData.refresh_token) {
            console.log(`✅ Successfully converted using grant type: ${grantConfig.grant_type}`);
            
            // Calculate expiresAt (default to 1 hour if not provided)
            const expiresIn = tokenData.expires_in || 3600;
            const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

            return NextResponse.json({
              accessToken: {
                value: tokenData.access_token,
                expiresAt: expiresAt,
              },
              refreshToken: {
                value: tokenData.refresh_token,
                expiresAt: expiresAt + (30 * 24 * 60 * 60), // Refresh tokens typically last 30 days
              },
            });
          } else {
            console.warn(`Grant type ${grantConfig.grant_type} failed:`, tokenData);
            lastError = tokenData;
          }
        } catch (apiError: any) {
          console.warn(`Grant type ${grantConfig.grant_type} threw error:`, apiError.message);
          lastError = apiError;
        }
      }

      // If all grant types failed, throw the last error
      console.error("All direct API grant types failed:", lastError);
      throw new Error(lastError?.error_description || lastError?.error || "All token conversion methods failed");
    }
  } catch (err: any) {
    console.error("❌ Failed to convert session token:", err);
    return NextResponse.json(
      { 
        error: err.message || "Failed to convert session token",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

