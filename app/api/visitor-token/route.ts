import { NextResponse } from "next/server";

// Handle POST /api/visitor-token
export async function POST(req: Request) {
  try {
    const clientId = "9d6c0efd-5a3a-46f5-b3de-4cde8ded7c57";
    const body = await req.json().catch(() => ({}));
    const { refreshToken } = body;

    const payload = refreshToken
      ? {
          grantType: "refresh_token",
          refresh_token: refreshToken,
        }
      : {
          grantType: "anonymous",
          clientId,
        };

    const tokenRes = await fetch("https://www.wixapis.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json(tokenData, { status: tokenRes.status });
    }

    return NextResponse.json(tokenData);
  } catch (err: any) {
    console.error("❌ Visitor token error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
