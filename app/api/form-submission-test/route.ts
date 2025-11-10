import { NextResponse } from "next/server";
import { submissions } from "@wix/forms";
import { createClient, ApiKeyStrategy } from "@wix/sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming body from frontend:", body);

    // ✅ Extract correct place
    const incoming = body.submission?.submissions || {};

    // ✅ Build submission object
    const submission = {
      formId: "1654cfeb-5d1b-4fc0-8589-0ecc2b5b153e", // put your GUID here
      status: "PENDING" as const,
      seen: false,
      submissions: {
        first_name: incoming.first_name || "",
        last_name: incoming.last_name || "",
        email_5308: incoming.email_5308 || "",
        phone_0187: incoming.phone_0187 || "",
        leave_us_a_message: incoming.leave_us_a_message || "",
      },
    };

    console.log("🚀 Final payload sent to Wix:", JSON.stringify(submission, null, 2));

    // ✅ Call Wix API
    // You should initialize the Wix client with authentication elsewhere and import it here.
    // For demonstration, here's how you might do it inline (not recommended for production):

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

    // ✅ Return only the safe JSON part
    return NextResponse.json(createdSubmission.submissions);
  } catch (error: any) {
    console.error("❌ Form submission failed:", error?.response?.data || error);
    return NextResponse.json(
      { error: error?.response?.data?.message || error.message || "Internal Server Error" },
      { status: error?.status || 500 }
    );
  }
}
