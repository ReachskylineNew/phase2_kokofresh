"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Head from "next/head"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  Shield,
  Clock,
  ChefHat,
  Info,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useCart } from "../../hooks/use-cart"
import { getVariant } from "../../lib/getvarient"

type WixProduct = any

export default function ProductPage() {
  const { add } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [product, setProduct] = useState<WixProduct | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [error, setError] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  useEffect(() => {
    if (!product?.media?.items?.length) return

    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % (product.media.items.length || 1))
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [product])

  const handleImageSelect = (index: number) => {
    setSelectedImage(index)
  }

  const handlePrevImage = () => {
    const totalImages = product?.media?.items?.length || 1
    setSelectedImage((prev) => (prev - 1 + totalImages) % totalImages)
  }

  const handleNextImage = () => {
    const totalImages = product?.media?.items?.length || 1
    setSelectedImage((prev) => (prev + 1) % totalImages)
  }

  const inferCategory = (p: any): "Masala" | "Chutney" => {
    const name = (p?.name || "").toLowerCase()
    const type = (p?.productType || "").toLowerCase()
    if (type.includes("chutney") || name.includes("chutney")) return "Chutney"
    return "Masala"
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/products?id=${productId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load product")
        const data = await res.json()
        setProduct(data.product)

        if (data.product?.productOptions?.length) {
          const defaults: Record<string, string> = {}
          data.product.productOptions.forEach((opt: any) => {
            const firstChoice = opt.choices.find((c: any) => c.inStock)
            if (firstChoice) defaults[opt.name] = firstChoice.value
          })
          setSelectedOptions(defaults)
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load product")
      }
    }
    if (productId) load()
  }, [productId])

const getDescriptionPreview = (html: string): string => {
  // Match all paragraphs
  const paragraphs = html.match(/<p>.*?<\/p>/g) || []

  if (paragraphs.length > 0) {
    // Find the heading paragraph (<p><strong>...</strong></p>)
    const headingIndex = paragraphs.findIndex((p) => p.includes("<strong>"))

    // If found, include that + the *next non-empty* paragraph (main description)
    if (headingIndex !== -1) {
      const cleanParas: string[] = []
      cleanParas.push(paragraphs[headingIndex])

      // Find the next valid paragraph (skip empty or &nbsp;)
      for (let i = headingIndex + 1; i < paragraphs.length; i++) {
        const content = paragraphs[i].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim()
        if (content.length > 0) {
          cleanParas.push(paragraphs[i])
          break
        }
      }

      return cleanParas.join("")
    }

    // If no heading found, fallback to first two non-empty paragraphs
    const validParas = paragraphs.filter(
      (p) => p.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim().length > 0
    )
    return validParas.slice(0, 2).join("")
  }

  // Fallback for list content
  const listItemMatch = html.match(/<li>.*?<\/li>/g)
  if (listItemMatch && listItemMatch.length >= 2) {
    return `<ul class="space-y-3 ml-6 list-disc list-outside mb-4">${listItemMatch
      .slice(0, 2)
      .join("")}</ul>`
  }

  return html
}



