// import { NextResponse } from "next/server"
// import { items } from "@wix/data"
// import { ApiKeyStrategy, createClient } from "@wix/sdk"

// export async function GET() {
//   try {
//     const wixClient = createClient({
//       modules: { items },
//       auth: ApiKeyStrategy({
//         apiKey: process.env.WIX_API_KEY!,
//         accountId: process.env.WIX_ACCOUNT_ID!,
//         siteId: process.env.WIX_SITE_ID!,
//       }),
//     })

//     // ✅ new way: use .query("collectionId")
//     const query = wixClient.items.query("reels")

//     // you can chain filters, sorting, etc. before .find()
//     const { items: reels } = await query.find()

//     console.log("Fetched reels:", reels)

//     return NextResponse.json({ data: reels })
//   } catch (error: any) {
//     console.error("Wix API Error:", error)
//     return NextResponse.json(
//       { error: error.message || "Failed to fetch reels" },
//       { status: 500 }
//     )
//   }
// }
