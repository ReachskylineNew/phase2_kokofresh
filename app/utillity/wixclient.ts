"use client";

import { createClient, OAuthStrategy } from "@wix/sdk";
import { members } from "@wix/members";
import { currentCart, checkout } from "@wix/ecom";
import * as payments from "@wix/payments";
import { collections, products } from "@wix/stores";
import { contacts } from "@wix/crm";
import { submissions } from "@wix/forms";
import Cookies from "js-cookie";

function safeParseCookie(key: string) {
  const value = Cookies.get(key);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed?.value || null; // ✅ only return the token string
  } catch {
    return null;
  }
}

export function getWixClient() {
  const accessToken = safeParseCookie("accessToken");
  const refreshToken = safeParseCookie("refreshToken");

  const tokens =
    accessToken && refreshToken
      ? {
          accessToken: { value: accessToken },
          refreshToken: { value: refreshToken },
        }
      : undefined;

  const client = createClient({
    modules: {
      products,
      collections,
      currentCart,
      checkout,
      payments,
      members,
      contacts,
      submissions,
    },
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
      tokens,
    }),
  });

  return client;
}

// Optional: export a default instance for quick usage
export const wixClient = getWixClient();
