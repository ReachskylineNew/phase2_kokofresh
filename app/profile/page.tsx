"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Bell,
  Settings,
  User,
  Edit3,
  Package,
  ChevronDown,
  ChevronRight,
  Download,
} from "lucide-react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useUser } from "@/context/user-context"
// ⬅️ add setContact in your user-context
 // ✅ get context

export default function ProfilePage() {

  const router = useRouter()
  const { profile, contact, loading, setContact, refreshUser } = useUser()
  
  // Debug: Log profile data
  useEffect(() => {
    console.log("Profile Page - Profile:", profile);
    console.log("Profile Page - Contact:", contact);
    console.log("Profile Page - Loading:", loading);
    
    // If we have a session token but no profile, try to refresh
    if (!loading && !profile && typeof window !== "undefined") {
      const hasSession = localStorage.getItem("wixSession");
      if (hasSession) {
        console.log("⚠️ Has session token but no profile, refreshing...");
        refreshUser();
      }
    }
  }, [profile, contact, loading, refreshUser])

  // ----- Orders -----
  const [orders, setOrders] = useState<any[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [downloadingInvoices, setDownloadingInvoices] = useState<Set<string>>(new Set())
  

  const extractTracking = (order: any): { id: string; url: string } | null => {
    // Try common Wix eCom order structures for tracking data
    const possibleIds: (string | undefined)[] = [
      order?.tracking?.[0]?.trackingNumber,
      order?.fulfillments?.[0]?.trackingInfo?.trackingNumber,
      order?.fulfillments?.[0]?.trackingInfo?.number,
      order?.shippingInfo?.deliveries?.[0]?.trackingInfo?.trackingNumber,
      order?.shippingInfo?.deliveries?.[0]?.trackingInfo?.number,
      order?.shippingInfo?.trackingNumber,
      order?.trackingNumber,
    ]
    const trackingId = possibleIds.find(Boolean) as string | undefined
    if (!trackingId) return null

    const url = `https://shiprocket.co/tracking/${encodeURIComponent(trackingId)}`
    return { id: trackingId, url }
  }


  useEffect(() => {
    const fetchOrders = async () => {
      if (!contact?._id) return
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactId: contact._id }),
          cache: "no-store",
        })

        const data = await res.json()

        // ✅ Fallback safeguard filter on client side
        const filteredOrders = (data.orders || []).filter((o: any) => o.buyerInfo?.contactId === contact._id)

        setOrders(filteredOrders)
        console.log("🛒 Orders (after local filter):", filteredOrders)
        try {
          filteredOrders.forEach((o: any) => {
            const nums = (o?.tracking || []).map((t: any) => t?.trackingNumber).filter(Boolean)
            if (nums.length) {
              console.log("🔎 tracking for order", o._id, nums)
            } else {
              console.log("🔎 no tracking for order", o._id)
            }
          })
        } catch {}
      } catch (err) {
        console.error("Failed to fetch orders:", err)
      }
    }
    fetchOrders()
  }, [contact])

  // No separate tracking fetch needed; orders API now returns order.tracking

  const toggleExpand = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id)
  }

  // ----- Invoice Download -----
  const handleDownloadInvoice = async (orderId: string) => {
    try {
      setDownloadingInvoices(prev => new Set(prev).add(orderId))
      
      // Generate PDF invoice directly
      const res = await fetch("/api/invoice-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to generate invoice")
      }

      // Get the PDF blob and filename from response headers
      const pdfBlob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition')
      let filename = `Invoice_${orderId}.pdf`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success("Invoice downloaded successfully! 📄")
      
    } catch (error: any) {
      console.error("Failed to download invoice:", error)
      toast.error(error.message || "Unable to generate invoice. Please contact support.")
    } finally {
      setDownloadingInvoices(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  // ----- Edit Contact (NEW) -----
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    subdivision: "",
    postalCode: "",
    country: "",
    countryFullname: "",
  })

  // hydrate form from current contact whenever modal opens or contact changes
  useEffect(() => {
    if (!contact) return
    const addr = contact?.info?.addresses?.items?.[0]?.address || {}
    setForm({
      email: contact?.primaryInfo?.email || "",
      phone: contact?.primaryInfo?.phone || "",
      addressLine1: addr?.addressLine1 || "",
      city: addr?.city || "",
      subdivision: addr?.subdivision || "",
      postalCode: addr?.postalCode || "",
      country: addr?.country || "",
      countryFullname: addr?.countryFullname || "",
    })
  }, [contact, editOpen])

