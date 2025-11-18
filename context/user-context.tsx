"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import Cookies from "js-cookie";
import { wixClient } from "@/app/utillity/wixclient";

type Profile = any;
type Contact = any;

type UserContextType = {
  profile: Profile | null;
  contact: Contact | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setContact: (contact: Contact | null) => void; // ✅ add this
};


const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const lastRefreshRef = useRef<number>(0); // Move useRef to top level

  // ---- Helpers ----
  async function decodeSessionTokenIfNeeded() {
    try {
      // Check if wixMember already exists (already decoded)
      const storedMember = localStorage.getItem("wixMember");
      if (storedMember) {
        try {
          const memberData = JSON.parse(storedMember);
          if (memberData.memberId && memberData.contactId) {
            console.log("✅ wixMember already exists in localStorage");
            return; // Already decoded
          }
        } catch {
          // Invalid stored data, need to decode again
        }
      }

      // Try to decode from wixSession if wixMember doesn't exist
      const wixSession = localStorage.getItem("wixSession");
      if (!wixSession) return;

      // Parse session token (handle both string and JSON-encoded)
      let sessionToken: string;
      try {
        const parsed = JSON.parse(wixSession);
        sessionToken = typeof parsed === 'string' ? parsed : (parsed?.value || parsed?.sessionToken || wixSession);
      } catch {
        sessionToken = wixSession;
      }

      // Clean up the token
      sessionToken = sessionToken.trim().replace(/^["']|["']$/g, '');

      // Remove "JWS." prefix if present
      const cleanToken = sessionToken.startsWith("JWS.") 
        ? sessionToken.replace("JWS.", "") 
        : sessionToken;

      if (!cleanToken || cleanToken.length < 10) {
        console.error("Invalid session token format");
        return;
      }

      // Decode the token
      const parts = cleanToken.split(".");
      if (parts.length >= 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          
          // Parse the data field
          let data;
          try {
            data = typeof payload.data === 'string' 
              ? JSON.parse(payload.data) 
              : payload.data;
          } catch {
            data = payload.data || payload;
          }

          // Store decoded member data
          localStorage.setItem(
            "wixMember",
            JSON.stringify({
              contactId: data.contactId,
              memberId: data.id,
              metaSiteId: data.metaSiteId,
              sessionId: data.sessionId,
              createdAt: data.creationTime,
              owner: data.owner || false,
              admin: data.admin || false,
            })
          );
          
          console.log("✅ Decoded and stored member data from session token");
        } catch (decodeError) {
          console.error("❌ Failed to decode session token:", decodeError);
        }
      }
    } catch (err) {
      console.error("❌ Error in decodeSessionTokenIfNeeded:", err);
    }
  }

  async function getProfileWithSessionToken() {
    try {
      // First, make sure we have decoded member data
      await decodeSessionTokenIfNeeded();

      // Get stored member data
      const storedMember = localStorage.getItem("wixMember");
      if (!storedMember) {
        console.warn("⚠️ No wixMember data found in localStorage");
        return null;
      }

      try {
        const memberData = JSON.parse(storedMember);
        console.log("✅ Using stored member data from localStorage:", memberData);
        
        // Fetch contact details if we have contactId
        if (memberData.contactId) {
          try {
            const contactDetails = await getContactDetails(memberData.contactId);
            if (contactDetails) {
              console.log("✅ Fetched contact details:", contactDetails);
              
              // Try to get member profile photo
              let profilePhoto = undefined;
              if (memberData.memberId) {
                try {
                  const memberRes = await fetch("/api/get-member", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId: memberData.memberId }),
                  });
                  if (memberRes.ok) {
                    const memberDataRes = await memberRes.json();
                    // Handle different member response structures
                    const member = memberDataRes.member || memberDataRes;
                    const photoUrl = member?.profile?.profilePhoto?.url || 
                                   member?.profilePhoto?.url ||
                                   member?.profileInfo?.profilePhoto?.url;
                    if (photoUrl) {
                      profilePhoto = {
                        url: photoUrl,
                      };
                    }
                  }
                } catch (photoErr) {
                  console.warn("⚠️ Failed to fetch member photo:", photoErr);
                }
              }
              
              return {
                _id: memberData.memberId,
                id: memberData.memberId,
                contactId: memberData.contactId,
                loggedIn: true,
                profile: {
                  nickname: contactDetails.info?.name?.first || contactDetails.primaryInfo?.email?.split("@")[0] || "User",
                  email: contactDetails.primaryInfo?.email || memberData.email,
                  phone: contactDetails.primaryInfo?.phone,
                  photo: profilePhoto, // Use member profilePhoto
                },
                contactInfo: contactDetails.info,
                owner: memberData.owner || false,
                admin: memberData.admin || false,
              };
            } else {
              console.warn("⚠️ Contact details not found, returning basic member data");
            }
          } catch (contactError) {
            console.warn("⚠️ Failed to fetch contact details:", contactError);
          }
        }
        
        // Return basic member data if contact fetch fails or no contactId
        const email = memberData.email || `user-${memberData.memberId?.substring(0, 8)}`;
        return {
          _id: memberData.memberId,
          id: memberData.memberId,
          contactId: memberData.contactId,
          loggedIn: true,
          profile: {
            nickname: email?.split("@")[0] || "User",
            email: email || null,
          },
          owner: memberData.owner || false,
          admin: memberData.admin || false,
        };
      } catch (parseError) {
        console.error("❌ Failed to parse stored member data:", parseError);
        return null;
      }
    } catch (err) {
      console.error("❌ Failed to get profile with session token:", err);
      return null;
    }
  }

  async function getProfile() {
    try {
      // First, ensure we have decoded member data (decode if needed)
      await decodeSessionTokenIfNeeded();
      
      // Try to get member data from localStorage (decoded from session token)
      const storedMember = localStorage.getItem("wixMember");
      if (storedMember) {
        try {
          const memberData = JSON.parse(storedMember);
          console.log("✅ Using member data from localStorage:", memberData);
          
          // Try to fetch contact details for complete profile
          if (memberData.contactId) {
            try {
              const contactDetails = await getContactDetails(memberData.contactId);
              if (contactDetails) {
                console.log("✅ Contact details fetched:", contactDetails);
                // Try to get member profile photo
                let profilePhoto = undefined;
                if (memberData.memberId) {
                  try {
                    const memberRes = await fetch("/api/get-member", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ memberId: memberData.memberId }),
                    });
                    if (memberRes.ok) {
                      const memberDataRes = await memberRes.json();
                      // Handle different member response structures
                      const member = memberDataRes.member || memberDataRes;
                      const photoUrl = member?.profile?.profilePhoto?.url || 
                                     member?.profilePhoto?.url ||
                                     member?.profileInfo?.profilePhoto?.url;
                      if (photoUrl) {
                        profilePhoto = {
                          url: photoUrl,
                        };
                      }
                    }
                  } catch (photoErr) {
                    console.warn("⚠️ Failed to fetch member photo:", photoErr);
                  }
                }

                // Build profile structure matching Wix SDK format
                const profileData = {
                  _id: memberData.memberId,
                  id: memberData.memberId,
                  contactId: memberData.contactId,
                  loggedIn: true,
                  profile: {
                    nickname: contactDetails.info?.name?.first || 
                             contactDetails.primaryInfo?.email?.split("@")[0] || 
                             "User",
                    email: contactDetails.primaryInfo?.email || memberData.email,
                    phone: contactDetails.primaryInfo?.phone,
                    photo: profilePhoto, // Use member profilePhoto, not contact picture
                  },
                  contactInfo: contactDetails.info,
                  owner: memberData.owner || false,
                  admin: memberData.admin || false,
                };
                console.log("📋 Returning profile with contact details:", profileData);
                return profileData;
              } else {
                console.warn("⚠️ Contact details not found");
              }
            } catch (contactError) {
              console.warn("⚠️ Failed to fetch contact details:", contactError);
            }
          }
          
          // Return basic member data if contact fetch fails or no contactId
          // Get email from stored member data or use a default
          const email = memberData.email || `user-${memberData.memberId?.substring(0, 8)}`;
          const basicProfile = {
            _id: memberData.memberId,
            id: memberData.memberId,
            contactId: memberData.contactId,
            loggedIn: true,
            profile: {
              nickname: email?.split("@")[0] || "User",
              email: email || null,
            },
            owner: memberData.owner || false,
            admin: memberData.admin || false,
          };
          console.log("📋 Returning basic profile:", basicProfile);
          return basicProfile;
        } catch (parseError) {
          console.error("❌ Failed to parse stored member data:", parseError);
        }
      } else {
        console.warn("⚠️ No wixMember found in localStorage");
      }

      // Fallback: Try to get profile using session token via API
      console.log("🔄 Trying to get profile via API...");
      const memberFromSession = await getProfileWithSessionToken();
      if (memberFromSession) {
        console.log("✅ Got profile from session token:", memberFromSession);
        return memberFromSession;
      }

      // Last resort: Try OAuth tokens (legacy) or get member directly
      const token = Cookies.get("accessToken");
      const refresh = Cookies.get("refreshToken");
      
      if (token && refresh) {
        try {
          wixClient.auth.setTokens({
            accessToken: JSON.parse(token),
            refreshToken: JSON.parse(refresh),
          });
          const result = await wixClient.members.getCurrentMember();
          if (result?.member) {
            // Member object has profilePhoto in member.profile.profilePhoto
            return result.member;
          }
        } catch (err) {
          console.warn("Failed to use OAuth tokens:", err);
        }
      }

      // Try to get member using Admin API if we have memberId
      const storedMemberData = localStorage.getItem("wixMember");
      if (storedMemberData) {
        try {
          const memberDataFromStorage = JSON.parse(storedMemberData);
          if (memberDataFromStorage.memberId) {
            // Fetch member with profile photo using Admin API
            try {
              const memberRes = await fetch("/api/get-member", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId: memberDataFromStorage.memberId }),
              });
              if (memberRes.ok) {
                const memberResponse = await memberRes.json();
                if (memberResponse.member) {
                  return memberResponse.member;
                }
              }
            } catch (memberErr) {
              console.warn("⚠️ Failed to fetch member:", memberErr);
            }
          }
        } catch (parseErr) {
          // Ignore
        }
      }

      console.warn("⚠️ No profile found from any source");
      return null;
    } catch (err) {
      console.error("❌ Failed to get profile:", err);
      return null;
    }
  }

  async function getContactDetails(contactId: string) {
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        body: JSON.stringify({ contactId }),
      });
      if (!res.ok) throw new Error("Failed to fetch contact");
      const data = await res.json();
      return data.contact || null;
    } catch (err) {
      console.error("Failed to fetch contact:", err);
      return null;
    }
  }

  // ---- Verify OAuth Redirect (legacy - kept for backward compatibility) ----
  async function verifyLogin() {
    // First, check if we have wixSession (custom login takes precedence)
    const wixSession = localStorage.getItem("wixSession");
    if (wixSession) {
      // Custom login session exists, getProfile() will handle it
      // No need to convert - just refresh user which will use the session token
      console.log("✅ Found wixSession, will use it to get profile");
      return;
    }

    // Fallback to OAuth flow (if needed for backward compatibility)
    const data = JSON.parse(localStorage.getItem("oAuthRedirectData") || "null");
    try {
      const { code, state } = wixClient.auth.parseFromUrl();
      if (!code || !state || !data) return;

      const tokens = await wixClient.auth.getMemberTokens(code, state, data);
      Cookies.set("accessToken", JSON.stringify(tokens.accessToken));
      Cookies.set("refreshToken", JSON.stringify(tokens.refreshToken));

      await refreshUser();

      // Dispatch auth change event to notify cart context
      window.dispatchEvent(new CustomEvent('authChanged'));

      localStorage.removeItem("oAuthRedirectData");
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      // OAuth verification failed, but that's okay if we're using custom login
      console.error("verifyLogin error:", err);
    }
  }

  // ---- Refresh User ----
  const refreshUser = async (shouldDispatchAuthChange = false) => {
    setLoading(true);
    try {
      console.log("🔄 Refreshing user profile...");
      const userProfile = await getProfile();
      console.log("📋 User profile result:", userProfile);
      
      // Check if profile actually changed
      const profileChanged = JSON.stringify(profile) !== JSON.stringify(userProfile);
      
      if (userProfile) {
        setProfile(userProfile);
        console.log("✅ Profile set in state:", userProfile);

        if (userProfile.contactId) {
          try {
            const contactDetails = await getContactDetails(userProfile.contactId);
            if (contactDetails) {
              setContact(contactDetails);
              console.log("✅ Contact details set:", contactDetails);
            }
          } catch (contactError) {
            console.warn("⚠️ Failed to fetch contact details:", contactError);
          }
        }

        // Only dispatch auth change event if explicitly requested AND profile changed
        // This prevents infinite loops when refreshUser is called repeatedly
        if (shouldDispatchAuthChange && profileChanged) {
          console.log("📢 Dispatching authChanged event (profile changed)");
          window.dispatchEvent(new CustomEvent('authChanged'));
        }
      } else {
        // Only dispatch if we had a profile before and now we don't (logout scenario)
        if (profile && shouldDispatchAuthChange) {
          console.log("📢 Dispatching authChanged event (profile cleared)");
          window.dispatchEvent(new CustomEvent('authChanged'));
        }
        console.warn("⚠️ No user profile returned from getProfile()");
        setProfile(null);
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await verifyLogin(); // ✅ catch redirect first
      await refreshUser();
    })();
  }, []);

  // Separate useEffect for auth change listener
  useEffect(() => {
    // Listen for auth changes (e.g., after login)
    const handleAuthChange = () => {
      // Debounce refresh calls - only refresh if last refresh was > 2 seconds ago
      const now = Date.now();
      if (now - lastRefreshRef.current < 2000) {
        console.log("⏭️ Skipping user refresh - too soon after last refresh");
        return;
      }
      lastRefreshRef.current = now;
      
      // Don't dispatch authChange when refreshing in response to authChange (prevent loop)
      refreshUser(false);
    };

    window.addEventListener("authChanged", handleAuthChange);
    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []); // Empty dependency array

  return (
    <UserContext.Provider value={{ profile, contact, loading, refreshUser,setContact }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}