const formatDescription = (description: string) => {
  return description
    // 🟡 Headings (like <p><strong>Title</strong></p>)
    .replace(
      /<p><strong>(.*?)<\/strong><\/p>/g,
      '<h3 class="text-[1.05rem] sm:text-lg font-serif font-semibold text-[#B47B2B] mb-1 mt-3 first:mt-0 leading-snug">$1</h3>'
    )

    // 🟡 Inline bolds
    .replace(/<strong>(.*?)<\/strong>/g, '<span class="font-semibold text-[#DD9627]">$1</span>')

    // 🟡 Inline italics
    .replace(/<em>(.*?)<\/em>/g, '<em class="italic text-[#B47B2B] font-medium">$1</em>')

    // 🟡 Paragraphs — much tighter spacing
    .replace(
      /<p>(.*?)<\/p>/g,
      '<p class="mb-2 sm:mb-3 text-[0.95rem] sm:text-[1.05rem] leading-[1.55] text-[#3B2B13]">$1</p>'
    )

    // 🟡 Lists — compact bullets
    .replace(
      /<ul>/g,
      '<ul class="space-y-1.5 ml-5 list-disc list-outside mb-2 sm:mb-3 text-[#3B2B13]">'
    )
    .replace(/<li>(.*?)<\/li>/g, '<li class="text-[0.95rem] sm:text-[1.05rem]">$1</li>')
    .replace(/<\/ul>/g, '</ul>')
}


  useEffect(() => {
    const loadAll = async () => {
      if (!product) return
      try {
        const res = await fetch(`/api/products`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load products")
        const data = await res.json()
        const productsList = (data.products || []).map((p: any) => ({
          ...p,
          _category: inferCategory(p),
        }))
        setAllProducts(productsList)

        const currentId = product._id || product.id || product.slug
        const currentCategory = inferCategory(product)
        const related = productsList
          .filter((p: any) => (p._id || p.id || p.slug) !== currentId)
          .filter((p: any) => p._category === currentCategory)
          .slice(0, 4)
        setRelatedProducts(related)
      } catch (e: any) {
        console.error(e)
      }
    }
    loadAll()
  }, [product])

  // Keep pretty URL in address bar after product loads
  useEffect(() => {
    if (!product) return
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const hasQueryId = params.get("id")
    const isProductPath = window.location.pathname.startsWith("/product")
    if (isProductPath && hasQueryId) {
      const prettyPath = `/product/${product?.slug || product?._id || ""}`
      if (prettyPath && window.location.pathname + window.location.search !== prettyPath) {
        window.history.replaceState(null, "", prettyPath)
      }
    }
  }, [product])

  const selectedVariant = product ? getVariant(product, selectedOptions) : null

  const displayPrice = selectedVariant?.variant?.priceData?.price ?? product?.priceData?.price ?? product?.price?.price

  const displayPriceFormatted =
    selectedVariant?.variant?.priceData?.formatted?.price ??
    product?.priceData?.formatted?.price ??
    product?.price?.formatted?.price ??
    (displayPrice ? `₹${displayPrice}` : null)

  const inStock = selectedVariant?.stock?.inStock ?? product?.stock?.inStock ?? true

  const getProductImage = (p: any): string => {
    return p?.media?.mainMedia?.image?.url || p?.media?.items?.[0]?.image?.url || "/placeholder.svg"
  }

  const getFormattedPrice = (p: any): string => {
    return (
      p?.priceData?.formatted?.price ||
      p?.price?.formatted?.price ||
      (p?.priceData?.price ? `₹${p.priceData.price}` : "₹0")
    )
  }

  const handleAddToCart = async () => {
    try {
      if (!inStock) throw new Error("Out of stock")

      const optionArray = Object.entries(selectedOptions).map(([name, value]) => ({ name, value }))
      await add(product._id, quantity, optionArray, selectedVariant?._id)

      toast.success("Added to cart", {
        description: `${product.name} × ${quantity}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Add to cart failed"
      toast.error(message)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B]">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-[#3B2B13]">{error}</h1>
          <Link href="/shop">
            <Button className="bg-black text-[#FED649] hover:bg-[#1A1A1A]">Back to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B]">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-[#3B2B13]">Loading...</h1>
          <Link href="/shop">
            <Button variant="outline" className="bg-transparent border-[#3B2B13] text-[#3B2B13] hover:bg-[#3B2B13]/10">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B] text-[#3B2B13] font-sans">
      {/* ✅ SEO Head Section */}
      <Head>
        {product && (
          <>
            <title>{product.name} | Koko Fresh</title>
            <meta name="description" content={product.description?.replace(/<[^>]+>/g, "").slice(0, 150) || ""} />
            <link rel="canonical" href={`https://www.chinmaybhatk.wixsite.com/flavorzapp/product/${product.slug || product._id}`} />
          </>
        )}
      </Head>

      <Navigation />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6 mt-16 md:mt-24">
        <div className="flex items-center gap-2 text-sm text-[#3B2B13]/70 mb-2 sm:mb-4 lg:mb-6">
          <Link href="/shop" className="hover:text-[#3B2B13] transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Shop</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 lg:gap-12 mb-4 sm:mb-8 lg:mb-16">
          <div className="space-y-0">
<div className="relative overflow-hidden rounded-lg sm:rounded-2xl  group">
  <img
    src={
      product.media?.items?.[selectedImage]?.image?.url ||
      product.media?.mainMedia?.image?.url ||
      "/placeholder.svg"
    }
    alt={product.name}
    className="
      w-[85%]
      sm:w-full
      mx-auto
      h-auto
      aspect-square
      object-contain
      rounded-lg sm:rounded-xl
    "
  />

  {product.ribbon && (
    <Badge className="absolute top-2 sm:top-6 left-2 sm:left-6 bg-[#FED649] hover:bg-[#e6c33f] text-black text-xs sm:text-sm">
      {product.ribbon}
    </Badge>
  )}

  {(product.media?.items?.length || 0) > 1 && (
    <>
      <button
        onClick={handlePrevImage}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <button
        onClick={handleNextImage}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black/50 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
        {selectedImage + 1} / {product.media?.items?.length || 1}
      </div>
    </>
  )}
</div>


            <div className="flex gap-0.5 sm:gap-2 justify-center overflow-x-auto pb-0.5 sm:pb-1 mt-1 sm:mt-2">
              {(product.media?.items?.length
                ? product.media.items.map((m: any) => m.image?.url)
                : [product.media?.mainMedia?.image?.url]
              ).map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleImageSelect(index)}
                  className={`relative overflow-hidden rounded-md sm:rounded-lg transition-all duration-200 flex-shrink-0 ${
                    selectedImage === index
                      ? "ring-2 sm:ring-3 ring-[#3B2B13] shadow-lg scale-105"
                      : "hover:scale-105 hover:shadow-md"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-10 h-10 sm:w-20 sm:h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-lg sm:text-4xl lg:text-4xl font-serif font-bold text-[#3B2B13] leading-tight">
                {product.name}
              </h1>
            </div>

            <Card className="border-2 border-[#3B2B13]/20 bg-white/90 shadow-lg">
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5 sm:mb-2">
                      {displayPriceFormatted && (
                        <span className="font-bold text-xl sm:text-3xl text-[#DD9627] leading-tight">
                          {displayPriceFormatted}
                        </span>
                      )}
                      <Badge
                        variant={inStock ? "default" : "destructive"}
                        className={`text-xs font-medium ${
                          inStock ? "bg-[#FED649] text-[#3B2B13] border border-[#DD9627]" : "bg-gray-900 text-white"
                        }`}
                      >
                        {inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-[#3B2B13]/70">Inclusive of all taxes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#3B2B13]/20 bg-white/90 shadow-lg">
              <CardContent className="p-2 sm:p-4 space-y-1.5 sm:space-y-3">
                {/* Product Options */}
    {/* Product Options + Quantity in one grid (mobile combined) */}
{/* ✅ Product Options + Quantity in one responsive grid */}
{/* ✅ Product Options + Quantity (side by side only on mobile) */}
<div className="flex flex-col sm:block gap-2">
  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
    {/* 🧂 Weight / Variant Option */}
    {product.productOptions?.map((opt: any) => (
      <div
        key={opt.name}
        className="space-y-0.5 sm:space-y-1.5 col-span-1"
      >
        <label className="text-xs sm:text-sm font-serif font-semibold text-[#3B2B13] uppercase tracking-wide">
          {opt.name}:
        </label>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {opt.choices
            .filter((choice: any) => choice.visible)
            .map((choice: any) => (
              <button
                key={choice.value}
                onClick={() =>
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [opt.name]: choice.value,
                  }))
                }
                disabled={!choice.inStock}
                className={`px-2 sm:px-4 py-0.5 sm:py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs sm:text-base ${
                  selectedOptions[opt.name] === choice.value
                    ? "bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black shadow-lg"
                    : choice.inStock
                      ? "border-[#3B2B13]/30 hover:border-[#3B2B13] hover:bg-white/80 text-[#3B2B13]"
                      : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                {choice.value}
              </button>
            ))}
        </div>
      </div>
    ))}

    {/* 🧮 Quantity Selector (side-by-side only on mobile) */}
    <div className="space-y-0.5 sm:space-y-1.5 col-span-1">
      <label className="text-xs sm:text-sm font-serif font-semibold text-[#3B2B13] uppercase tracking-wide">
        Quantity:
      </label>
      <div className="flex items-center border-2 border-[#3B2B13]/20 rounded-xl overflow-hidden bg-white shadow-sm w-fit">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-1 sm:p-2 hover:bg-[#FED649]/20 transition-colors text-[#DD9627]"
        >
          <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <span className="px-2 sm:px-4 py-0.5 sm:py-2 border-x-2 border-[#3B2B13]/20 font-bold text-sm sm:text-xl min-w-[35px] sm:min-w-[60px] text-center bg-white text-[#3B2B13]">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="p-1 sm:p-2 hover:bg-[#FED649]/20 transition-colors text-[#DD9627]"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  </div>
</div>




                {/* Quantity Selector */}
                {/* <div className="space-y-0.5 sm:space-y-1.5">
                  <label className="text-xs sm:text-sm font-serif font-semibold text-[#3B2B13] uppercase tracking-wide">
                    Quantity:
                  </label>
                  <div className="flex items-center border-2 border-[#3B2B13]/20 rounded-xl overflow-hidden bg-white shadow-sm w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 sm:p-2 hover:bg-[#FED649]/20 transition-colors text-[#DD9627]"
                    >
                      <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <span className="px-2 sm:px-4 py-0.5 sm:py-2 border-x-2 border-[#3B2B13]/20 font-bold text-sm sm:text-xl min-w-[35px] sm:min-w-[60px] text-center bg-white text-[#3B2B13]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 sm:p-2 hover:bg-[#FED649]/20 transition-colors text-[#DD9627]"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div> */}

                {/* Add to Cart Button */}
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 pt-1 sm:pt-1.5">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black py-2 sm:py-3 text-sm sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#3B2B13]/20 bg-white/80 hidden sm:block">
              <CardContent className="p-2 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-[#DD9627] flex-shrink-0" />
                    <div>
                      <div className="font-medium text-[#B47B2B] text-xs sm:text-sm">Free Delivery</div>
                      <div className="text-xs text-[#3B2B13]/70">On orders above ₹500</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#B47B2B] flex-shrink-0" />
                    <div>
                      <div className="font-medium text-[#B47B2B] text-xs sm:text-sm">Secure Payment</div>
                      <div className="text-xs text-[#3B2B13]/70">100% Safe & Secure</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#DD9627] flex-shrink-0" />
                    <div>
                      <div className="font-medium text-[#B47B2B] text-xs sm:text-sm">Made to Order</div>
                      <div className="text-xs text-[#3B2B13]/70">Fresh preparation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-[#DD9627] flex-shrink-0" />
                    <div>
                      <div className="font-medium text-[#B47B2B] text-xs sm:text-sm">Authentic Recipe</div>
                      <div className="text-xs text-[#3B2B13]/70">Traditional taste</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      <Card className="mb-8 shadow-lg border-0 bg-white/95 rounded-2xl overflow-hidden">
  <div className="flex justify-center border-b border-[#FED649]/30">
    {["description", "instructions", "details"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`relative px-5 py-4 text-sm sm:text-base font-medium transition-colors duration-300 ${
          activeTab === tab
            ? "text-[#DD9627]"
            : "text-[#3B2B13]/60 hover:text-[#B47B2B]"
        }`}
      >
        {tab === "instructions" ? "How to Use" : tab.charAt(0).toUpperCase() + tab.slice(1)}
        {activeTab === tab && (
          <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] rounded-t-md" />
        )}
      </button>
    ))}
  </div>

      <CardContent className="p-6 sm:p-8">
            {activeTab === "description" && (
              <div className="space-y-6 sm:space-y-8">
                <div className="block sm:hidden">
                  <div
                    className="prose prose-sm max-w-none text-[#3B2B13] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatDescription(
                        expandedDescription ? product.description : getDescriptionPreview(product.description),
                      ),
                    }}
                  />
                  {!expandedDescription && (
                    <button
                      onClick={() => setExpandedDescription(true)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-semibold rounded-lg transition-all duration-200"
                    >
                      Read More
                    </button>
                  )}
                  {expandedDescription && (
                    <button
                      onClick={() => setExpandedDescription(false)}
                      className="mt-4 px-4 py-2 bg-white border-2 border-[#3B2B13]/20 text-[#3B2B13] font-semibold rounded-lg hover:bg-[#FED649]/10 transition-all duration-200"
                    >
                      Read Less
                    </button>
                  )}
                </div>

                <div className="hidden sm:block">
                  <div
                    className="prose prose-sm sm:prose-base max-w-none text-[#3B2B13] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatDescription(product.description),
                    }}
                  />
                </div>
              </div>
            )}

 {activeTab === "instructions" && (
  <div className="space-y-10 sm:space-y-12">
    {/* 🏷️ Header */}
    <div className="flex items-center gap-4 mb-2 sm:mb-6">
      <div className="p-3 bg-gradient-to-br from-[#FED649] to-[#DD9627] rounded-2xl shadow-lg">
        <ChefHat className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#DD9627]">
          How to Use
        </h2>
        <p className="text-sm sm:text-base text-[#B47B2B]/90 mt-1 font-medium">
          Follow these easy steps to enjoy the authentic KOKO Fresh flavour
        </p>
      </div>
    </div>

    {/* 🪶 Instruction Steps */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
      {product.additionalInfoSections?.map((section, index) => {
        const steps = section.description
          .split(/<p>|<\/p>/)
          .filter((s) => s.trim().length > 0 && !s.includes("<strong>"))

        return steps.map((step, stepIndex) => (
          <div
            key={`${index}-${stepIndex}`}
            className="relative bg-gradient-to-br from-[#FFF9E8] via-[#FFF3C1] to-[#FED649]/20 border border-[#FED649]/50 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg hover:shadow-[#FED649]/30 transition-all duration-300"
          >
            {/* 🔢 Step number */}
            <div className="absolute -top-4 left-6 bg-gradient-to-br from-[#FED649] to-[#DD9627] text-black w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-extrabold text-lg shadow-md border border-[#B47B2B]/30">
              {stepIndex + 1}
            </div>

            {/* 📝 Step Content */}
            <div
              className="prose prose-sm sm:prose-base text-[#3B2B13] mt-6 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: step
                  .replace(/<strong>/g, '<strong class="text-[#DD9627] font-semibold">')
                  .replace(/<\/strong>/g, "</strong>")
                  .replace(/&nbsp;/g, "")
                  .replace(
                    /Step\s*\d+:/gi,
                    (match) =>
                      `<span class="font-bold text-[#B47B2B] tracking-wide">${match}</span>`
                  ),
              }}
            />
          </div>
        ))
      })}
    </div>

    {/* 💡 Pro Tip Section */}
    <div className="p-6 sm:p-8 bg-gradient-to-r from-[#FED649]/25 via-[#DD9627]/15 to-[#B47B2B]/10 border border-[#FED649]/50 rounded-2xl shadow-inner">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FED649] to-[#DD9627] text-black rounded-full flex items-center justify-center shadow-md border border-[#B47B2B]/30">
          <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <h4 className="font-serif font-semibold text-[#DD9627] mb-2 text-lg">
            Pro Tip
          </h4>
          <p className="text-[#3B2B13]/90 text-sm sm:text-base leading-relaxed">
            Warm a spoon of ghee or sesame oil before mixing — this enhances the
            aroma and brings out the rich, nutty flavour of Bengal Gram Chutney Powder.
          </p>
        </div>
      </div>
    </div>
  </div>
)}


            {activeTab === "details" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#3B2B13]">Product Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-[#FED649]/40 text-sm sm:text-base">
                      <span className="text-[#3B2B13]/70">Product Type</span>
                      <span className="font-medium text-[#3B2B13] capitalize">{product.productType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#FED649]/40 text-sm sm:text-base">
                      <span className="text-[#3B2B13]/70">Availability</span>
                      <Badge
                        variant={product.stock?.inStock ? "default" : "destructive"}
                        className={`text-xs font-medium ${
                          product.stock?.inStock
                            ? "bg-[#FED649] text-[#3B2B13] border border-[#DD9627]"
                            : "bg-gray-900 text-white"
                        }`}
                      >
                        {product.stock?.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#3B2B13]">Variants</h3>
                  <div className="space-y-3">
                    {product.variants
                      ?.filter((variant: any) => variant.variant.visible)
                      .map((variant: any, index: number) => (
                        <div key={index} className="p-3 sm:p-4 border border-[#FED649]/40 rounded-lg bg-white">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="font-medium text-sm sm:text-base text-[#3B2B13]">
                              {Object.entries(variant.choices)
                                .map(([key, value]) => `${value}`)
                                .join(", ")}
                            </span>
                            <span className="text-[#DD9627] font-semibold text-sm sm:text-base">
                              {variant.variant.priceData.formatted.price}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>

</Card>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#3B2B13]">
              Related {inferCategory(product) === "Masala" ? "Masalas" : "Chutneys"}
            </h2>
            <Link href="/shop" className="text-sm text-[#3B2B13] hover:text-[#DD9627] hover:underline font-medium">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rp: any) => {
              const rpId = rp._id || rp.id || ""
              return (
                <Link key={rpId} href={`/product?id=${rp.slug || rpId}`}>
                  <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white rounded-xl border border-[#DD9627]/20">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={getProductImage(rp) || "/placeholder.svg"}
                          alt={rp.name}
                          className="object-cover w-full h-40 sm:h-44 lg:h-48 group-hover:scale-105 transition-all duration-500"
                        />
                        {rp.ribbon && (
                          <Badge className="absolute top-2 left-2 bg-[#FED649] hover:bg-[#e6c33f] text-black text-xs sm:text-sm">
                            {rp.ribbon}
                          </Badge>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-serif font-semibold text-sm sm:text-base text-[#3B2B13] line-clamp-2 group-hover:text-[#DD9627] transition-colors">
                          {rp.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-base sm:text-lg font-bold text-[#B47B2B]">{getFormattedPrice(rp)}</span>
                          {rp.stock?.inStock === false && (
                            <Badge variant="destructive" className="text-xs">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
