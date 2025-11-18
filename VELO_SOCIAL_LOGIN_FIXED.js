import { ok, serverError, badRequest } from 'wix-http-functions'
import { authentication } from 'wix-members-backend'
import wixData from 'wix-data'

// CORS helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

/* ===========================
   Social OAuth Sync → Wix Members
   Handles Google/Facebook login hand-off
   =========================== */

function generateSocialPassword(email, provider) {
  const seed = `${email}:${provider}:v1`;
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  let pwd = "";
  let v = Math.abs(hash);

  for (let i = 0; i < 32; i++) {
    pwd += charset[v % charset.length];
    v = (v * 1103515245 + 12345) >>> 0;
  }

  return pwd;
}

/* ===========================
   NOTE: Profile pictures are stored on Member, not Contact
   VELO cannot update member profile photos directly
   The Next.js API will handle updating member.profile.profilePhoto via Admin API
   =========================== */

export function options_syncSocialAuth(request) {
  return ok({ headers: corsHeaders(), body: {} })
}

export async function post_syncSocialAuth(request) {
  try {
    const body = await request.body.json();

    const { provider, email, name, firstName, lastName, picture } = body;

    if (!provider || !email) {
      return badRequest({
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        body: { status: "error", message: "Provider & email required" },
      });
    }

    console.log("🔐 Syncing social login:", provider, email);

    const socialPassword = generateSocialPassword(email, provider);
    let sessionToken;
    let memberId;

    // -------------------------
    // STRATEGY: Try login first, then register if needed
    // This handles cases where member exists but query didn't find them
    // -------------------------
    
    // First, try to login with social password (handles existing social users)
    try {
      sessionToken = await authentication.login(email, socialPassword);
      console.log("✅ Successfully logged in existing social user");

      // Try to get member ID and contact ID from query
      let existingMember = null;
      let contactId = null;
      try {
        let res = await wixData.query("Members/PrivateMembersData")
          .eq("loginEmail", email)
          .limit(1)
          .find();

        if (res.items.length > 0) {
          existingMember = res.items[0];
          memberId = existingMember._id;
          contactId = existingMember.contactId;
        } else {
          res = await wixData.query("Members/PrivateMembersData")
            .eq("contactEmail", email)
            .limit(1)
            .find();

          if (res.items.length > 0) {
            existingMember = res.items[0];
            memberId = existingMember._id;
            contactId = existingMember.contactId;
          }
        }
      } catch (queryErr) {
        console.log("⚠️ Could not query member ID:", queryErr.message);
      }

      // NOTE: Profile picture will be updated by Next.js API using Admin API
      // VELO cannot update member profile photos directly
      // Return memberId so Next.js can update the profile photo
      console.log("📸 Profile picture will be updated by Next.js API for member:", memberId);

      return ok({
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        body: {
          status: "logged_in",
          sessionToken,
          existing: true,
          memberId,
          contactId,
          picture: picture || null, // Pass picture URL to Next.js for updating
        },
      });
    } catch (loginErr) {
      // Login failed - member might not exist or uses different password
      console.log("⚠️ Social password login failed:", loginErr.message);
      
      const loginErrorMsg = loginErr?.message || "";
      
      // If login fails with "not found", member doesn't exist - proceed to register
      if (loginErrorMsg.includes("not found") || loginErrorMsg.includes("Member not found")) {
        console.log("🆕 Member not found, proceeding to register");
        // Continue to registration below
      } else {
        // Member exists but password doesn't match - they use email/password
        console.log("⚠️ Member exists but password mismatch - email/password user");
        return badRequest({
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
          body: {
            status: "error",
            code: "PASSWORD_MISMATCH",
            message: "Account exists but uses email/password login. Please use email/password to login.",
            existing: true,
            email,
          },
        });
      }
    }

    // -------------------------
    // NEW USER → Create and Login
    // -------------------------
    console.log("🆕 Creating new member for social login");
    
    try {
      // Register the new member with social password
      // Try to include profilePhoto if picture is provided
      const profileData = {
        nickname: name || email.split("@")[0],
      };
      
      // Try to add profilePhoto if picture is provided (may not work in VELO)
      if (picture) {
        try {
          profileData.profilePhoto = {
            url: picture,
          };
        } catch (picErr) {
          console.log("⚠️ Could not add profilePhoto to registration:", picErr.message);
        }
      }
      
      const reg = await authentication.register(email, socialPassword, {
        contactInfo: {
          firstName: firstName || name?.split(" ")[0] || "",
          lastName: lastName || name?.split(" ").slice(1).join(" ") || "",
        },
        profile: profileData,
      });

      memberId = reg.memberId || reg.id;
      const contactId = reg.contactId || reg.contact?.id;
      console.log("✅ New member created:", memberId, "contactId:", contactId);

      // NOTE: Profile picture will be updated by Next.js API using Admin API
      // VELO cannot update member profile photos directly
      console.log("📸 Profile picture will be updated by Next.js API for new member:", memberId);

      // Immediately login the new user
      try {
        sessionToken = await authentication.login(email, socialPassword);
        console.log("✅ New user logged in successfully");

        return ok({
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
          body: {
            status: "logged_in",
            sessionToken,
            existing: false,
            memberId,
            contactId,
            picture: picture || null, // Pass picture URL to Next.js for updating
            message: "Account created and logged in successfully",
          },
        });
      } catch (loginErr) {
        console.error("❌ Failed to login newly created user:", loginErr.message);
        
        // Even if login fails, return the member info so frontend can try
        return ok({
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
          body: {
            status: "new_user_created",
            email,
            socialPassword,
            memberId,
            existing: false,
            message: "Account created. Please try logging in.",
          },
        });
      }
    } catch (regErr) {
      console.error("❌ Registration error:", regErr.message);

      // Check if error is because member already exists
      // Handle various error message formats from Wix
      const errorMsg = (regErr?.message || "").toLowerCase();
      const alreadyExistsPatterns = [
        "already exists",
        "duplicate",
        "member already",
        "identity email",
        "email already",
        "already registered"
      ];
      
      const isAlreadyExists = alreadyExistsPatterns.some(pattern => 
        errorMsg.includes(pattern)
      );

      if (isAlreadyExists) {
        // Member exists but login failed earlier - try login again
        // This handles race conditions or cases where query didn't find member
        console.log("🔄 Member exists (from registration error), attempting login again");
        try {
          sessionToken = await authentication.login(email, socialPassword);
          console.log("✅ Member exists, logged in with social password");

          // Try to get memberId from query
          let foundMemberId = null;
          try {
            let res = await wixData.query("Members/PrivateMembersData")
              .eq("loginEmail", email)
              .limit(1)
              .find();

            if (res.items.length > 0) {
              foundMemberId = res.items[0]._id;
            } else {
              res = await wixData.query("Members/PrivateMembersData")
                .eq("contactEmail", email)
                .limit(1)
                .find();

              if (res.items.length > 0) {
                foundMemberId = res.items[0]._id;
              }
            }
          } catch (queryErr) {
            console.log("⚠️ Could not query member ID:", queryErr.message);
          }

          return ok({
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
            body: {
              status: "logged_in",
              sessionToken,
              existing: true,
              memberId: foundMemberId,
              picture: picture || null, // Pass picture URL to Next.js for updating
            },
          });
        } catch (loginErr2) {
          // Still can't login - member exists but uses email/password
          console.log("❌ Cannot login - member uses email/password");
          return badRequest({
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
            body: {
              status: "error",
              code: "PASSWORD_MISMATCH",
              message: "Account already exists but uses email/password login. Please use email/password to login.",
              existing: true,
              email,
            },
          });
        }
      }

      // Other registration error
      return badRequest({
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        body: {
          status: "error",
          message: regErr?.message || "Failed to create account",
        },
      });
    }
  } catch (err) {
    console.error("❌ syncSocialAuth error:", err);
    return serverError({
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: { 
        status: "error", 
        message: err?.message || "Internal server error",
      },
    });
  }
}

