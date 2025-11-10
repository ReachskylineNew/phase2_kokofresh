import { NextResponse } from "next/server";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { submissions } from "@wix/forms";

const formId = "43e1b278-34a0-4787-9527-195359e8e69b";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming body:", body);

    const incoming = body.submission?.submissions || {};

    // ✅ No remap needed if frontend already uses Wix schema keys
    const submission = {
      formId,
      status: "PENDING" as const,
      seen: false,
      submissions: {
        ...incoming, // trust frontend keys
      },
    };

    console.log("🚀 Final payload to Wix:", JSON.stringify(submission, null, 2));

    const wixClient = createClient({
      modules: { submissions },
      auth: ApiKeyStrategy({
        apiKey: process.env.WIX_API_KEY!,
        accountId: process.env.WIX_ACCOUNT_ID!,
        siteId: process.env.WIX_SITE_ID!,
      }),
    });

    const createdSubmission = await wixClient.submissions.createSubmission(submission);

    console.log("✅ Success! Wix returned:", createdSubmission);

    return NextResponse.json({
      success: true,
      data: createdSubmission.submissions,
    });
  } catch (error: any) {
    console.error("❌ Form submission failed:", error?.response?.data || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.response?.data?.message || error.message || "Internal Server Error",
        details: error?.response?.data || null,
      },
      { status: error?.status || 500 }
    );
  }
}
