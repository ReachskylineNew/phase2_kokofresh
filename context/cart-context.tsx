"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import Cookies from "js-cookie"
import { getWixClient } from "../app/utillity/wixclient"

const BASE_URL = "https://www.wixapis.com/ecom/v1"
const APP_ID = "1380b703-ce81-ff05-f115-39571d94df35"

type VisitorAuth = {
  access_token: string
  refresh_token: string
  expires_at: number
}

type CartItem = {
  id: string
  quantity: number
  catalogReference: any
}

type Cart = {
  lineItems: CartItem[]
}

type CartContextType = {
  cart: Cart
  loading: boolean
  add: (productId: string, qty: number, options?: { name: string; value: string }[], variantId?: string) => Promise<any>
  updateQuantity: (lineItemId: string, qty: number) => Promise<void>
  remove: (lineItemId: string) => Promise<void>
  checkout: () => Promise<void>
  reload: () => Promise<void>
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ lineItems: [] })
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<VisitorAuth | null>(null)
  const [isLoadingCart, setIsLoadingCart] = useState(false) // Prevent loading loops
  const lastAuthChangeRef = useRef<number>(0) // Track last auth change time
  const isLoadingCartRef = useRef<boolean>(false) // Ref version for event handlers

  // Create or refresh visitor tokens and persist them in cookies
  const fetchAndPersistTokens = async (existingRefreshToken?: string): Promise<VisitorAuth> => {
    const res = await fetch("/api/visitor-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(existingRefreshToken ? { refreshToken: existingRefreshToken } : {}),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to obtain visitor tokens: ${errorText}`)
    }

    const data = await res.json()
    const accessToken = data.access_token as string
    const refreshToken = (data.refresh_token as string) || existingRefreshToken
    const expiresIn = (data.expires_in as number) ?? 3600 // seconds

    const expiresAtMs = Date.now() + expiresIn * 1000

    // Persist in cookies in the shape this file expects
    Cookies.set("accessToken", JSON.stringify({ value: accessToken, expiresAt: Math.floor(expiresAtMs / 1000) }), {
      sameSite: "Lax",
    })
    if (refreshToken) {
      // refresh token usually has long expiry, we still store similarly
      Cookies.set("refreshToken", JSON.stringify({ value: refreshToken }), { sameSite: "Lax" })
    }

    const newAuth: VisitorAuth = {
      access_token: accessToken,
      refresh_token: refreshToken || "",
      expires_at: expiresAtMs,
    }
    setAuth(newAuth)
    return newAuth
  }

  const ensureAuth = async (): Promise<VisitorAuth> => {
    // Check if we have valid auth in state
    if (auth && typeof auth === 'object' && auth.access_token && typeof auth.access_token === 'string' && Date.now() < auth.expires_at) {
      return auth;
    }

    const accessRaw = Cookies.get("accessToken")
    const refreshRaw = Cookies.get("refreshToken")

    let parsedAccess: any = null
    let parsedRefresh: any = null

    try {
      if (accessRaw) {
        parsedAccess = JSON.parse(accessRaw)
      }
      if (refreshRaw) {
        parsedRefresh = JSON.parse(refreshRaw)
      }
    } catch (parseError) {
      console.error("Failed to parse auth cookies:", parseError);
      // If parsing fails, create new tokens
      return fetchAndPersistTokens()
    }

    if (parsedAccess?.value && typeof parsedAccess.value === 'string' && parsedRefresh?.value && typeof parsedRefresh.value === 'string') {
      // If access token is near expiry (<= 10s), proactively refresh
      const expiresAtMs = parsedAccess.expiresAt ? parsedAccess.expiresAt * 1000 : Date.now()
      if (Date.now() + 10_000 >= expiresAtMs) {
        return fetchAndPersistTokens(parsedRefresh.value)
      }

      const newAuth: VisitorAuth = {
        access_token: parsedAccess.value,
        refresh_token: parsedRefresh.value,
        expires_at: expiresAtMs,
      }
      setAuth(newAuth)
      return newAuth
    }

    // No cookies yet → create anonymous visitor tokens
    return fetchAndPersistTokens(parsedRefresh?.value && typeof parsedRefresh.value === 'string' ? parsedRefresh.value : undefined)
  }

  // Initial load - only run once on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const activeAuth = await ensureAuth()
        if (isMounted && activeAuth?.access_token) {
          await load(activeAuth)
        }
      } catch (e) {
        console.error("Initial cart load error:", e)
        if (isMounted) {
          setLoading(false)
          setIsLoadingCart(false)
          isLoadingCartRef.current = false
        }
      }
    })()
    
    return () => {
      isMounted = false;
    };
  }, []) // Empty dependency array - only run once

  // Listen for authentication changes and reload cart
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isHandlingAuthChange = false;
    
    const handleAuthChange = (event?: Event) => {
      // Prevent rapid-fire reloads (debounce)
      const now = Date.now()
      if (now - lastAuthChangeRef.current < 2000) {
        console.log("⏭️ Skipping cart reload - too soon after last change");
        return;
      }
      
      // Prevent if already handling
      if (isHandlingAuthChange) {
        console.log("⏭️ Skipping cart reload - already handling auth change");
        return;
      }

      // Prevent loading if already loading - use ref to get current value
      if (isLoadingCartRef.current) {
        console.log("⏭️ Skipping cart reload - already loading");
        return;
      }

      lastAuthChangeRef.current = now;
      isHandlingAuthChange = true;

      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Small delay to ensure cookies are updated
      timeoutId = setTimeout(async () => {
        try {
          const activeAuth = await ensureAuth()
          // Verify we have valid auth data before loading
          if (activeAuth?.access_token && typeof activeAuth.access_token === 'string') {
            await load(activeAuth)
          } else {
            console.warn("⚠️ Invalid auth data, skipping cart reload");
          }
        } catch (e) {
          console.error("Failed to reload cart on auth change:", e)
        } finally {
          isHandlingAuthChange = false;
        }
      }, 500)
    }

    // Listen for storage events (when tokens are updated in other tabs)
    // Only reload if the key that changed is related to auth
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'wixSession' || e.key === 'wixMember' || e.key?.includes('Token')) {
        handleAuthChange(e);
      }
    }

    window.addEventListener("storage", handleStorage)

    // Listen for custom auth change events
    window.addEventListener("authChanged", handleAuthChange)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("authChanged", handleAuthChange)
      isHandlingAuthChange = false;
    }
  }, []) // Empty dependency array to avoid re-creating listeners

  // Load cart
  const load = async (authData = auth) => {
    // Validate authData
    if (!authData || typeof authData !== 'object') {
      console.warn("⚠️ Invalid auth data provided to load cart:", authData);
      setLoading(false);
      setIsLoadingCart(false);
      isLoadingCartRef.current = false;
      return;
    }

    // Validate access_token is a string
    if (!authData.access_token || typeof authData.access_token !== 'string') {
      console.warn("⚠️ Invalid access_token in auth data:", authData.access_token);
      setLoading(false);
      setIsLoadingCart(false);
      isLoadingCartRef.current = false;
      return;
    }
    
    // Prevent concurrent loads - use ref for immediate check
    if (isLoadingCartRef.current) {
      console.log("⏭️ Cart load already in progress, skipping");
      return;
    }

    isLoadingCartRef.current = true;
    setIsLoadingCart(true);
    setLoading(true);
    
    try {
      // Ensure BASE_URL is a string
      const url = `${BASE_URL}/carts/current`;
      if (!url || url.includes('[object')) {
        throw new Error(`Invalid URL: ${url}`);
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authData.access_token}` },
      })

      if (res.status === 404) {
        console.log("ℹ️ No cart found (404), setting empty cart");
        setCart({ lineItems: [] })
        setLoading(false)
        setIsLoadingCart(false)
        isLoadingCartRef.current = false
        return
      }

      if (!res.ok) {
        console.error("❌ Failed to load cart:", res.status, res.statusText);
        setCart({ lineItems: [] })
        setLoading(false)
        setIsLoadingCart(false)
        isLoadingCartRef.current = false
        return
      }

      const data = await res.json()
      const cartData = data?.cart || { lineItems: [] }
      
      // Validate cart data structure to prevent [object Object] issues
      if (cartData && typeof cartData === 'object') {
        // Ensure lineItems is an array
        if (!Array.isArray(cartData.lineItems)) {
          cartData.lineItems = []
        }
        
        // Validate each item has required fields and fix any object URLs
        cartData.lineItems = cartData.lineItems.map((item: any) => {
          if (item && typeof item === 'object') {
            // Ensure image.url is a string, not an object
            if (item.image && typeof item.image === 'object') {
              if (item.image.url && typeof item.image.url !== 'string') {
                item.image = { url: typeof item.image.url === 'object' ? item.image.url?.url || '' : String(item.image.url || '') }
              }
            }
            // Ensure id is a string
            if (item.id && typeof item.id !== 'string') {
              item.id = String(item.id)
            }
          }
          return item
        })
      }
      
      console.log("✅ Cart loaded:", cartData?.lineItems?.length || 0, "items");
      setCart(cartData)
    } catch (err) {
      console.error("❌ Failed to load cart", err)
      setCart({ lineItems: [] })
    } finally {
      setLoading(false)
      setIsLoadingCart(false)
      isLoadingCartRef.current = false
    }
  }

  const add = async (
    productId: string,
    qty: number,
    options?: { name: string; value: string }[],
    variantId?: string,
  ) => {
    const activeAuth = await ensureAuth()

    // Convert array of options into object { weight: "200gms", ... }
    const optionsObj = options?.reduce((acc, opt) => ({ ...acc, [opt.name]: opt.value }), {}) || {}

    const payload = {
      lineItems: [
        {
          catalogReference: {
            appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e", // ✅ correct appId
            catalogItemId: productId, // product ID passed from UI
            options: {
              ...(variantId ? { variantId } : {}),
              ...(Object.keys(optionsObj).length ? { options: optionsObj } : {}),
            },
          },
          quantity: qty,
        },
      ],
    }

    const res = await fetch(`${BASE_URL}/carts/current/add-to-cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeAuth.access_token}`,
      },
      body: JSON.stringify(payload),
    })

    if (res.status === 401) {
      // Try refreshing using refreshToken via backend, then retry once
      const refreshRaw = Cookies.get("refreshToken")
      let parsedRefresh: any = null
      if (refreshRaw) {
        try {
          parsedRefresh = JSON.parse(refreshRaw)
        } catch {}
      }
      try {
        await fetchAndPersistTokens(parsedRefresh?.value)
        return add(productId, qty, options, variantId)
      } catch (e) {
        // fallthrough to parse error
      }
    }

    const data = await res.json()
    setCart(data?.cart || { lineItems: [] })
    return data?.cart
  }

  // Update quantity
  const updateQuantity = async (lineItemId: string, qty: number) => {
    const activeAuth = await ensureAuth()

    const res = await fetch(`${BASE_URL}/carts/current/update-line-items-quantity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeAuth.access_token}`,
      },
      body: JSON.stringify({ lineItems: [{ id: lineItemId, quantity: qty }] }),
    })

    const data = await res.json()
    setCart(data?.cart || { lineItems: [] })
  }

  // Remove item
  const remove = async (lineItemId: string) => {
    const activeAuth = await ensureAuth()

    const res = await fetch(`${BASE_URL}/carts/current/remove-line-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeAuth.access_token}`,
      },
      body: JSON.stringify({ lineItemIds: [lineItemId] }),
    })

    const data = await res.json()
    setCart(data?.cart || { lineItems: [] })
  }

  const checkout = async () => {
    try {
      const activeAuth = await ensureAuth()

      if (!cart?.lineItems?.length) {
        console.error("Cannot checkout, cart is empty")
        return
      }

      const wixClient = getWixClient()

      // 🧠 Sync SDK tokens with current visitor
      wixClient.auth.setTokens({
        accessToken: { value: activeAuth.access_token },
        refreshToken: { value: activeAuth.refresh_token },
      })

      // 🛒 Fetch current cart
      const currentCart = await wixClient.currentCart.getCurrentCart()
      console.log("🛍️ Current cart:", currentCart)

      // ✅ Fixed check
      if (!currentCart?._id) {
        throw new Error("No current cart found after syncing tokens")
      }

      // 📧 Get user contact info for buyer details
      let buyerInfo: any = undefined;
      try {
        const wixMember = localStorage.getItem("wixMember");
        if (wixMember) {
          const memberData = JSON.parse(wixMember);
          
          // Try to get contact details from user context or API
          try {
            const contactRes = await fetch("/api/contacts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contactId: memberData.contactId }),
            });
            
            if (contactRes.ok) {
              const contactData = await contactRes.json();
              const contact = contactData.contact;
              
              if (contact) {
                buyerInfo = {
                  email: contact.primaryInfo?.email,
                  firstName: contact.info?.name?.first,
                  lastName: contact.info?.name?.last,
                  phone: contact.primaryInfo?.phone,
                };
                console.log("✅ Buyer info prepared:", buyerInfo);
              }
            }
          } catch (contactError) {
            console.warn("⚠️ Failed to fetch contact details:", contactError);
            // Fallback to email from member data
            if (memberData.email) {
              buyerInfo = {
                email: memberData.email,
              };
            }
          }
        }
      } catch (buyerInfoError) {
        console.warn("⚠️ Failed to prepare buyer info:", buyerInfoError);
      }

      // 🧾 Create checkout with buyer info if available
      const checkoutOptions: any = {
        channelType: "WEB",
      };

      if (buyerInfo) {
        checkoutOptions.buyerInfo = {
          ...(buyerInfo.email && { email: buyerInfo.email }),
          ...(buyerInfo.phone && { phone: buyerInfo.phone }),
        };
      }

      const { checkoutId } = await wixClient.currentCart.createCheckoutFromCurrentCart(checkoutOptions)

      console.log("✅ Checkout created:", checkoutId)

      // 🌐 Get checkout URL and redirect
      // Try to update checkout with buyer info if it wasn't included in creation
      if (buyerInfo && checkoutId) {
        try {
          await wixClient.checkout.updateCheckout(checkoutId, {
            buyerInfo: {
              ...(buyerInfo.email && { email: buyerInfo.email }),
              ...(buyerInfo.phone && { phone: buyerInfo.phone }),
              ...(buyerInfo.firstName && { firstName: buyerInfo.firstName }),
              ...(buyerInfo.lastName && { lastName: buyerInfo.lastName }),
            },
          });
          console.log("✅ Checkout updated with buyer info");
        } catch (updateError) {
          console.warn("⚠️ Failed to update checkout with buyer info:", updateError);
        }
      }

      // Redirect to headless checkout page
      console.log("🔁 Redirecting to headless checkout")
      if (typeof window !== "undefined") {
        window.location.href = "/checkout"
      }
    } catch (err) {
      console.error("Checkout error:", err)
    }
  }

  // Reload cart function
  const reload = async () => {
    try {
      const activeAuth = await ensureAuth()
      await load(activeAuth)
    } catch (e) {
      console.error("Failed to reload cart:", e)
    }
  }

  const getCartCount = () => {
    return cart?.lineItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0
  }

  return (
    <CartContext.Provider value={{ cart, loading, add, updateQuantity, remove, checkout, reload, getCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