const handleSave = async () => {
  if (!contact?._id) return

  try {
    setSaving(true)

    // --- Validation ---
    if (form.country.length !== 2) {
      toast.error("❌ Country code must be 2 letters (e.g., IN, US, UK)")
      setSaving(false)
      return
    }

    const digits = form.phone.replace(/\D/g, "")
    if (digits.length < 10) {
      toast.error("❌ Phone number must be at least 10 digits")
      setSaving(false)
      return
    }

    const res = await fetch("/api/update-contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId: contact._id,
        info: {
          emails: {
            items: [
              {
                email: form.email,
                primary: true,
                tag: "UNTAGGED",
              },
            ],
          },
          phones: {
            items: [
              {
                countryCode: form.country.toUpperCase(),
                phone: digits,
                primary: true,
                tag: "MOBILE",
              },
            ],
          },
          addresses: {
            items: [
              {
                tag: "SHIPPING",
                address: {
                  addressLine1: form.addressLine1,
                  city: form.city,
                  subdivision: form.subdivision,
                  postalCode: form.postalCode,
                  country: form.country.toUpperCase(),
                  countryFullname: form.countryFullname,
                },
              },
            ],
          },
        },
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      // handle duplication or backend errors
      if (res.status === 409) {
        toast.error("⚠️ Phone number already exists for another contact")
      } else {
        toast.error(`❌ ${data.error || "Failed to update"}`)
      }
      throw new Error(data.error || "Failed to update")
    }

    console.log("✅ Contact updated:", data.contact)

    // Update context immediately
    setContact(data.contact)

    setEditOpen(false)
    toast.success("✅ Contact updated successfully!")
  } catch (err: any) {
    console.error("❌ Save failed:", err)
    toast.error(err.message || "Something went wrong")
  } finally {
    setSaving(false)
  }
}





  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 px-4">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
<div className="min-h-screen flex flex-col bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B] text-[#4B3A1F] mt-16 md:mt-24">

      <Navigation />

      <main className="flex-1 pb-6 after-nav">
        <div className="px-4 pt-4 pb-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl mx-auto">

