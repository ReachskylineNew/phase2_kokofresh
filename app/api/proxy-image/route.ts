// app/api/proxy-image/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) {
      return new NextResponse("No URL provided", { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400", // optional: cache for 1 day
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new NextResponse("Error proxying image", { status: 500 });
  }
}
