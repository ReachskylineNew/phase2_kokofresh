import { createClient, OAuthStrategy } from "@wix/sdk";
import { currentCart, checkout } from "@wix/ecom";
import { members } from "@wix/members";
import { cookies } from "next/headers";

/**
 * Server-side Wix client for API routes
 * Uses Next.js cookies() to read tokens from cookies
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

  const tokens =
    accessToken && refreshToken
      ? {
          accessToken: { value: accessToken },
          refreshToken: { value: refreshToken },
        }
      : undefined;

  if (!tokens) {
    console.warn("⚠️ No tokens found in cookies. Checkout operations may fail for guest users.");
    console.warn("💡 Visitor tokens should be created via /api/visitor-token before checkout");
  }

  const client = createClient({
    modules: {
      currentCart,
      checkout,
      members,
    },
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
      tokens,
    }),
  });

  return client;
}

