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

export function options_registerUser(request) {
  return ok({
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: {}
  })
}

// ✅ Handle POST signup request
export async function post_registerUser(request) {
  try {
    const body = await request.body.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return badRequest({
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: { status: "error", message: "Missing required fields." }
      })
    }

    console.log("🟢 Creating member via backend:", { email, password, name })

    // ✅ Correct registration call
    const member = await authentication.register(email, password, {
      contactInfo: {
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ")[1] || "",
      },
    })

    console.log("✅ Member created successfully:", member)

    return ok({
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: {
        status: "success",
        message: "Member account created successfully.",
        member,
      },
    })
  } catch (error) {
    console.error("❌ Member registration failed:", error)

    return serverError({
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: {
        status: "error",
        message: error?.message || "Something went wrong. Check Wix member settings.",
      },
    })
  }
}

export function options_loginUser(request) {
  return ok({ headers: corsHeaders(), body: {} })
}

// ✅ Login endpoint
export async function post_loginUser(request) {
  try {
    const body = await request.body.json()
    const { email, password } = body

    if (!email || !password) {
      return badRequest({
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
        body: { status: "error", message: "Missing email or password" },
      })
    }

    console.log("🔐 Attempting login for:", email)

    // Try to authenticate the user
    let sessionToken
    try {
      sessionToken = await authentication.login(email, password)
      console.log("✅ Login successful. Session token created.")
    } catch (authError) {
      console.error("❌ Authentication failed:", authError?.message || authError)
      
      // Return specific error message based on error type
      const errorMessage = authError?.message?.includes("not found") 
        ? "Email not found" 
        : authError?.message?.includes("password") 
        ? "Invalid password" 
        : "Invalid credentials"
      
      return badRequest({
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
        body: { status: "error", message: errorMessage },
      })
    }

    if (!sessionToken) {
      console.error("❌ No session token returned from authentication.login()")
      return serverError({
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
        body: { status: "error", message: "Failed to create session token" },
      })
    }

    // IMPORTANT: VELO cannot convert session tokens to OAuth tokens server-side
    // The frontend will handle the conversion using:
    // 1. authentication.applySessionToken(sessionToken) from @wix/members
    // 2. wixClient.auth.getMemberTokensForDirectLogin(sessionToken)
    
    // Send the session token back to frontend
    return ok({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "success",
        message: "Login successful.",
        sessionToken,
        // Note: OAuth token conversion happens on frontend
        // Frontend will use applySessionToken() then getMemberTokensForDirectLogin()
      },
    })
  } catch (error) {
    console.error("❌ Login endpoint error:", error?.message || error)
    return serverError({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "error",
        message: error?.message || "Login failed. Please try again.",
      },
    })
  }
}

// ❌ REMOVE THIS FUNCTION - Not needed!
// VELO cannot convert session tokens to OAuth tokens server-side.
// The conversion must happen on the frontend using the Wix SDK.
// 
// If you still want to keep this function (for potential future use),
// you can uncomment it, but it will always return an error explaining
// that conversion must happen on the frontend.

/*
export function options_convertSessionToken(request) {
  return ok({ headers: corsHeaders(), body: {} })
}

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

    // IMPORTANT: VELO does not have a module to convert session tokens to OAuth tokens
    // The conversion must be done on the frontend using:
    // 1. authentication.applySessionToken(sessionToken) from @wix/members
    // 2. wixClient.auth.getMemberTokensForDirectLogin(sessionToken)
    
    return serverError({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "error",
        message: "Session token conversion must be done on frontend. Use authentication.applySessionToken() then getMemberTokensForDirectLogin() in your Next.js app.",
        solution: "The frontend login flow already handles this conversion automatically."
      },
    })
  } catch (error) {
    console.error("❌ convertSessionToken error:", error?.message || error)
    return serverError({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "error",
        message: error?.message || "Failed to convert session token",
      },
    })
  }
}
*/

