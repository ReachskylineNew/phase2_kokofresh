"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { createClient, OAuthStrategy } from "@wix/sdk"
import { members } from "@wix/members"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log("🔄 Handling OAuth callback...")

        // Create Wix client
        const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID || "2656201f-a899-4ec4-8b24-d1132bcf5405"
        const wixClient = createClient({
          modules: { members },
          auth: OAuthStrategy({
            clientId,
          }),
        })

        // Check if this is a custom social auth callback (has sessionToken or tokens in URL)
        const sessionToken = searchParams.get("sessionToken")
        const accessToken = searchParams.get("accessToken")
        const refreshToken = searchParams.get("refreshToken")
        const provider = searchParams.get("provider")

        if (sessionToken || (accessToken && refreshToken)) {
          // Custom social auth flow (Google/Facebook)
          console.log("🔐 Handling custom social auth callback...")

          if (sessionToken) {
            // We have a session token from VELO backend
            console.log("✅ Session token received, applying and converting...")

            // Persist raw session for session-based flows
            try { localStorage.setItem("wixSession", sessionToken) } catch (_) {}

            // 1) Apply the session token via @wix/members to establish identity
            // This MUST be done before getMemberTokensForDirectLogin
            try {
              const { authentication: membersAuth } = await import("@wix/members")
              await membersAuth.applySessionToken(sessionToken)
              console.log("📌 Session token applied via @wix/members")
            } catch (applyErr) {
              console.warn("⚠️ Failed to apply session token via @wix/members:", applyErr)
            }

            // 2) Convert session token to OAuth tokens (preferred)
            // Note: applySessionToken must be called first
            let tokens
            try {
              // Ensure client has the session token context
              tokens = await wixClient.auth.getMemberTokensForDirectLogin(sessionToken)
              console.log("✅ Successfully converted session token to OAuth tokens")
            } catch (convErr: any) {
              console.warn("⚠️ getMemberTokensForDirectLogin failed:", convErr?.message || convErr)
              console.warn("⚠️ Will proceed with session-only mode (decoded JWS)")
              // Don't set tokens - will use session-only mode below
            }

            if (tokens?.accessToken && tokens?.refreshToken) {
              // Store tokens
              Cookies.set("accessToken", JSON.stringify({
                value: tokens.accessToken.value,
                expiresAt: tokens.accessToken.expiresAt,
              }), { sameSite: "Lax" })

              Cookies.set("refreshToken", JSON.stringify({
                value: tokens.refreshToken.value,
              }), { sameSite: "Lax" })

              wixClient.auth.setTokens(tokens)
            } else {
              // 3) Fallback: decode session token payload and persist member basics
              try {
                const clean = sessionToken.startsWith("JWS.") ? sessionToken.slice(4) : sessionToken
                const [hdr, pl] = clean.split(".")
                const decode = (s: string) => {
                  const pad = s.replace(/-/g, "+").replace(/_/g, "/")
                  const str = typeof atob === 'function' ? atob(pad) : Buffer.from(pad, 'base64').toString('binary')
                  return decodeURIComponent(Array.prototype.map.call(str, (c: string) =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                  ).join(''))
                }
                const payload = JSON.parse(decode(pl))
                let data: any
                try {
                  data = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data
                } catch {
                  data = payload.data || {}
                }
                const memberData = {
                  memberId: data.id,
                  contactId: data.contactId,
                  email: data.email,
                  nickname: data.nickname || (data.email ? data.email.split('@')[0] : 'User'),
                  createdAt: data.creationTime,
                  owner: !!data.owner,
                  admin: !!data.admin,
                }
                localStorage.setItem("wixMember", JSON.stringify(memberData))
                console.log("🧩 Session-only member stored from JWS:", memberData)
              } catch (decodeErr) {
                console.error("❌ Failed to decode session token:", decodeErr)
                throw new Error("Failed to get member tokens and decode session token")
              }
            }
          } else if (accessToken && refreshToken) {
            // We have direct tokens from VELO backend
            console.log("✅ Direct tokens received, storing...")
            
            const tokens = {
              accessToken: {
                value: accessToken,
                expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour
              },
              refreshToken: {
                value: refreshToken,
              },
            }

            Cookies.set("accessToken", JSON.stringify(tokens.accessToken), { sameSite: "Lax" })
            Cookies.set("refreshToken", JSON.stringify(tokens.refreshToken), { sameSite: "Lax" })
            wixClient.auth.setTokens(tokens)
          }

          // Get current member to verify login (only if we have tokens)
          let currentMember = null;
          if (tokens?.accessToken && tokens?.refreshToken) {
            try {
              currentMember = await wixClient.members.getCurrentMember()
              console.log("✅ Logged in member:", currentMember.member?.profile?.nickname)
            } catch (memberErr: any) {
              console.warn("⚠️ Could not get current member (non-critical):", memberErr?.message);
              // Don't fail login if this fails - we have session token
            }
          }

          // Store member info (use decoded data if getCurrentMember failed)
          if (currentMember?.member) {
            const memberData = {
              memberId: currentMember.member._id,
              contactId: currentMember.member.contactId,
              email: currentMember.member.profile?.email,
              nickname: currentMember.member.profile?.nickname,
              createdAt: currentMember.member._createdDate,
              owner: false,
              admin: false,
            }
            localStorage.setItem("wixMember", JSON.stringify(memberData))
          } else {
            // If getCurrentMember failed, we already stored member data from JWS decode above
            console.log("✅ Using member data from session token decode");
          }

          // Dispatch auth change event
          window.dispatchEvent(new CustomEvent('authChanged'))

          setStatus("success")
          toast.success(`🎉 ${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Social'} login successful!`)

          setTimeout(() => {
            router.push("/profile")
          }, 1000)
          return
        }

        // Legacy Wix OAuth flow (or fallback from server)
        // Try localStorage first; if missing, read cookie set by server fallback
        let redirectData: any = null
        const oAuthDataLS = localStorage.getItem("oAuthRedirectData")
        if (oAuthDataLS) {
          redirectData = JSON.parse(oAuthDataLS)
        } else {
          const cookieData = Cookies.get("oAuthRedirectData")
          if (cookieData) {
            try {
              redirectData = JSON.parse(cookieData)
              // Persist for subsequent navigations, then clear cookie
              localStorage.setItem("oAuthRedirectData", cookieData)
              Cookies.remove("oAuthRedirectData")
            } catch (_) {
              // ignore
            }
          }
        }

        if (!redirectData) {
          throw new Error("No OAuth redirect data found")
        }

        const oAuthData = JSON.stringify(redirectData)
        console.log("📋 OAuth redirect data:", redirectData)

        // Parse OAuth response from URL
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        const error = searchParams.get("error")

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code || !state) {
          throw new Error("Missing OAuth code or state")
        }

        // Verify state matches
        if (state !== redirectData.state) {
          throw new Error("Invalid OAuth state")
        }

        console.log("✅ OAuth code received, exchanging for tokens...")

        // Exchange code for tokens
        // Some fallbacks may only provide { state }. Pass what we have.
        const tokens = await wixClient.auth.getMemberTokens(
          code,
          state,
          redirectData || {}
        )

        if (!tokens?.accessToken || !tokens?.refreshToken) {
          throw new Error("Failed to get member tokens")
        }

        console.log("✅ Tokens received, storing...")

        // Store tokens in cookies
        Cookies.set("accessToken", JSON.stringify({
          value: tokens.accessToken.value,
          expiresAt: tokens.accessToken.expiresAt,
        }), { sameSite: "Lax" })

        Cookies.set("refreshToken", JSON.stringify({
          value: tokens.refreshToken.value,
        }), { sameSite: "Lax" })

        // Set tokens in client
        wixClient.auth.setTokens(tokens)

        // Get current member to verify login/signup
        let currentMember = null;
        try {
          currentMember = await wixClient.members.getCurrentMember()
          console.log("✅ Logged in member:", currentMember.member?.profile?.nickname)
          console.log("📋 Full member data:", currentMember.member)
        } catch (memberErr: any) {
          console.warn("⚠️ Could not get current member:", memberErr?.message);
          // Continue - tokens are set, member data will be fetched later
        }

        // Store member info in localStorage for consistency with custom login
        if (currentMember?.member) {
          const memberData = {
            memberId: currentMember.member._id,
            contactId: currentMember.member.contactId,
            email: currentMember.member.profile?.email,
            nickname: currentMember.member.profile?.nickname,
            createdAt: currentMember.member._createdDate,
            owner: false,
            admin: false,
          }
          localStorage.setItem("wixMember", JSON.stringify(memberData))
          console.log("✅ Member data stored in localStorage:", memberData)
        } else {
          console.log("⚠️ Could not get member data, but tokens are set - will fetch later");
        }

        // Clear OAuth redirect data
        localStorage.removeItem("oAuthRedirectData")

        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('authChanged'))

        setStatus("success")
        toast.success("🎉 Login successful!")

        // Redirect to profile
        setTimeout(() => {
          router.push("/profile")
        }, 1000)
      } catch (err: any) {
        console.error("❌ OAuth callback error:", err)
        setErrorMessage(err.message || "Authentication failed")
        setStatus("error")
        toast.error(err.message || "Authentication failed. Please try again.")

        // Redirect to login after error
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    }

    handleOAuthCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-[#1a1a1a]">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#FED649] animate-spin" />
              <p className="text-white text-lg">Completing login...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <p className="text-white text-lg">Login successful! Redirecting...</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <p className="text-red-400 text-lg">{errorMessage}</p>
              <p className="text-white text-sm mt-2">Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

