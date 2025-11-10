// VELO Backend Function: convertSessionToken
// Add this as a new HTTP function in your Wix site
// Path: Backend → HTTP Functions → New Function → convertSessionToken

import { ok, serverError, badRequest } from 'wix-http-functions'
import { authentication } from 'wix-members-backend'
// You may need to import other modules depending on your Wix setup

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

export function options_convertSessionToken(request) {
  return ok({ headers: corsHeaders(), body: {} })
}

/**
 * Converts a Wix Members session token to OAuth access/refresh tokens
 * This function should be called from your frontend after receiving a session token from loginUser
 */
export async function post_convertSessionToken(request) {
  try {
    const body = await request.body.json()
    const { sessionToken } = body

    if (!sessionToken) {
      return badRequest({
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
        body: { status: "error", message: "Session token is required" },
      })
    }

    console.log("🔄 Converting session token to OAuth tokens...")

    // IMPORTANT: The session token from authentication.login() is a Wix Members session token
    // To convert it to OAuth tokens, you typically need to use the Wix SDK on the frontend
    // However, if you need to do it server-side, you may need to use wixAuth or similar
    
    // Option 1: If you have access to wixAuth module
    // try {
    //   const tokens = await wixAuth.getMemberTokensForDirectLogin(sessionToken)
    //   return ok({
    //     headers: { ...corsHeaders(), "Content-Type": "application/json" },
    //     body: {
    //       status: "success",
    //       accessToken: {
    //         value: tokens.accessToken,
    //         expiresAt: tokens.expiresAt || (Math.floor(Date.now() / 1000) + 3600)
    //       },
    //       refreshToken: {
    //         value: tokens.refreshToken,
    //         expiresAt: tokens.refreshTokenExpiresAt || (Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60))
    //       }
    //     }
    //   })
    // } catch (authError) {
    //   console.error("Failed to convert session token:", authError)
    //   return serverError({
    //     headers: { ...corsHeaders(), "Content-Type": "application/json" },
    //     body: { status: "error", message: "Failed to convert session token" }
    //   })
    // }

    // Option 2: Return error indicating frontend should handle it
    // The session token should be used with applySessionToken() on the frontend
    return serverError({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "error",
        message: "Session token conversion must be done on frontend using applySessionToken() or modify loginUser to return OAuth tokens directly"
      }
    })

  } catch (error) {
    console.error("❌ convertSessionToken error:", error?.message || error)
    return serverError({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "error",
        message: error?.message || "Failed to convert session token"
      }
    })
  }
}

