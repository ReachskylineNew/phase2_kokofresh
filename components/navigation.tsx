"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/context/wishlist-context"
import NavUser from "./NavUser"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { cart } = useCart()
  const { wishlist } = useWishlist()

  const totalQuantity = cart?.lineItems?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
  const wishlistCount = wishlist?.length || 0

  // Prevent background scroll when mobile menu open
  useEffect(() => {
    if (isMenuOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = "hidden"
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsMenuOpen(false)
      }
      window.addEventListener("keydown", onKeyDown)
      return () => {
        document.body.style.overflow = original
        window.removeEventListener("keydown", onKeyDown)
      }
    }
  }, [isMenuOpen])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#FED649]/30 shadow-sm"
      role="navigation"
      aria-label="Main"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-24 gap-2 md:gap-6">
          {/* Logo and Branding */}
           <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED649]/60 rounded-md"
            aria-label="KOKO FRESH home"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 flex-shrink-0">
              <Image
                src="https://static.wixstatic.com/media/e7c120_139bc773242b4cb29524927dde26ad3d~mv2.webp"
                alt="KOKOFRESH Logo"
                width={200}
                height={200}
                className="object-contain"
                priority
                quality={100}
              />
            </div>

            <div className="flex flex-col leading-tight text-left">
              <span className="font-serif text-xl sm:text-2xl md:text-4xl font-bold whitespace-nowrap bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
                KOKO FRESH
              </span>
              <span className="font-dancing text-[10px] sm:text-xs md:text-sm italic text-[#FED649]/90 mt-0.5 tracking-wide">
                Flavourz of India
              </span>
            </div>
          </Link>


          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center gap-1.5 lg:gap-3 flex-1">
            {["Home", "Shop", "About", "Contact"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="text-white/90 text-lg lg:text-xl font-medium px-3 py-2 rounded-md
                  transition-colors duration-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED649]/60
                  hover:bg-clip-text hover:text-transparent
                  hover:bg-gradient-to-r hover:from-[#DD9627] hover:via-[#FED649] hover:to-[#B47B2B]"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Right Icons - Improved mobile spacing and touch targets */}
          <div className="flex items-center gap-1 md:gap-3 ml-auto">
            <Link href="/wishlist" aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:text-[#DD9627] h-10 w-10 md:h-12 md:w-12 focus-visible:ring-2 focus-visible:ring-[#FED649]/60"
              >
                <Heart className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-[#DD9627] text-[10px] rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center text-white shadow font-semibold"
                    aria-label={`${wishlistCount} items in wishlist`}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cart" aria-label={`Cart${totalQuantity ? `, ${totalQuantity} items` : ""}`}>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:text-[#FED649] h-10 w-10 md:h-12 md:w-12 focus-visible:ring-2 focus-visible:ring-[#FED649]/60"
              >
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                {totalQuantity > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-[#FED649] text-[10px] rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center text-[#B47B2B] font-semibold shadow"
                    aria-label={`${totalQuantity} items in cart`}
                  >
                    {totalQuantity}
                  </span>
                )}
              </Button>
            </Link>

            <div className="hidden md:block">
              <NavUser fontSize="text-base" />
            </div>

            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden text-white h-10 w-10 inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED649]/60"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Improved mobile menu styling and organization */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 top-16 z-50 md:hidden border-t border-[#FED649]/30 bg-black/95 backdrop-blur
              motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
          >
            <div className="max-w-7xl mx-auto px-3 py-4">
              <div className="flex flex-col gap-1">
                {/* Navigation Links */}
                {["Shop", "About", "Contact"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/95 text-base font-medium px-3 py-3 rounded-md hover:text-white hover:bg-white/5
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED649]/60 transition-colors"
                  >
                    {item}
                  </Link>
                ))}

                {/* Wishlist Link */}
                <Link
                  href="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white/95 text-base font-medium flex items-center justify-between px-3 py-3 rounded-md hover:text-white hover:bg-white/5
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED649]/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5" aria-hidden="true" />
                    <span>Wishlist</span>
                  </div>
                  {wishlistCount > 0 && <span className="text-[#DD9627] font-semibold text-sm">({wishlistCount})</span>}
                </Link>

                {/* Divider */}
                <div className="h-px bg-[#FED649]/20 my-2" />

                {/* User Account */}
                <div className="px-3 py-3">
                  <NavUser fontSize="text-base" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

export default Navigation
