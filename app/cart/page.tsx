"use client"

import { useMemo, useState, useEffect } from "react"
import { Navigation } from "../../components/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Minus,
  Trash2,
  Heart,
  Shield,
  Truck,
  ArrowLeft,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useCart } from "../../hooks/use-cart"
import { useWishlist } from "../../context/wishlist-context"
import { useUser } from "../../context/user-context"
import Link from "next/link"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 5

export default function CartPage() {
  const { cart, updateQuantity, remove, checkout, loading } = useCart()
  const { addToWishlist } = useWishlist()
  const { contact } = useUser()
  const [currentPage, setCurrentPage] = useState(1)

  const handleSaveForLater = async (item: any) => {
    if (!contact) {
      toast.error("Please sign in to save items for later")
      return
    }

    try {
      const success = await addToWishlist(item)
      if (success) {
        await remove(item.id)
        toast.success("Item saved for later!")
      } else {
        toast.error("Failed to save item for later.")
      }
    } catch (error) {
      console.error("❌ Error saving for later:", error)
      toast.error("Error saving item. Please try again.")
    }
  }

  const items = cart?.lineItems || []

  const subtotal = useMemo(() => {
    return items.reduce((sum: number, item: any) => {
      const price = Number.parseFloat(item.price?.amount || "0")
      const qty = item.quantity || 0
      return sum + price * qty
    }, 0)
  }, [items])

  const total = subtotal

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedItems = items.slice(startIndex, endIndex)

  // Reset to first page when cart items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DD9627] mx-auto mb-4"></div>
          <p className="text-[#6B4A0F]">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#3B2B13] mt-16 md:mt-24">
      <Navigation />

      <div className="bg-[#FFF8E1] border-b border-[#DD9627]/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-[#6B4A0F]">
            <ArrowLeft className="h-4 w-4" />
            <Link href="/shop" className="hover:text-[#DD9627] transition-colors font-medium">
              Continue Shopping
            </Link>
          </div>
          <div className="text-sm text-[#6B4A0F] hidden sm:block font-medium">
            {items.length} {items.length === 1 ? "item" : "items"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#3B2B13] mb-8">
          Shopping{" "}
          <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
            Cart
          </span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 mx-auto mb-5 bg-[#FFF8E1] rounded-full flex items-center justify-center border-2 border-[#DD9627]/20">
                <ShoppingCart className="w-10 h-10 text-[#DD9627]" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#3B2B13] mb-2">Your cart is empty</h2>
              <p className="text-[#6B4A0F] mb-6 font-medium">Add items to get started with your flavor journey!</p>
              <Link href="/shop">
                <Button className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-bold px-8 py-4 hover:brightness-90 transition-all duration-300">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Cart items */}
            <div className="lg:col-span-3 space-y-4">
              {paginatedItems.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/40 text-[#3B2B13] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#FFF8E1] border-2 border-[#DD9627]/30 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image?.url && typeof item.image.url === 'string' ? (
                        <img
                          src={item.image.url}
                          alt={item.productName?.original || "Product"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FFF8E1] flex items-center justify-center" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-base sm:text-lg text-[#3B2B13] line-clamp-2 mb-1">
                        {item.productName?.original || item.name}
                      </h3>
                      {item.descriptionLines?.length > 0 && (
                        <p className="text-xs sm:text-sm text-[#6B4A0F] mb-2 line-clamp-2">
                          {item.descriptionLines.map((d: any) => d.plainText?.original).join(", ")}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-green-700 font-medium">
                        In Stock <span className="text-[#6B4A0F] hidden sm:inline">• FREE Shipping</span>
                      </p>

                      {/* Quantity and actions */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="flex items-center border-2 border-[#DD9627]/30 rounded-lg bg-white hover:border-[#DD9627]/50 transition-colors">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                            className="p-2 hover:bg-[#FFF8E1] transition-colors text-[#3B2B13]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <select
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                            className="px-2 py-1 border-x border-[#DD9627]/20 bg-transparent text-sm focus:outline-none text-[#3B2B13] font-medium"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="p-2 hover:bg-[#FFF8E1] transition-colors text-[#3B2B13]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => remove(item.id)}
                          className="flex items-center gap-1 text-sm text-[#6B4A0F] hover:text-[#B47B2B] transition-colors font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>

                        <button
                          onClick={() => handleSaveForLater(item)}
                          className="flex items-center gap-1 text-sm text-[#6B4A0F] hover:text-[#B47B2B] transition-colors font-medium"
                        >
                          <Heart className="h-4 w-4" />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:text-left sm:w-28">
                    <p className="text-base sm:text-lg font-bold text-[#B47B2B]">
                      {item.price?.formattedAmount || `₹${Number.parseFloat(item.price?.amount || "0").toFixed(2)}`}
                    </p>
                    <p className="text-xs sm:text-sm text-[#6B4A0F]">
                      ₹{(Number.parseFloat(item.price?.amount || "0") * item.quantity).toFixed(2)} total
                    </p>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#DD9627]/20">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#DD9627]/30 text-[#6B4A0F] hover:bg-[#FFF8E1] hover:border-[#DD9627]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg font-bold transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black shadow-md"
                            : "border-2 border-[#DD9627]/30 text-[#6B4A0F] hover:bg-[#FFF8E1] hover:border-[#DD9627]/50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#DD9627]/30 text-[#6B4A0F] hover:bg-[#FFF8E1] hover:border-[#DD9627]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 lg:sticky lg:top-6 h-fit">
              <div className="bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/40 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#3B2B13] mb-4">Order Summary</h3>
                <div className="flex justify-between text-sm mb-3 text-[#6B4A0F]">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold text-[#3B2B13]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4 text-[#6B4A0F]">
                  <span className="font-medium">Shipping</span>
                  <span className="font-semibold text-green-700">Free</span>
                </div>
                <Separator className="my-4 bg-[#DD9627]/20" />
                <div className="flex justify-between  font-bold text-lg mb-6 text-[#3B2B13]">
                  <span>Total</span>
                  <span className="text-[#6B4A0F]">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-bold text-base py-3 hover:brightness-90 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={checkout}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>

                <div className="mt-6 space-y-3 text-xs text-[#6B4A0F]">
                  <div className="flex items-center gap-2 font-medium">
                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Secure transaction</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Truck className="h-4 w-4 text-[#DD9627] flex-shrink-0" />
                    <span>FREE delivery on orders over ₹999</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
