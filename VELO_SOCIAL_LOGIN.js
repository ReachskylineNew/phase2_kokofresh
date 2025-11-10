import { ok, serverError, badRequest } from 'wix-http-functions'
import { authentication } from 'wix-members-backend'

// ✅ Handle CORS preflight request
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

/**
 * Social Login Endpoint
 * Note: Wix VELO doesn't have a direct social login function.
 * Social logins should be handled via Wix OAuth flow on the frontend.
 * This endpoint is a placeholder for potential future server-side handling.
 * 
 * For Google/Facebook login, use Wix OAuth in your Next.js app:
 * 1. Redirect to Wix OAuth URL
 * 2. User authenticates with Google/Facebook
 * 3. Wix redirects back with OAuth code
 * 4. Exchange code for member tokens
 */
export function options_socialLogin(request) {
  return ok({ headers: corsHeaders(), body: {} })
}

export async function post_socialLogin(request) {
  try {
    const body = await request.body.json()
    const { provider, accessToken, idToken } = body

    if (!provider || !accessToken) {
      return badRequest({
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
        body: { 
          status: "error", 
          message: "Provider and access token are required" 
        },
      })
    }

    console.log(`🔐 Attempting ${provider} social login...`)

    // Note: Wix VELO doesn't have authentication.loginWithSocialAuth()
    // Social logins must be handled via OAuth flow on the frontend
    // This is a placeholder implementation
    
    return badRequest({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "error",
        message: "Social login should be handled via Wix OAuth flow. Use the frontend OAuth implementation.",
        note: "Social logins (Google/Facebook) are handled through Wix's OAuth system, not VELO backend functions."
      },
    })
  } catch (error) {
    console.error("❌ Social login error:", error?.message || error)
    return serverError({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "error",
        message: error?.message || "Social login failed",
      },
    })
  }
}

