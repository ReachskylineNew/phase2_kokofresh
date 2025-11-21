import { OAuthStrategy, createClient } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";

const WIX_CLIENT_ID = "2656201f-a899-4ec4-8b24-d1132bcf5405";
const IS_DEV = process.env.NODE_ENV === "development";
const HEADLESS_URL = IS_DEV
  ? "http://localhost:3000"
  : "https://kokofresh-new.vercel.app";

// ✅ Export dummy middleware in dev to prevent build errors
export async function middleware(req: NextRequest) {
  if (IS_DEV) {
    // ⛔ Skip all logic in development (so npm run dev won't error)
    return NextResponse.next();
  }

  const url = new URL(req.url);
  const res = NextResponse.next();

  // 🛒 1️⃣ Handle Wix Checkout → Cart Redirects
  if (url.hostname === "www.kokofresh.in" && url.pathname.startsWith("/cart-page")) {
    const redirectUrl = `${HEADLESS_URL}/cart`;
    console.log("🔁 Redirecting from cart-page →", redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // 🔐 2️⃣ Ensure Visitor Tokens Exist
  const cookies = req.cookies;
  if (cookies.get("refreshToken")) {
    return res;
  }

  // 3️⃣ Generate new visitor tokens if missing
  try {
    const wixClient = createClient({
      auth: OAuthStrategy({
        clientId: WIX_CLIENT_ID,
      }),
    });

    const tokens = await wixClient.auth.generateVisitorTokens();
    console.log("✅ Visitor tokens generated via middleware");
  } catch (err) {
    console.error("❌ Failed to generate Wix visitor tokens:", err);
  }

  return res;
}

export const config = {
  matcher: ["/cart-page", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
