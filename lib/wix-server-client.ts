import { createClient, OAuthStrategy } from "@wix/sdk";
import { currentCart, checkout, orders } from "@wix/ecom";
import { members } from "@wix/members";
import { cookies } from "next/headers";

/**
 * Generate visitor tokens for server-side operations
 */
async function generateVisitorTokens() {
  try {
    const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID || "2656201f-a899-4ec4-8b24-d1132bcf5405";
    const response = await fetch("https://www.wixapis.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grantType: "anonymous",
        clientId,
      }),
    });

    if (response.ok) {
      const tokenData = await response.json();
      return {
        accessToken: { value: tokenData.access_token },
        refreshToken: { value: tokenData.refresh_token },
      };
    }
  } catch (error) {
    console.error("Failed to generate visitor tokens:", error);
  }
  return undefined;
}

/**
 * Server-side Wix client for API routes
 * Uses Next.js cookies() to read tokens from cookies
 * Falls back to visitor tokens if no user tokens are available
 */
export async function getWixServerClient() {
  const cookieStore = await cookies();
  
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  try {
    const accessTokenCookie = cookieStore.get("accessToken");
    const refreshTokenCookie = cookieStore.get("refreshToken");

    if (accessTokenCookie?.value) {
      try {
        const parsed = JSON.parse(accessTokenCookie.value);
        accessToken = parsed?.value || null;
      } catch {
        // If parsing fails, try using the value directly
        accessToken = accessTokenCookie.value;
      }
    }

    if (refreshTokenCookie?.value) {
      try {
        const parsed = JSON.parse(refreshTokenCookie.value);
        refreshToken = parsed?.value || null;
      } catch {
        // If parsing fails, try using the value directly
        refreshToken = refreshTokenCookie.value;
      }
    }
  } catch (error) {
    console.warn("Failed to read tokens from cookies:", error);
  }

  let tokens =
    accessToken && refreshToken
      ? {
          accessToken: { value: accessToken },
          refreshToken: { value: refreshToken },
        }
      : undefined;

  // If no tokens available, generate visitor tokens (useful for webhooks)
  // NOTE: Visitor tokens should still work for creating orders from WEB checkouts
  // The checkout's channelType should be inherited by the order
  if (!tokens) {
    console.log("⚠️ No user tokens found, generating visitor tokens for server-side operation");
    console.log("⚠️ Note: Orders created from WEB checkouts should inherit channelType even with visitor tokens");
    tokens = await generateVisitorTokens();
  }

  const client = createClient({
    modules: {
      currentCart,
      checkout,
      members,
      orders,
    },
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
      tokens,
    }),
  });

  return client;
}