<Card className="border border-[#FED649]/30 bg-black rounded-2xl shadow-[0_0_20px_rgba(254,214,73,0.15)]">
  <CardContent className="p-6 lg:p-8 xl:p-10">
    <div className="flex flex-col sm:flex-row lg:flex-row items-center sm:items-start lg:items-center gap-4 lg:gap-8">
      <div className="relative flex-shrink-0">
        {profile?.profile?.photo?.url ? (
          <div>just profile

          </div>

          // <img
          //   src={profile.profile.photo.url}
          //   alt={profile?.profile?.nickname || "Profile"}
          //   loading="lazy"
          //   decoding="async"
          //   className="w-20 h-20 sm:w-16 sm:h-16 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-2xl border-4 border-[#FED649]/60 shadow-lg object-cover"
          //   onError={(e) => {
          //     (e.target as HTMLImageElement).src = "/fallback-avatar.png"
          //   }}
          // />
        ) : (
          <div className="w-20 h-20 sm:w-16 sm:h-16 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-[#111] rounded-2xl flex items-center justify-center border-4 border-[#FED649]/40 shadow-lg">
            <User className="h-8 w-8 sm:h-6 sm:w-6 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-[#FED649]" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full border-3 border-black"></div>
      </div>

      <div className="flex-1 text-center sm:text-left lg:text-left space-y-2 lg:space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-3xl font-bold text-[#FED649] tracking-tight">
          {profile?.profile?.nickname || "Your Account"}
        </h1>
        <p className="text-gray-300 text-base sm:text-lg lg:text-lg xl:text-lg font-medium">
          Welcome back! Manage your account and orders
        </p>
        <Badge className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-bold border-0 px-3 py-1 lg:px-4 lg:py-2 text-sm lg:text-sm shadow-md">
          ✓ Verified Customer
        </Badge>
      </div>
    </div>
  </CardContent>
</Card>


        
          </div>
        </div>

        <div className="px-4 space-y-6 lg:px-8 xl:px-12 2xl:px-16 lg:space-y-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
           <Card className="shadow-lg border border-[#FED649]/30 bg-[#0B0B0B] xl:col-span-2 rounded-2xl">
  <CardHeader className="border-b border-[#FED649]/20 px-4 py-4 lg:px-6 lg:py-6 flex items-center justify-between">
    <CardTitle className="text-lg lg:text-xl font-bold text-[#FED649] flex items-center gap-2 lg:gap-3">
      <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#DD9627] via-[#FED649] to-[#B47B2B] rounded-full"></div>
      Contact Information
    </CardTitle>

    <Button
      size="sm"
      onClick={() => setEditOpen(true)}
      className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold hover:brightness-90 transition-all rounded-lg px-4 py-2 h-9 lg:h-10"
    >
      <Edit3 className="h-4 w-4 mr-1" />
      Edit
    </Button>
  </CardHeader>

  <CardContent className="p-4 lg:p-6 space-y-6">
    {/* Email */}
    <div className="flex items-start gap-4 p-4 bg-[#111] rounded-xl border border-[#FED649]/10">
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#FED649]/10 border border-[#FED649]/20 flex-shrink-0">
        <Mail className="h-5 w-5 text-[#FED649]" />
      </div>
      <div className="flex-1">
        <p className="text-sm uppercase tracking-wide text-gray-400 mb-1">
          Primary Email
        </p>
        <p className="font-semibold text-white break-all">
          {contact?.primaryInfo?.email || "—"}
        </p>
      </div>
    </div>

    {/* Phone */}
    <div className="flex items-start gap-4 p-4 bg-[#111] rounded-xl border border-[#FED649]/10">
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#FED649]/10 border border-[#FED649]/20 flex-shrink-0">
        <Phone className="h-5 w-5 text-[#FED649]" />
      </div>
      <div className="flex-1">
        <p className="text-sm uppercase tracking-wide text-gray-400 mb-1">
          Primary Phone
        </p>
        <p className="font-semibold text-white">
          {contact?.primaryInfo?.phone || "—"}
        </p>
      </div>
    </div>

    {/* Address */}
    <div className="flex items-start gap-4 p-4 bg-[#111] rounded-xl border border-[#FED649]/10">
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#FED649]/10 border border-[#FED649]/20 flex-shrink-0">
        <MapPin className="h-5 w-5 text-[#FED649]" />
      </div>
      <div className="flex-1">
        <p className="text-sm uppercase tracking-wide text-gray-400 mb-2">
          Default Shipping Address
        </p>

        {contact?.info?.addresses?.items?.length ? (
          <div className="bg-[#0B0B0B] rounded-lg p-3 border border-[#FED649]/10 space-y-1">
            <p className="font-semibold text-white">
              {contact.info.addresses.items[0].address?.addressLine1}
            </p>
            <p className="text-gray-300 text-sm">
              {contact.info.addresses.items[0].address?.city},{" "}
              {contact.info.addresses.items[0].address?.subdivision},{" "}
              {contact.info.addresses.items[0].address?.postalCode}
            </p>
            <p className="text-gray-400 text-sm">
              {contact.info.addresses.items[0].address?.countryFullname ||
                contact.info.addresses.items[0].address?.country}
            </p>
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#FED649]/20 rounded-lg p-3">
            <p className="text-[#FED649] font-medium text-sm">
              No address on file
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Add a shipping address to complete your profile
            </p>
          </div>
        )}
      </div>
    </div>
  </CardContent>
</Card>


            {/* <Card className="shadow-lg border border-[#FED649]/30 bg-[#0B0B0B] rounded-2xl">
  <CardHeader className="border-b border-[#FED649]/20 px-4 py-4 lg:px-6 lg:py-6">
    <CardTitle className="text-lg lg:text-xl font-bold text-[#FED649] flex items-center gap-2 lg:gap-3">
      <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#DD9627] via-[#FED649] to-[#B47B2B] rounded-full"></div>
      Quick Actions
    </CardTitle>
  </CardHeader>

  <CardContent className="p-4 lg:p-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3 lg:gap-4">
      
      <Button
        variant="outline"
        className="justify-start text-left bg-[#111] hover:bg-[#1a1a1a] border border-[#FED649]/20 hover:border-[#FED649]/40 font-semibold py-4 lg:py-5 px-4 lg:px-5 rounded-xl h-auto group transition-all"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#DD9627]/20 group-hover:bg-[#DD9627]/40 border border-[#FED649]/20 mr-3 transition-all">
          <Settings className="h-5 w-5 text-[#FED649] group-hover:text-[#B47B2B]" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-white lg:text-base">
            Account Settings
          </div>
          <div className="text-xs text-[#FED649]">Manage preferences</div>
        </div>
      </Button>


      <Button
        variant="outline"
        className="justify-start text-left bg-[#111] hover:bg-[#1a1a1a] border border-[#FED649]/20 hover:border-[#FED649]/40 font-semibold py-4 lg:py-5 px-4 lg:px-5 rounded-xl h-auto group transition-all"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#DD9627]/20 group-hover:bg-[#DD9627]/40 border border-[#FED649]/20 mr-3 transition-all">
          <ShoppingBag className="h-5 w-5 text-[#FED649] group-hover:text-[#B47B2B]" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-white lg:text-base">
            Track Orders
          </div>
          <div className="text-xs text-[#FED649]">View order status</div>
        </div>
      </Button>


      <Button
        variant="outline"
        className="justify-start text-left bg-[#111] hover:bg-[#1a1a1a] border border-[#FED649]/20 hover:border-[#FED649]/40 font-semibold py-4 lg:py-5 px-4 lg:px-5 rounded-xl h-auto group transition-all"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#DD9627]/20 group-hover:bg-[#DD9627]/40 border border-[#FED649]/20 mr-3 transition-all">
          <Bell className="h-5 w-5 text-[#FED649] group-hover:text-[#B47B2B]" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-white lg:text-base">
            Notifications
          </div>
          <div className="text-xs text-[#FED649]">Manage alerts</div>
        </div>
      </Button>
    </div>
  </CardContent>
</Card> */}

            </div>

            <Card className="shadow-lg border border-[#FED649]/30 bg-[#0B0B0B] rounded-2xl mt-6 lg:mt-8">
  <CardHeader className="border-b border-[#FED649]/20 px-4 py-4 lg:px-6 lg:py-6">
    <CardTitle className="text-lg lg:text-xl xl:text-xl font-bold text-[#FED649] flex items-center gap-2 lg:gap-3">
      <div className="w-1.5 h-6 lg:h-8 bg-gradient-to-b from-[#DD9627] via-[#FED649] to-[#B47B2B] rounded-full"></div>
      Order History
    </CardTitle>
  </CardHeader>

  <CardContent className="p-0">
    {orders.length === 0 ? (
      <div className="text-center py-12 lg:py-16 px-4 text-gray-300">
        <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-[#FED649]/20">
          <ShoppingBag className="h-8 w-8 text-[#FED649]" />
        </div>
        <p className="font-medium text-lg">No orders found</p>
        <p className="text-sm text-gray-400 mt-1">Your order history will appear here</p>
      </div>
    ) : (
      <div className="divide-y divide-[#FED649]/10">
        {orders.map((order, index) => {
          const primary = order?.tracking?.[0];
          const tracking = primary?.trackingNumber
            ? {
                id: primary.trackingNumber,
                url:
                  primary.trackingLink ||
                  `https://shiprocket.co/tracking/${encodeURIComponent(primary.trackingNumber)}`,
              }
            : extractTracking(order);
          const isExpanded = expandedOrder === order._id;

          return (
            <div key={order._id} className="bg-black overflow-hidden rounded-xl border border-[#FED649]/10">
              {/* --- Order Header --- */}
              <div
                className="p-4 lg:p-6 cursor-pointer hover:bg-[#111] transition-all duration-200 active:bg-[#1a1a1a]"
                onClick={() => toggleExpand(order._id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 lg:mb-4">
                  {/* Left Side */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                      <span className="font-bold text-white text-base lg:text-lg">
                        #{order.number}
                      </span>

                      {tracking ? (
                        <a
                          href={tracking.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold border-0 text-xs px-2 py-1 rounded-md">
                            Track Package
                          </Badge>
                        </a>
                      ) : (
                        <Badge className="bg-[#FED649]/10 text-[#FED649] border border-[#FED649]/30 text-xs px-2 py-1 rounded-md">
                          Track Order
                        </Badge>
                      )}
                    </div>

                    {tracking && (
                      <p className="text-xs text-gray-400">
                        Tracking: {tracking.id}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order._createdDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <p className="font-bold text-[#FED649] text-base sm:text-lg">
                      {order.priceSummary?.total?.formattedAmount || "—"}
                    </p>
                    <div className="w-6 h-6 flex items-center justify-center text-[#FED649]">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Expanded Details --- */}
              {isExpanded && (
                <div className="bg-[#0B0B0B] px-4 lg:px-6 py-6 border-t border-[#FED649]/10 space-y-6">
                  {/* Tracking Info */}
                  {tracking && (
                    <div className="bg-black border border-[#FED649]/20 rounded-xl p-4 shadow-inner">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div>
                          <p className="text-xs text-gray-400">Tracking ID</p>
                          <p className="font-semibold text-white text-sm break-all">
                            {tracking.id}
                          </p>
                        </div>
                        <a href={tracking.url} target="_blank" rel="noreferrer">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold hover:brightness-90 transition-all"
                          >
                            Open Tracking
                          </Button>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Product Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {order.lineItems?.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="bg-[#111] border border-[#FED649]/15 rounded-xl p-4 hover:border-[#FED649]/30 transition-all"
                      >
                        <div className="flex gap-4">
                          {item.image ? (
                            <img
                              src={
                                item.image.replace(
                                  "wix:image://v1/",
                                  "https://static.wixstatic.com/media/"
                                ) || "/placeholder.svg"
                              }
                              alt={item.productName?.original}
                              className="w-16 h-16 object-cover rounded-lg border border-[#FED649]/20 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-[#222] flex items-center justify-center rounded-lg border border-[#FED649]/20">
                              <Package className="h-6 w-6 text-[#FED649]" />
                            </div>
                          )}

                          <div className="flex-1">
                            <p className="font-bold text-white text-sm mb-1 line-clamp-2">
                              {item.productName?.original}
                            </p>
                            <p className="text-xs text-gray-400 mb-2">
                              SKU: {item.physicalProperties?.sku || "—"}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-[#FED649]">
                                  {item.price?.formattedAmount || "—"}
                                </p>
                                <p className="text-[11px] text-gray-400 bg-[#222] px-2 py-0.5 rounded-full w-fit">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-bold text-white text-sm sm:text-lg">
                                {item.totalPriceAfterTax?.formattedAmount || "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-[#111] border border-[#FED649]/15 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-[#FED649] text-base sm:text-lg">
                        Order Summary
                      </h4>
                     <Button
  size="sm"
  onClick={(e) => {
    e.stopPropagation();
    handleDownloadInvoice(order._id);
  }}
  disabled={downloadingInvoices.has(order._id)}
  className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] 
             text-black font-semibold hover:brightness-90 transition-all
             px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
>
  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="hidden xs:inline">
    {downloadingInvoices.has(order._id)
      ? "Downloading..."
      : "Download Invoice"}
  </span>
</Button>

                    </div>

                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-white">
                          {order.priceSummary?.subtotal?.formattedAmount || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-white">
                          {order.priceSummary?.shipping?.formattedAmount || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="text-white">
                          {order.priceSummary?.tax?.formattedAmount || "—"}
                        </span>
                      </div>
                      <div className="border-t border-[#FED649]/20 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-white">Total</span>
                          <span className="font-bold text-[#FED649]">
                            {order.priceSummary?.total?.formattedAmount || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-green-400">
                            Amount Paid
                          </span>
                          <span className="font-bold text-green-400">
                            {order.balanceSummary?.paid?.formattedAmount || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </CardContent>
</Card>

          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg lg:max-w-xl xl:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 lg:pb-6">
            <DialogTitle className="text-xl lg:text-xl xl:text-2xl font-bold">Edit Contact Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="email" className="text-sm lg:text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="h-12 lg:h-12 text-base lg:text-base"
                />
              </div>

              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="phone" className="text-sm lg:text-sm font-semibold">
                  Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 7892776610"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-12 lg:h-12 text-base lg:text-base"
                />
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="addressLine1" className="text-sm lg:text-sm font-semibold">
                  Address Line 1
                </Label>
                <Input
                  id="addressLine1"
                  placeholder="Street, house / flat"
                  value={form.addressLine1}
                  onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
                  className="h-12 lg:h-12 text-base lg:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="city" className="text-sm lg:text-sm font-semibold">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="h-12 lg:h-12 text-base lg:text-base"
                  />
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="subdivision" className="text-sm lg:text-sm font-semibold">
                    State/Province
                  </Label>
                  <Input
                    id="subdivision"
                    value={form.subdivision}
                    onChange={(e) => setForm((f) => ({ ...f, subdivision: e.target.value }))}
                    className="h-12 lg:h-12 text-base lg:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="postalCode" className="text-sm lg:text-sm font-semibold">
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                    className="h-12 lg:h-12 text-base lg:text-base"
                  />
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="country" className="text-sm lg:text-sm font-semibold">
                    Country Code
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g., IN"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
                    className="h-12 lg:h-12 text-base lg:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="countryFullname" className="text-sm lg:text-sm font-semibold">
                  Country
                </Label>
                <Input
                  id="countryFullname"
                  placeholder="e.g., India"
                  value={form.countryFullname}
                  onChange={(e) => setForm((f) => ({ ...f, countryFullname: e.target.value }))}
                  className="h-12 lg:h-12 text-base lg:text-base"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 lg:pt-8 gap-3 sm:gap-2 lg:gap-4">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
              className="flex-1 sm:flex-none h-12 lg:h-12 sm:h-10 lg:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none h-12 lg:h-12 sm:h-10 lg:text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}