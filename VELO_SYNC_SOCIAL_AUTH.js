import { ok, serverError, badRequest } from "wix-http-functions";
import { authentication } from "wix-members-backend";
import { query } from "wix-data";

// CORS
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function options_syncSocialAuth() {
  return ok({ headers: corsHeaders(), body: {} });
}

export async function post_syncSocialAuth(request) {
  try {
    const body = await request.body.json();

    const { provider, email, name, firstName, lastName, picture } = body;

    if (!provider || !email) {
      return badRequest({
        headers: corsHeaders(),
        body: { status: "error", message: "Provider & email required" },
      });
    }

    console.log("🔐 Syncing social login:", provider, email);

    // -------------------------
    // 1. Lookup existing member
    // -------------------------
    let existingMember = null;
    try {
      const res = await query("Members/PrivateMembersData")
        .eq("loginEmail", email)
        .limit(1)
        .find();

      if (res.items.length > 0) {
        existingMember = res.items[0];
        console.log("Existing member:", existingMember._id);
      }
    } catch (err) {
      console.log("Query failed:", err.message);
    }

    const socialPassword = generateSocialPassword(email, provider);
    let sessionToken;
    let memberId;

    // -------------------------
    // 2. EXISTING USER
    // -------------------------
    if (existingMember) {
      memberId = existingMember._id;

      try {
        sessionToken = await authentication.login(email, socialPassword);

        return ok({
          headers: corsHeaders(),
          body: {
            status: "logged_in",
            sessionToken,
            existing: true,
            memberId,
          },
        });
      } catch (err) {
        return badRequest({
          headers: corsHeaders(),
          body: {
            status: "error",
            code: "PASSWORD_MISMATCH",
            message: "Account exists but uses email/password login.",
            existing: true,
            email,
          },
        });
      }
    }

    // -------------------------
    // 3. NEW USER → Create but DO NOT LOGIN
    // -------------------------
    try {
      const reg = await authentication.register(email, socialPassword, {
        contactInfo: {
          firstName: firstName || name?.split(" ")[0] || "",
          lastName: lastName || name?.split(" ").slice(1).join(" ") || "",
        },
        profile: {
          nickname: name || email.split("@")[0],
          picture: picture || "",
        },
      });

      memberId = reg.memberId || reg.id;

      // 👉 IMPORTANT:
      // Return socialPassword so frontend can log in using Wix's own API
      return ok({
        headers: corsHeaders(),
        body: {
          status: "new_user_created",
          email,
          socialPassword,
          memberId,
          existing: false,
        },
      });
    } catch (regErr) {
      console.log("Registration error:", regErr.message);

      return badRequest({
        headers: corsHeaders(),
        body: {
          status: "error",
          message: "Account already exists",
          existing: true,
        },
      });
    }
  } catch (err) {
    return serverError({
      headers: corsHeaders(),
      body: { status: "error", message: err.message },
    });
  }
}

// -------------------------
// PASSWORD GENERATOR
// -------------------------
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

