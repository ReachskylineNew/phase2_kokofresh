import { ok, serverError, badRequest } from 'wix-http-functions'
import { authentication } from 'wix-members-backend'
import { query } from 'wix-data'

// ✅ Handle CORS preflight request
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

export function options_syncSocialAuth(request) {
  return ok({ headers: corsHeaders(), body: {} })
}

/**
 * Sync Social Auth User with Wix Members
 * 
 * This function:
 * 1. Checks if a member with the email already exists
 * 2. If exists, logs them in and returns session token
 * 3. If not exists, creates a new member and returns session token
 * 
 * @param {Object} request - HTTP request object
 * @param {string} request.body.provider - 'google' or 'facebook'
 * @param {string} request.body.email - User's email from social provider
 * @param {string} request.body.name - User's full name
 * @param {string} request.body.firstName - User's first name
 * @param {string} request.body.lastName - User's last name
 * @param {string} request.body.picture - User's profile picture URL
 * @param {string} request.body.accessToken - Social provider access token
 * @param {string} request.body.idToken - Google ID token (optional)
 * @param {string} request.body.facebookId - Facebook user ID (optional)
 */
export async function post_syncSocialAuth(request) {
  try {
    const body = await request.body.json()
    const { 
      provider, 
      email, 
      name, 
      firstName, 
      lastName, 
      picture,
      accessToken,
      idToken,
      facebookId
    } = body

    // Validate required fields
    if (!provider || !email) {
      return badRequest({
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
        body: { 
          status: "error", 
          message: "Provider and email are required" 
        },
      })
    }

    if (provider !== "google" && provider !== "facebook") {
      return badRequest({
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
        body: { 
          status: "error", 
          message: "Provider must be 'google' or 'facebook'" 
        },
      })
    }

    console.log(`🔐 Syncing ${provider} user with Wix Members:`, { email, name })

    // Check if member already exists by email
    let existingMember = null
    try {
      // Query members by email using correct collection
      const membersQuery = await query("Members/PrivateMembersData")
        .eq("loginEmail", email)
        .limit(1)
        .find()

      if (membersQuery.items && membersQuery.items.length > 0) {
        existingMember = membersQuery.items[0]
        console.log("✅ Found existing member:", existingMember._id)
      }
    } catch (queryError) {
      console.warn("⚠️ Could not query members, will try to create new member:", queryError?.message)
    }

    let sessionToken
    let memberId

    if (existingMember) {
      // Member exists - we need to handle this carefully
      // Since Wix requires a password for login, we have two options:
      // 1. If member was created via social auth before, they should have a stored password
      // 2. If member was created via email/password, we can't log them in via social auth
      
      console.log("🔄 Existing member found:", existingMember._id)
      memberId = existingMember._id
      
      // For social auth, we'll create a temporary password and try to login
      // This is a workaround - ideally we'd track which members use social auth
      // and store their social provider info
      
      // Generate a consistent password based on email + provider (for social auth users)
      // This allows social auth users to login again
      const socialPassword = generateSocialAuthPassword(email, provider)
      
      try {
        // Try to login with the social auth password
        sessionToken = await authentication.login(email, socialPassword)
        console.log("✅ Session token created for existing social auth member")
        
        return ok({
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
          body: {
            status: "success",
            message: "Member logged in via social auth",
            sessionToken: sessionToken,
            memberId: memberId,
            email: email,
            existing: true,
          },
        })
      } catch (loginError) {
        // If login fails, the member might have been created via email/password
        // In this case, we'll need to prompt them to use email/password or link accounts
        console.warn("⚠️ Could not login existing member with social auth password:", loginError?.message)
        
        // Return error indicating member exists but can't login via social auth
        return badRequest({
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
          body: {
            status: "error",
            message: "An account with this email already exists. Please use email/password login or contact support to link your social account.",
            existing: true,
            email: email,
          },
        })
      }
    } else {
      // Member doesn't exist - create new member
      console.log("🆕 Creating new member from social auth...")
      
      try {
        // Generate a consistent password for social auth users
        // This allows them to login again via social auth
        const socialPassword = generateSocialAuthPassword(email, provider)
        
        // Register new member
        const registrationResult = await authentication.register(email, socialPassword, {
          contactInfo: {
            firstName: firstName || name?.split(" ")[0] || "",
            lastName: lastName || name?.split(" ").slice(1).join(" ") || "",
          },
          profile: {
            nickname: name || firstName || email.split("@")[0],
            picture: picture || "",
          },
        })
        
        console.log("✅ New member created:", registrationResult)
        memberId = registrationResult.memberId || registrationResult.id
        
        // Login the newly created member to get session token
        try {
          sessionToken = await authentication.login(email, socialPassword)
          console.log("✅ Session token created for new member")
        } catch (loginError) {
          console.error("❌ Failed to login new member:", loginError?.message)
          // Continue without session token - frontend can handle it
        }
        
        return ok({
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
          body: {
            status: "success",
            message: "Member created and logged in",
            sessionToken: sessionToken,
            memberId: memberId,
            email: email,
            existing: false,
          },
        })
      } catch (registerError) {
        console.error("❌ Member registration failed:", registerError?.message)
        
        // Check if error is because member already exists (race condition)
        if (registerError?.message?.includes("already exists") || 
            registerError?.message?.includes("duplicate")) {
          // Member was created between our check and registration
          // Return success - frontend can handle login
          return ok({
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
            body: {
              status: "success",
              message: "Member already exists",
              email: email,
              existing: true,
            },
          })
        }
        
        throw registerError
      }
    }
  } catch (error) {
    console.error("❌ syncSocialAuth error:", error?.message || error)
    return serverError({
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: {
        status: "error",
        message: error?.message || "Failed to sync social auth with Wix",
      },
    })
  }
}

/**
 * Generate a consistent password for social auth users
 * This allows the same user to login again via social auth
 * The password is deterministic based on email + provider
 */
function generateSocialAuthPassword(email, provider) {
  // Create a consistent password based on email and provider
  // This is a simple hash - in production, use a proper hashing algorithm
  const seed = `${email}:${provider}:social_auth_secret`
  // Simple hash function (for production, use crypto.createHash)
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Convert to a password-like string
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  const length = 32
  let password = ""
  const absHash = Math.abs(hash)
  
  for (let i = 0; i < length; i++) {
    password += charset[absHash % charset.length]
    hash = hash * 7 + i // Mix it up
  }
  
  return password
}

