// Custom Wix client that uses session tokens directly instead of OAuth tokens
// This allows us to make authenticated API calls using the session token from VELO

"use client";

import { createClient } from "@wix/sdk";
import { members } from "@wix/members";
import { currentCart, checkout } from "@wix/ecom";
import * as payments from "@wix/payments";
import { collections, products } from "@wix/stores";
import { contacts } from "@wix/crm";
import { submissions } from "@wix/forms";

// Custom auth strategy that uses session token
class SessionTokenStrategy {
  private sessionToken: string | null = null;

  constructor(sessionToken: string | null) {
    this.sessionToken = sessionToken;
  }

  getAuthHeaders() {
    if (!this.sessionToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${this.sessionToken}`,
      "X-Wix-Session-Token": this.sessionToken,
    };
  }

  async getTokens() {
    // Session tokens don't expire the same way OAuth tokens do
    // Return null to indicate we're using session-based auth
    return null;
  }
}

/**
 * Get Wix client configured to use session token for authentication
 * Falls back to OAuth tokens if session token is not available
 */
export function getWixClientWithSession() {
  // Try to get session token from localStorage
  let sessionToken: string | null = null;
  
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("wixSession");
      if (stored) {
        // Handle both JSON-encoded and plain string formats
        try {
          sessionToken = JSON.parse(stored);
          if (typeof sessionToken !== "string") {
            sessionToken = stored; // If parsing gives us an object, use the raw string
          }
        } catch {
          sessionToken = stored; // If it's not JSON, use as-is
        }
        // Clean up any quotes
        sessionToken = sessionToken.trim().replace(/^["']|["']$/g, "");
      }
    } catch (err) {
      console.warn("Failed to read session token from localStorage:", err);
    }
  }

  // If we have a session token, create a client with custom auth
  // Otherwise, fall back to standard OAuth client
  if (sessionToken) {
    // Create client with session token
    // We'll use fetch interceptors to add the session token to requests
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
      // Use OAuthStrategy but we'll override the auth headers
      auth: {
        getAuthHeaders: () => ({
          Authorization: `Bearer ${sessionToken}`,
          "X-Wix-Session-Token": sessionToken,
        }),
      } as any,
    });

    return client;
  }

  // Fallback to standard OAuth client (for backward compatibility)
  return null;
}

/**
 * Make authenticated API call to Wix using session token
 */
export async function wixApiCall(
  endpoint: string,
  options: RequestInit = {},
  sessionToken?: string
) {
  const token = sessionToken || (typeof window !== "undefined" ? localStorage.getItem("wixSession") : null);
  
  if (!token) {
    throw new Error("No session token available");
  }

  // Clean up token
  let cleanToken = token;
  try {
    cleanToken = JSON.parse(token);
    if (typeof cleanToken !== "string") {
      cleanToken = token;
    }
  } catch {
    cleanToken = token;
  }
  cleanToken = cleanToken.trim().replace(/^["']|["']$/g, "");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cleanToken}`,
    "X-Wix-Session-Token": cleanToken,
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API call failed" }));
    throw new Error(error.message || `API call failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get current member using session token
 * Uses server-side API route to handle authentication
 */
export async function getCurrentMemberWithSession(sessionToken?: string): Promise<any> {
  const token = sessionToken || (typeof window !== "undefined" ? localStorage.getItem("wixSession") : null);
  
  if (!token) {
    return null;
  }

  let cleanToken = token;
  try {
    cleanToken = JSON.parse(token);
    if (typeof cleanToken !== "string") {
      cleanToken = token;
    }
  } catch {
    cleanToken = token;
  }
  cleanToken = cleanToken.trim().replace(/^["']|["']$/g, "");

  try {
    // Call our server-side API route that handles session token authentication
    const response = await fetch("/api/get-member-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionToken: cleanToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.member || null;
    } else {
      const error = await response.json().catch(() => ({}));
      console.error("Failed to get member:", error);
      return null;
    }
  } catch (error: any) {
    console.error("Error getting current member with session token:", error);
    return null;
  }
}

