// lib/initVisitor.ts
import { wixClient } from "../app/utillity/wixclient";

export async function initVisitor() {
  try {
    // If token already stored, reuse it
    const stored = localStorage.getItem("wixVisitorToken");
    if (stored) {
      const token = JSON.parse(stored);
      wixClient.auth.setTokens(token);
      return;
    }

    // Otherwise, request a new visitor token
    const token = await wixClient.auth.generateVisitorTokens();
    wixClient.auth.setTokens(token);
    localStorage.setItem("wixVisitorToken", JSON.stringify(token));
  } catch (err) {
    console.error("Failed to init Wix visitor", err);
  }
}
