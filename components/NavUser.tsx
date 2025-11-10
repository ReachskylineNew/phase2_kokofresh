"use client";

import { Button } from "../components/ui/button";
import Link from "next/link";
import { wixClient } from "@/app/utillity/wixclient";
import Cookies from "js-cookie";
import { useUser } from "@/context/user-context";

export default function NavUser() {
  const { profile, contact, loading } = useUser();

  const logout = async () => {
    try {
      // Clear user session data (member authentication)
      localStorage.removeItem("wixSession");
      localStorage.removeItem("wixMember"); // Clear decoded member data too
      
      // Clear OAuth tokens if they exist (for legacy OAuth login)
      // BUT keep visitor tokens (accessToken/refreshToken) for cart persistence
      // Visitor tokens are used for anonymous cart and should persist across login/logout
      const hasOAuthTokens = Cookies.get("accessToken") || Cookies.get("refreshToken");
      if (hasOAuthTokens) {
        // Only clear if they're OAuth tokens, not visitor tokens
        // We can't easily distinguish, so we'll keep them for cart
        // The cart context will handle visitor tokens separately
      }
      
      // Clear tokens from client SDK (but not visitor tokens)
      wixClient.auth.setTokens(undefined);
      
      // Dispatch auth change event (but cart should keep using visitor tokens)
      window.dispatchEvent(new CustomEvent('authChanged'));
      
      // Redirect to home
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      // Still redirect even if logout fails
      window.location.href = "/";
    }
  };

  const login = async () => {
    // Redirect to custom login page instead of OAuth
    window.location.href = "/login";
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse" />
    );
  }

  const linkClasses =
    "text-white/90 text-sm lg:text-base font-semibold px-3 py-2 rounded-md transition-colors duration-300 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-[#DD9627] hover:via-[#FED649] hover:to-[#B47B2B]";

  // Check if user is logged in (has profile or session token)
  const hasSessionToken = typeof window !== "undefined" && localStorage.getItem("wixSession");
  const isLoggedIn = profile || hasSessionToken;
  
  // Debug logging
  if (typeof window !== "undefined") {
    console.log("NavUser - Profile:", profile);
    console.log("NavUser - Has session token:", hasSessionToken);
    console.log("NavUser - Is logged in:", isLoggedIn);
  }
  
  return isLoggedIn ? (
    <div className="flex items-center gap-3">
      {/* 👤 Profile Avatar / Image */}
      <Link
        href="/profile"
        className={`flex items-center gap-2 ${linkClasses}`}
      >
        {profile?.profile?.photo?.url ? (

         <img
  src={profile.profile.photo.url}
  alt={profile?.profile?.nickname || "Profile"}
  loading="lazy"
  decoding="async"
  
  className="w-8 h-8 rounded-full border-2 border-[#FED649] shadow-sm"
/>

        ) : (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FED649]/30 text-[#DD9627] font-bold border border-[#FED649]/50 shadow-sm">
            {getInitials(profile?.profile?.nickname || "U")}
          </div>
        )}
        <span>{profile?.profile?.nickname || "User"}</span>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className={`${linkClasses} border border-[#DD9627]`}
      >
        Sign Out
      </Button>
    </div>
  ) : (
    <Button
      size="sm"
      onClick={login}
      className={`${linkClasses} bg-[#DD9627] border-0`}
    >
      Sign In
    </Button>
  );
}
