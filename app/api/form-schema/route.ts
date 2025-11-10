import { NextResponse } from "next/server";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { forms } from "@wix/forms";

const formId = "43e1b278-34a0-4787-9527-195359e8e69b"; // ✅ your Wix formId

export async function GET() {
  try {
    const wixClient = createClient({
      modules: { forms },
      auth: ApiKeyStrategy({
        apiKey: process.env.WIX_API_KEY!,
        accountId: process.env.WIX_ACCOUNT_ID!,
        siteId: process.env.WIX_SITE_ID!,
      }),
    });

    // ✅ Fetch form schema
    const form = await wixClient.forms.getForm(formId);

    console.log("📜 Wix Form Schema:", JSON.stringify(form, null, 2));

    return NextResponse.json({
      success: true,
      form,
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch form schema:", error?.response?.data || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.response?.data?.message || error.message || "Internal Server Error",
      },
      { status: error?.status || 500 }
    );
  }
}
