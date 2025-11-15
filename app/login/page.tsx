"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Mail, Phone, ArrowRight, Eye, EyeOff, Loader2, LogOut } from "lucide-react"
import { toast } from "sonner"
import Cookies from "js-cookie"

import { createClient, OAuthStrategy, TokenRole } from "@wix/sdk";
import { members } from "@wix/members";
export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email")
  const [step, setStep] = useState<"form" | "otp">("form")
  const [accountExists, setAccountExists] = useState(false)
  const [existingEmail, setExistingEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  })

  const [otp, setOtp] = useState("")

  // Use the same client ID as the rest of the app
  const myWixClient = createClient({
    modules: { members },
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID || "2656201f-a899-4ec4-8b24-d1132bcf5405",
    }),
  });

  // Check for accountExists query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const accountExistsParam = urlParams.get("accountExists")
    const emailParam = urlParams.get("email")

    if (accountExistsParam === "true" && emailParam) {
      setAccountExists(true)
      setExistingEmail(emailParam)
      setFormData(prev => ({ ...prev, email: emailParam }))
      setAuthMethod("email")
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])
//   useEffect(() => {
//     const accessToken = Cookies.get("accessToken")
//     setIsLoggedIn(!!accessToken)
//   }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

async function getAndSetMemberTokens(sessionToken:any) {
  // Call the function
  const tokens = await myWixClient.auth.getMemberTokensForDirectLogin(sessionToken);

  // Set the tokens as the active tokens for the client
  myWixClient.auth.setTokens(tokens);

  console.log("Access Token:", tokens.accessToken.value);
  console.log("Refresh Token:", tokens.refreshToken.value);

  // Now the client is authenticated and you can make API calls on behalf of the member
  const currentMember = await myWixClient.members.getCurrentMember();
  console.log("Logged in member:", currentMember.member?.profile?.nickname);
}
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ✅ 1. Validate email & password
      if (!formData.email || !formData.password) {
        toast.warning("⚠️ Please enter both email and password.")
        setIsLoading(false)
        return
      }

      console.log("📩 Logging in with:", formData.email)

      // ✅ 2. Call your custom Wix login function (VELO backend)
      const wixLoginRes = await fetch("https://kokofresh.in/_functions/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      if (!wixLoginRes.ok) {
        const errorData = await wixLoginRes.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed with status ${wixLoginRes.status}`);
      }

      const wixLoginData = await wixLoginRes.json()
      console.log("[📦] loginUser result:", wixLoginData)

      // Check if VELO backend already returned access/refresh tokens
      if (wixLoginData.accessToken && wixLoginData.refreshToken) {
        console.log("✅ VELO backend returned tokens directly");
        
        // Format tokens for Wix SDK
        const tokens = {
          accessToken: {
            value: wixLoginData.accessToken.value || wixLoginData.accessToken,
            expiresAt: wixLoginData.accessToken.expiresAt || (Math.floor(Date.now() / 1000) + 3600),
          },
          refreshToken: {
            value: wixLoginData.refreshToken.value || wixLoginData.refreshToken,
            expiresAt: wixLoginData.refreshToken.expiresAt || (Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)),
            role: "user" as any,
          },
        };
        
        // Store tokens in cookies
        Cookies.set("accessToken", JSON.stringify(tokens.accessToken));
        Cookies.set("refreshToken", JSON.stringify(tokens.refreshToken));

        // Set tokens in the client
        myWixClient.auth.setTokens(tokens);

        // Verify login worked
        const currentMember = await myWixClient.members.getCurrentMember();
        console.log("✅ Logged in member:", currentMember.member?.profile?.nickname);

        window.dispatchEvent(new Event("authChanged"))
        toast.success("🎉 Welcome back!")
        setTimeout(() => {
          window.location.href = "/profile"
        }, 1000)
        return;
      }

      // Extract session token (handle different response formats)
      const sessionToken = wixLoginData.sessionToken || wixLoginData.data?.sessionToken || wixLoginData.token;
      
      if (!sessionToken) {
        console.error("Login response:", wixLoginData);
        throw new Error("No session token or access tokens received from login. Please check the API response.")
      }

      // Get session token string (handle both string and object formats)
      const sessionTokenString = typeof sessionToken === 'string' 
        ? sessionToken.trim()
        : String(sessionToken).trim();

      if (!sessionTokenString || sessionTokenString.length < 10) {
        throw new Error("Invalid session token format")
      }

      // Store session token in localStorage (store as string, not double-encoded)
      localStorage.setItem("wixSession", sessionTokenString);
      console.log("✅ Session token stored in localStorage");

      // Decode session token and store member data
      try {
        // Remove "JWS." prefix if present
        const cleanToken = sessionTokenString.startsWith("JWS.") 
          ? sessionTokenString.replace("JWS.", "") 
          : sessionTokenString;
        
        const parts = cleanToken.split(".");
        if (parts.length >= 3) {
          // Decode JWS header and payload
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          
          console.log("🧠 Decoded token header:", header);
          console.log("🧠 Decoded token payload:", payload);
          
          // The data field is a JSON string, so parse it
          let data;
          try {
            data = typeof payload.data === 'string' 
              ? JSON.parse(payload.data) 
              : payload.data;
            console.log("🧠 Decoded user data:", data);
          } catch (parseError) {
            console.warn("⚠️ payload.data is already plain JSON or not nested:", parseError);
            data = payload.data || payload;
          }
          
          // Store member data in localStorage for quick access
          localStorage.setItem(
            "wixMember",
            JSON.stringify({
              contactId: data.contactId,
              memberId: data.id,
              metaSiteId: data.metaSiteId,
              sessionId: data.sessionId,
              email: formData.email,
              createdAt: data.creationTime,
              owner: data.owner || false,
              admin: data.admin || false,
            })
          );
          
          console.log("✅ Member data stored in localStorage");
        } else {
          console.warn("⚠️ Token doesn't have 3 parts, might be invalid format");
        }
      } catch (decodeError) {
        console.error("❌ Could not decode session token:", decodeError);
        console.warn("⚠️ Token is still stored, but decoding failed");
      }

      // Notify the app that auth has changed
      // Use a small delay to ensure localStorage is updated before cart reload
      // Only dispatch once after successful login
      setTimeout(() => {
        console.log("📢 Dispatching authChanged event after login");
        window.dispatchEvent(new Event("authChanged"))
      }, 200)
      
      toast.success("🎉 Welcome back!")
      setTimeout(() => {
        window.location.href = "/profile"
      }, 1000)
    } catch (err) {
      console.error("🔥 Login error:", err)
      toast.error("Something went wrong. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }



  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // Clear all auth data
      localStorage.removeItem("wixSession")
      Cookies.remove("accessToken")
      Cookies.remove("refreshToken")
      
      // Clear tokens from client
      myWixClient.auth.setTokens(null as any)
      
      window.dispatchEvent(new Event("authChanged"))
      
      toast.success("👋 Logged out successfully!")
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } catch (err) {
      console.error("🔥 Logout error:", err)
      toast.error("Failed to logout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social login (Google/Facebook via custom OAuth)
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      console.log(`🔐 Initiating ${provider} social login...`);

      // Redirect to our custom OAuth API route
      const redirectUrl = `${window.location.origin}/api/auth/${provider}?redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/callback`)}`;
      
      console.log(`🔗 Redirecting to ${provider} OAuth...`);
      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error(`❌ ${provider} login error:`, error);
      toast.error(`Failed to initiate ${provider} login. Please try again.`);
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!otp || otp.length !== 6) {
        toast.error("Please enter valid 6-digit OTP")
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Login successful!")
      window.location.href = "/"
    } catch (error) {
      toast.error("OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-[#1a1a1a] mt-9">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-20">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold text-[#3B2B13] mb-2">
                {isLoggedIn ? "Account" : "Welcome Back"}
              </h1>
              <p className="text-[#6B4A0F] text-sm">
                {isLoggedIn
                  ? "You are logged in"
                  : accountExists
                    ? "This email is already registered. Please sign in with your password."
                    : step === "form"
                      ? "Login to your KokoFresh account"
                      : "Verify your identity"}
              </p>
            </div>

            {/* Account Exists Alert */}
            {accountExists && (
              <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Account Already Exists
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        An account with <strong>{existingEmail}</strong> already exists.
                        Please enter your password to sign in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="bg-[#FFF6CC] border-2 border-[#EAD9A2] rounded-lg p-4 text-center">
                  <p className="text-[#3B2B13] font-medium mb-2">You are currently logged in</p>
                  <p className="text-sm text-[#6B4A0F] mb-4">Click below to logout and clear your cart</p>
                </div>

                <Button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setIsLoggedIn(false)}
                  variant="outline"
                  className="w-full border-2 border-[#EAD9A2] text-[#3B2B13] font-medium py-3 rounded-lg hover:bg-[#FFF6CC]"
                >
                  Login with Different Account
                </Button>
              </div>
            ) : step === "form" ? (
              <>
                {/* Auth Method Toggle */}
                <div className="flex gap-2 mb-6 bg-[#FFF6CC] p-1 rounded-lg">
                  <button
                    onClick={() => setAuthMethod("email")}
                    className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all ${
                      authMethod === "email" ? "bg-[#DD9627] text-white" : "text-[#6B4A0F] hover:bg-white/50"
                    }`}
                  >
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </button>
                  <button
                    onClick={() => setAuthMethod("phone")}
                    className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all ${
                      authMethod === "phone" ? "bg-[#DD9627] text-white" : "text-[#6B4A0F] hover:bg-white/50"
                    }`}
                  >
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email or Phone */}
                  {authMethod === "email" ? (
                    <div>
                      <label className="block text-sm font-medium text-[#3B2B13] mb-2">Email Address</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border-2 border-[#EAD9A2] rounded-lg focus:border-[#DD9627] focus:outline-none bg-white text-[#3B2B13] placeholder-[#B47B2B]/50"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-[#3B2B13] mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 border-2 border-[#EAD9A2] rounded-lg focus:border-[#DD9627] focus:outline-none bg-white text-[#3B2B13] placeholder-[#B47B2B]/50"
                      />
                    </div>
                  )}

                  {/* Password - Only for Email */}
                  {authMethod === "email" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-[#3B2B13]">Password</label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-[#DD9627] hover:text-[#B47B2B] font-medium"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 border-2 border-[#EAD9A2] rounded-lg focus:border-[#DD9627] focus:outline-none bg-white text-[#3B2B13] placeholder-[#B47B2B]/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B47B2B] hover:text-[#DD9627]"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-bold py-3 rounded-lg transition-all mt-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#EAD9A2]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#B47B2B] font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="border-2 border-[#EAD9A2] hover:bg-[#FFF6CC] text-[#3B2B13] font-medium py-2 rounded-lg bg-transparent disabled:opacity-50"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={isLoading}
                    className="border-2 border-[#EAD9A2] hover:bg-[#FFF6CC] text-[#3B2B13] font-medium py-2 rounded-lg bg-transparent disabled:opacity-50"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                    </svg>
                    Facebook
                  </Button>
                </div>

                {/* Signup Link */}
                <p className="text-center text-sm text-[#6B4A0F] mt-6">
                  Don't have an account?{" "}
                  <Link href="/signup" className="font-bold text-[#DD9627] hover:text-[#B47B2B] transition-colors">
                    Sign up here
                  </Link>
                </p>
              </>
            ) : (
              <>
                {/* OTP Form */}
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#3B2B13] mb-2">Enter 6-digit OTP</label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-[#EAD9A2] rounded-lg focus:border-[#DD9627] focus:outline-none bg-white text-[#3B2B13] text-center text-2xl tracking-widest placeholder-[#B47B2B]/50 font-mono"
                    />
                  </div>

                  <p className="text-xs text-[#B47B2B] text-center">OTP sent to {formData.phone}</p>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-bold py-3 rounded-lg transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify OTP
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setStep("form")}
                    variant="outline"
                    className="w-full border-2 border-[#EAD9A2] text-[#3B2B13] font-medium py-3 rounded-lg hover:bg-[#FFF6CC]"
                  >
                    Back
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
