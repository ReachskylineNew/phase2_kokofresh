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

        const clientId =
          process.env.NEXT_PUBLIC_WIX_CLIENT_ID ||
          "2656201f-a899-4ec4-8b24-d1132bcf5405"

        const wixClient = createClient({
          modules: { members },
          auth: OAuthStrategy({ clientId }),
        })

        // Wix now only sends sessionToken
        const sessionToken = searchParams.get("sessionToken")
        const provider = searchParams.get("provider")

        if (sessionToken) {
          console.log("🔐 Received sessionToken")

          // Store session token
          localStorage.setItem("wixSession", sessionToken)
          Cookies.set("sessionToken", sessionToken, { sameSite: "Lax" })

          // Apply the session token to auth
          try {
            const { authentication: membersAuth } = await import("@wix/members")
            await membersAuth.applySessionToken(sessionToken)
            console.log("📌 Session token applied")
          } catch (err) {
            console.error("⚠️ Failed to apply sessionToken:", err)
          }

          // Decode sessionToken → get member info (JWS decode)
          try {
            const clean = sessionToken.startsWith("JWS.")
              ? sessionToken.slice(4)
              : sessionToken

            const [hdr, pl] = clean.split(".")

            const decode = (s: string) => {
              const pad = s.replace(/-/g, "+").replace(/_/g, "/")
              const str =
                typeof atob === "function"
                  ? atob(pad)
                  : Buffer.from(pad, "base64").toString("binary")
              return decodeURIComponent(
                Array.prototype.map
                  .call(str, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              )
            }

            const payload = JSON.parse(decode(pl))
            let data: any

            try {
              data =
                typeof payload.data === "string"
                  ? JSON.parse(payload.data)
                  : payload.data
            } catch {
              data = payload.data || {}
            }

            const memberData = {
              memberId: data.id,
              contactId: data.contactId,
              email: data.email,
              nickname:
                data.nickname || (data.email ? data.email.split("@")[0] : "User"),
              createdAt: data.creationTime,
              owner: !!data.owner,
              admin: !!data.admin,
            }

            localStorage.setItem("wixMember", JSON.stringify(memberData))
            console.log("🧩 Member stored from JWS:", memberData)
          } catch (decodeErr) {
            console.error("❌ Failed decoding sessionToken:", decodeErr)
            throw new Error("Failed to decode session token")
          }

          window.dispatchEvent(new CustomEvent("authChanged"))

          toast.success(
            `🎉 ${provider ? provider[0].toUpperCase() + provider.slice(1) : "Social"
            } login successful!`
          )

          setStatus("success")

          setTimeout(() => router.push("/profile"), 800)
          return
        }

        throw new Error("No session token received")
      } catch (err: any) {
        console.error("❌ OAuth callback error:", err)
        setErrorMessage(err.message || "Authentication failed")
        setStatus("error")
        toast.error(err.message || "Authentication failed")

        setTimeout(() => router.push("/login"), 1800)
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
