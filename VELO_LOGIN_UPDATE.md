# Updated VELO Login Function

The session token from `authentication.login()` cannot be converted to OAuth tokens via standard endpoints. You need to modify your VELO `post_loginUser` function to also return OAuth tokens.

## Option 1: Use Wix SDK in VELO (Recommended)

Update your VELO `post_loginUser` function to convert the session token to OAuth tokens server-side:

```javascript
import { ok, serverError, badRequest } from 'wix-http-functions'
import { authentication } from 'wix-members-backend'
import wixAuth from 'wix-auth-backend'

// ... existing corsHeaders function ...

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

    // IMPORTANT: Convert session token to OAuth tokens
    // Note: You may need to use wixAuth or another method depending on your Wix setup
    // This is a placeholder - you may need to adjust based on available VELO APIs
    
    // Try to get OAuth tokens using the session
    let accessToken, refreshToken
    try {
      // Method 1: Use wixAuth if available
      // const tokens = await wixAuth.getMemberTokens(sessionToken)
      // accessToken = tokens.accessToken
      // refreshToken = tokens.refreshToken
      
      // Method 2: If the above doesn't work, return session token only
      // and handle conversion on frontend with applySessionToken
      // For now, we'll return session token and let frontend handle it
      
    } catch (tokenError) {
      console.warn("⚠️ Could not convert to OAuth tokens:", tokenError)
      // Continue with session token only
    }

    // Send both session token and OAuth tokens if available
    return ok({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "success",
        message: "Login successful.",
        sessionToken,
        // Include OAuth tokens if available
        ...(accessToken && refreshToken ? {
          accessToken: {
            value: accessToken,
            expiresAt: Math.floor(Date.now() / 1000) + 3600 // 1 hour
          },
          refreshToken: {
            value: refreshToken,
            expiresAt: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
          }
        } : {})
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
```

## Option 2: Use applySessionToken on Frontend (Alternative)

If you can't modify the VELO backend to return OAuth tokens, you can use the session token directly with `applySessionToken()`:

```javascript
// In your frontend after getting session token
import { authentication } from '@wix/members';

// Apply the session token
await authentication.applySessionToken(sessionToken);

// This will set the session in the Wix SDK
// Then you can get the current member
const member = await wixClient.members.getCurrentMember();
```

However, this may not work for all use cases if you need OAuth tokens specifically.

## Recommended Solution

The best approach is to modify your VELO backend to return OAuth tokens. If that's not possible immediately, we can try using the session token with `applySessionToken()` on the frontend.

