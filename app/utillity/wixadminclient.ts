import { createClient, ApiKeyStrategy } from "@wix/sdk"
import { products, collections } from "@wix/stores"
import { contacts } from "@wix/crm"
import { orders } from "@wix/ecom"
import {items } from "@wix/data"
import { submissions } from "@wix/forms";

export function getWixAdminClient() {
  return createClient({
    modules: { products, collections, contacts, orders,items,submissions },
    auth: ApiKeyStrategy({
      apiKey: process.env.WIX_API_KEY!,
      accountId: process.env.WIX_ACCOUNT_ID!,
      siteId: process.env.WIX_SITE_ID!,
    }),
  })
}
