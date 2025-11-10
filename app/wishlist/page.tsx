"use client"

import { useMemo } from "react"
import { Navigation } from "../../components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trash2, Heart, ShoppingCart, ArrowLeft } from "lucide-react"
import { useWishlist } from "../../context/wishlist-context"
import { useCart } from "../../hooks/use-cart"
import Link from "next/link"
import { useUser } from "../../context/user-context"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, moveToCart, loading } = useWishlist()
  const { add: addToCart } = useCart()
  const { contact } = useUser()

  const totalValue = useMemo(() => {
    return wishlist.reduce((sum: number, item: any) => {
      const price = Number.parseFloat(item.price?.amount || "0")
      const qty = item.quantity || 1
      return sum + price * qty
    }, 0)
  }, [wishlist])

  // 🌀 Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DD9627] mx-auto mb-4"></div>
          <p className="text-[#6B4A0F]">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  // 🔒 Not Logged In State
 if (!contact) {
  return (
    <div className="min-h-screen bg-white text-[#3B2B13] mt-16 md:mt-24">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 bg-[#FFF8E1] rounded-full flex items-center justify-center border-2 border-[#DD9627]/20">
          <Heart className="w-8 h-8 md:w-12 md:h-12 text-[#DD9627]" />
        </div>
        <h2 className="font-serif text-xl font-semibold mb-2 text-[#3B2B13]">
          Please log in to view your wishlist
        </h2>
        <p className="text-[#6B4A0F] mb-6 font-medium">
          Sign in to save items for later
        </p>
        <Link href="/profile">
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-bold px-8 py-4 hover:brightness-90 transition-all duration-300"
          >
            Sign In
          </Button>
        </Link>
      </div>

      <Footer />
    </div>
  )
}


  // 🧡 Logged In State
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
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
          </div>
        </div>
      </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-12">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#3B2B13] mb-8">
            My{" "}
            <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
              Wishlist
            </span>
          </h1>

          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 mx-auto mb-5 bg-[#FFF8E1] rounded-full flex items-center justify-center border-2 border-[#DD9627]/20">
                  <Heart className="w-10 h-10 text-[#DD9627]" />
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#3B2B13] mb-2">Your wishlist is empty</h2>
                <p className="text-[#6B4A0F] mb-6 font-medium">Save items from your cart or shop to add them here.</p>
                <Link href="/shop">
                  <Button className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-bold px-8 py-4 hover:brightness-90 transition-all duration-300">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Wishlist Items */}
              <div className="lg:col-span-3 space-y-4">
                {wishlist.map((item: any) => (
                  <div
                    key={item._id}
                    className="p-4 sm:p-6 bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/40 text-[#3B2B13] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#FFF8E1] border-2 border-[#DD9627]/30 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image?.url ? (
                        <img
                          src={item.image.url || "/placeholder.svg"}
                          alt={item.productName?.original || "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FFF8E1] flex items-center justify-center" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                       <h3 className="font-semibold text-sm md:text-lg mb-1">
                                {item.productName || "Product"}
                              </h3>   
                      <p className="text-xs sm:text-sm text-green-700 font-medium">
                        In Stock <span className="text-[#6B4A0F] hidden sm:inline">• FREE Shipping</span>
                      </p>

                      {/* Buttons */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <button
                          onClick={() => removeFromWishlist(item._id)}
                          className="flex items-center gap-1 text-sm text-[#6B4A0F] hover:text-[#B47B2B] transition-colors font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>

                        <button
                          onClick={() => moveToCart(item)}
                          className="flex items-center gap-1 text-sm text-[#6B4A0F] hover:text-[#B47B2B] transition-colors font-medium"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Move to Cart
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
              </div>

            <div className="lg:col-span-1 lg:sticky lg:top-6 h-fit">
              <div className="bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/40 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#3B2B13] mb-4">Wishlist Summary</h3>
                <div className="flex justify-between text-sm mb-3 text-[#6B4A0F]">
                  <span className="font-medium">Items saved</span>
                  <span className="font-semibold text-[#3B2B13]">{wishlist.length}</span>
                </div>
                <div className="flex justify-between text-sm mb-4 text-[#6B4A0F]">
                  <span className="font-medium">Total value</span>
                  <span className="font-semibold text-[#3B2B13]">₹{totalValue.toFixed(2)}</span>
                </div>
                <Separator className="my-4 bg-[#DD9627]/20" />
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-bold text-base py-3 hover:brightness-90 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() => {
                    wishlist.forEach((item) => moveToCart(item))
                  }}
                  disabled={wishlist.length === 0}
                >
                  Move All to Cart
                </Button>

                <div className="mt-6 space-y-3 text-xs text-[#6B4A0F]">
                  <div className="flex items-center gap-2 font-medium">
                    <Heart className="h-4 w-4 text-[#DD9627] flex-shrink-0" />
                    <span>Saved items persist across devices</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <ShoppingCart className="h-4 w-4 text-[#B47B2B] flex-shrink-0" />
                    <span>Move to cart when ready to buy</span>
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