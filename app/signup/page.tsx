"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { getWixClient } from "../utillity/wixclient"

export default function SignupPage() {

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email")
  const [step, setStep] = useState<"form" | "otp">("form")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [otp, setOtp] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  console.log("📩 Starting signup process...")

  try {
    // 🧩 1. Basic field validation
    if (!formData.name || !formData.password || !formData.confirmPassword || !formData.email) {
      toast.error("Please fill all required fields")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      setIsLoading(false)
      return
    }

    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      name: formData.name.trim(),
    }

    console.log("🚀 Registering user:", payload)

    // 🧩 2. Call your Velo function
    const response = await fetch("https://chinmaybhatk.wixsite.com/flavorzapp/_functions/registerUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    console.log("[🔗] Response status:", response.status)

    const result = await response.json()
    console.log("[📦] Response body:", result)

    // 🧩 3. Handle errors or success
    if (!response.ok || result.status !== "success") {
      console.error("❌ Signup failed:", result)
      toast.error(result.message || "Signup failed. Please try again.")
      setIsLoading(false)
      return
    }

    // 🧩 4. Success
    toast.success("🎉 Account created successfully!")
    console.log("✅ Member created:", result.member)

    // Optional — if you later add auto-login or redirect
    setTimeout(() => {
      window.location.href = "/login"
    }, 1500)
  } catch (error) {
    console.error("🔥 Signup error:", error)
    toast.error("Something went wrong. Please try again.")
  } finally {
    setIsLoading(false)
  }
}


// Handle social signup/login (Google/Facebook via custom OAuth)
const handleSocialSignup = async (provider: 'google' | 'facebook') => {
  try {
    setIsLoading(true);
    console.log(`🔐 Initiating ${provider} social signup...`);

    // Redirect to our custom OAuth API route
    const redirectUrl = `${window.location.origin}/api/auth/${provider}?redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/callback`)}`;
    
    console.log(`🔗 Redirecting to ${provider} OAuth...`);
    window.location.href = redirectUrl;
  } catch (error: any) {
    console.error(`❌ ${provider} signup error:`, error);
    toast.error(`Failed to initiate ${provider} signup. Please try again.`);
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

      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Account created successfully!")
      window.location.href = "/"
    } catch (error) {
      toast.error("OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (<div>
    <div className="min-h-screen flex bg-black mt-12">
        <Navigation/>
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a1a1a] via-black to-[#0a0a0a] flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#DD9627] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#FED649] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="text-5xl font-serif font-bold bg-gradient-to-r from-[#FED649] via-[#DD9627] to-[#B47B2B] bg-clip-text text-transparent">
              KokoFresh
            </div>
          </div>

          <h2 className="font-serif text-4xl font-bold text-white mb-4">Join Our Flavor Journey</h2>
          <p className="text-[#B47B2B] text-lg mb-8 max-w-md">
            Discover premium spices and authentic flavors that transform your cooking experience
          </p>

          <div className="space-y-4 text-left max-w-md">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-[#FED649] flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold">Premium Quality</p>
                <p className="text-[#B47B2B] text-sm">Sourced from the finest farms</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-[#FED649] flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold">Fast Delivery</p>
                <p className="text-[#B47B2B] text-sm">Fresh to your door in 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-[#FED649] flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold">Exclusive Deals</p>
                <p className="text-[#B47B2B] text-sm">Member-only discounts and offers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-serif text-3xl font-bold bg-gradient-to-r from-[#FED649] via-[#DD9627] to-[#B47B2B] bg-clip-text text-transparent mb-2">
              KokoFresh
            </h1>
          </div>

          {step === "form" ? (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-[#B47B2B]">Start your flavor journey with us</p>
              </div>

              {/* Auth Method Toggle */}
              <div className="flex gap-2 mb-6 bg-[#1a1a1a] p-1 rounded-lg border border-[#333]">
                <button
                  onClick={() => setAuthMethod("email")}
                  className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all ${
                    authMethod === "email"
                      ? "bg-gradient-to-r from-[#DD9627] to-[#FED649] text-black"
                      : "text-[#B47B2B] hover:text-white"
                  }`}
                >
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </button>
                <button
                  onClick={() => setAuthMethod("phone")}
                  className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all ${
                    authMethod === "phone"
                      ? "bg-gradient-to-r from-[#DD9627] to-[#FED649] text-black"
                      : "text-[#B47B2B] hover:text-white"
                  }`}
                >
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-[#333] rounded-lg focus:border-[#DD9627] focus:outline-none bg-[#1a1a1a] text-white placeholder-[#666]"
                  />
                </div>

                {authMethod === "email" ? (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-[#333] rounded-lg focus:border-[#DD9627] focus:outline-none bg-[#1a1a1a] text-white placeholder-[#666]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border border-[#333] rounded-lg focus:border-[#DD9627] focus:outline-none bg-[#1a1a1a] text-white placeholder-[#666]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-[#333] rounded-lg focus:border-[#DD9627] focus:outline-none bg-[#1a1a1a] text-white placeholder-[#666]"
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

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-[#333] rounded-lg focus:border-[#DD9627] focus:outline-none bg-[#1a1a1a] text-white placeholder-[#666]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-110 text-black font-bold py-3 rounded-lg transition-all mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#333]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-[#B47B2B] font-medium">Or continue with</span>
                </div>
              </div>

            <div className="grid grid-cols-2 gap-3">
              {/* GOOGLE SIGNUP */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignup("google")}
                disabled={isLoading}
                className="border border-[#333] hover:bg-[#1a1a1a] text-white font-medium py-2 rounded-lg bg-transparent flex items-center justify-center disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>

              {/* FACEBOOK SIGNUP */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignup("facebook")}
                disabled={isLoading}
                className="border border-[#333] hover:bg-[#1a1a1a] text-white font-medium py-2 rounded-lg bg-transparent flex items-center justify-center disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                Facebook
              </Button>
            </div>


              <p className="text-center text-sm text-[#B47B2B] mt-6">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#FED649] hover:text-[#DD9627] transition-colors">
                  Login here
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl font-bold text-white mb-2">Verify OTP</h1>
                <p className="text-[#B47B2B]">Enter the code sent to your {authMethod}</p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Enter 6-digit OTP</label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-[#333] rounded-lg focus:border-[#DD9627] focus:outline-none bg-[#1a1a1a] text-white text-center text-2xl tracking-widest placeholder-[#666] font-mono"
                  />
                </div>

                <p className="text-xs text-[#B47B2B] text-center">
                  OTP sent to {authMethod === "email" ? formData.email : formData.phone}
                </p>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-110 text-black font-bold py-3 rounded-lg transition-all"
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
                  className="w-full border border-[#333] text-white font-medium py-3 rounded-lg hover:bg-[#1a1a1a]"
                >
                  Back
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
  
    </div>
        <Footer/>
        </div>
  )
}
