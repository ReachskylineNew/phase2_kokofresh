"use client"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import ManufacturingProcess from "../components/ProcessSection"
import {
  ArrowRight,
  Star,
  Users,
  Play,
  Heart,
  Zap,
  Package,
  Sparkles,
  TrendingUp,
  Clock,
  HandHeart,
  Shield,
  Flame,
  Hammer,
  Instagram,
  Twitter,
  Youtube,
  ShoppingCart,
  Leaf
} from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"

type Product = {
  _id?: string
  id?: string
  name: string
  priceData?: {
    price: number
    currency: string
    formatted: {
      price: string
    }
  }
  price?: {
    price: number
    currency: string
    formatted: {
      price: string
    }
  }
  media?: {
    mainMedia?: {
      image?: {
        url: string
      }
    }
    items?: Array<{
      image?: {
        url: string
      }
    }>
  }
  description?: string
  slug?: string
  stock?: {
    inStock: boolean
  }
  variants?: Array<{
    choices: {
      weight: string
    }
    variant: {
      priceData: {
        price: number
        formatted: {
          price: string
        }
      }
      visible?: boolean
    }
    stock: {
      inStock: boolean
    }
    _id: string
  }>
  ribbons?: Array<{
    text: string
  }>
  productType?: string
  region?: string
  category?: string
  rating?: number
  reviews?: number
  bestseller?: boolean
  limitedEdition?: boolean
  ribbon?: string
  additionalInfoSections?: any[]
  productOptions?: any[]
}

type Reel = {
  _id: string
  title: string
  url: string
  thumbnail?: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { add } = useCart()
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const [reels, setReels] = useState<Reel[]>([])
 const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024)
    checkScreen()
    window.addEventListener("resize", checkScreen)
    return () => window.removeEventListener("resize", checkScreen)
  }, [])

  // useEffect(() => {
  //   const loadReels = async () => {
  //     try {
  //       const res = await fetch("/api/reels", { cache: "no-store" })
  //       const data = await res.json()
  //       setReels(data.data || [])
  //     } catch (err) {
  //       console.error("Failed to load reels:", err)
  //     }
  //   }
  //   loadReels()
  // }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/products", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load products")
        const data = await res.json()
        const productsData = data.products || []
        console.log("Fetched products for homepage:", productsData)

        // Show first 6 products or filter for featured/bestsellers
        const featuredProducts = productsData.slice(0, 6)
        setProducts(featuredProducts)

        // Set default variants
        const defaultVariants: Record<string, string> = {}
        featuredProducts.forEach((product: Product) => {
          const productId = product._id || product.id || ""
          if (product.variants && product.variants.length > 0) {
            // Only use visible variants for default selection
            const visibleVariants = product.variants.filter((variant) => variant.variant.visible)
            if (visibleVariants.length > 0) {
              defaultVariants[productId] = visibleVariants[0]._id
            }
          }
        })
        setSelectedVariants(defaultVariants)
      } catch (e: any) {
        setError(e?.message || "Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  const getProductImage = (product: Product): string => {
    return product.media?.mainMedia?.image?.url || product.media?.items?.[0]?.image?.url || "/placeholder.svg"
  }

  const getCurrentPrice = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) {
      return product.priceData?.price ?? product.price?.price ?? 0
    }

    const selectedVariantId = selectedVariants[product._id || product.id || ""]
    const visibleVariants = product.variants.filter((variant) => variant.variant.visible)
    const selectedVariant = visibleVariants.find((v) => v._id === selectedVariantId) || visibleVariants[0]
    return selectedVariant?.variant.priceData.price || 0
  }

  const getFormattedPrice = (product: Product): string => {
    return (
      product.priceData?.formatted?.price ??
      product.price?.formatted?.price ??
      (product.priceData?.price ? `₹${product.priceData.price}` : "₹0")
    )
  }

  const isInStock = (product: Product): boolean => {
    if (!product.variants || product.variants.length === 0) {
      return product.stock?.inStock ?? true
    }

    const selectedVariantId = selectedVariants[product._id || product.id || ""]
    const visibleVariants = product.variants.filter((variant) => variant.variant.visible)
    const selectedVariant = visibleVariants.find((v) => v._id === selectedVariantId) || visibleVariants[0]
    return selectedVariant?.stock.inStock ?? true
  }

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }))
  }

  const isMadeToOrder = (product: Product): boolean => {
    return product.ribbons?.some((ribbon) => ribbon.text === "Made to Order") || false
  }

  const handleAddToCart = async (product: Product) => {
    try {
      if (!isInStock(product)) throw new Error("Out of stock")

      const productId = product._id || product.id || ""
      const selectedVariantId = selectedVariants[productId]
      const visibleVariants = product.variants?.filter((variant) => variant.variant.visible) || []
      const selectedVariant = visibleVariants.find((v) => v._id === selectedVariantId) || visibleVariants[0]

      // Build options array for hook
      const optionsArray = selectedVariant
        ? Object.entries(selectedVariant.choices).map(([name, value]) => ({
            name,
            value,
          }))
        : []

      await add(productId, 1, optionsArray, selectedVariantId)

      const weightText = selectedVariant ? ` (${Object.values(selectedVariant.choices).join(", ")})` : ""
      toast.success("Added to cart", {
        description: `${product.name}${weightText}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Add to cart failed"
      toast.error(message)
    }
  }
  return (
    <div className="min-h-screen bg-primary/5">
      <Navigation />

      {/* Hero Section - Gen Z Vibes */}

 <section className="relative mt-16 md:mt-24 flex flex-col lg:flex-row items-center justify-between min-h-[90vh] overflow-hidden bg-black text-center lg:text-left">
      {/* ✅ Responsive background - Only one loads */}
    <div className="absolute inset-0 z-0">
  {/* Desktop BG */}
  <Image
    src="https://static.wixstatic.com/media/e7c120_0a6c2f1ec5134b9cb262528922b7b2d5~mv2.webp"
    alt="Desktop background"
    fill
    priority
    sizes="100vw"
    className="object-cover object-center hidden sm:block"
  />

  {/* Mobile BG */}
  <Image
    src="https://static.wixstatic.com/media/e7c120_8e43e22e693f4e8db644c2f1a3f07fb6~mv2.webp"
    alt="Mobile background"
    fill
    priority
    sizes="100vw"
    className="object-cover object-center block sm:hidden"
  />
</div>


      {/* Content */}
      <div className="relative z-10 w-full lg:w-1/2 px-6 sm:px-10 py-16 lg:pl-24 text-center lg:text-left">
        <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] mb-6 text-white">
          Authentic <br /> & Handcrafted <br />
          <span className="text-[#FED649]">Spice Masala.</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-md mx-auto lg:mx-0">
          At Kokofresh, we redefine freshness. Our spices are sourced from trusted farms,
          slow-roasted in small batches, and sealed to perfection — ensuring every pinch
          delivers the purest taste of India.
        </p>
        <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-4 w-full">
          <Link href="/shop" className="w-[80%] mx-auto sm:mx-0">
            <Button
              size="lg"
              className="w-full bg-[#FED649] hover:bg-[#DD9627] text-black font-bold text-lg px-8 py-4 rounded-full transition-all duration-300"
            >
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    </section>


      {/* <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('https://static.wixstatic.com/media/e7c120_1ee1c0b437b94cf9a07e89f845073a2e~mv2.jpg')",
        }}
      >
  
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/40" />

        
        <div className="absolute top-20 left-10 w-16 h-16 bg-[#DD9627]/20 rounded-full blur-xl float-animation" />
        <div
          className="absolute bottom-32 right-16 w-24 h-24 bg-[#FED649]/20 rounded-full blur-xl float-animation"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-12 h-12 bg-[#EDCC32]/30 rounded-full blur-lg float-animation"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
      
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
            <TrendingUp className="h-4 w-4 text-[#FED649]" />
            <span className="text-sm font-medium text-[#FED649]">#1 Trending Spice Brand</span>
          </div>

          <h1 className="font-black text-6xl md:text-8xl lg:text-9xl mb-6 text-balance bg-gradient-to-r from-[#FED649] via-[#DD9627] to-[#B47B2B] bg-clip-text text-transparent leading-tight">
            KoKoFresh
          </h1>

          <p className="text-2xl md:text-3xl mb-4 text-balance font-bold text-white">
            Where Heritage Meets <span className="text-[#FED649]">Hustle</span> 🔥
          </p>

          <p className="text-lg md:text-xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Small batch. Slow grind. 100% real. The spices your grandma would approve of, but your insta feed will
            obsess over.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-[#DD9627] hover:bg-[#B47B2B] text-white font-bold text-lg px-8 py-4 pulse-glow"
            >
              Shop the Hype
              <Flame className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#FED649] text-[#FED649] hover:bg-[#FED649] hover:text-black font-bold text-lg px-8 py-4 bg-transparent"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Our Story
            </Button>
          </div>

         
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#FED649] fill-[#FED649]" />
              <span>4.9★ (10K+ reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#FED649]" />
              <span>100K+ Gen Z customers</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#FED649]" />
              <span>100% Authentic</span>
            </div>
          </div>
        </div>
      </section> */}



      <section className="bg-[#DD9627] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm md:text-base font-medium">
            <Sparkles className="h-4 w-4 text-[#FED649]" />
            <span>Flavourz of India</span>
            <Sparkles className="h-4 w-4 text-[#FED649]" />
          </div>
        </div>
      </section>

{/* Quote Section - Black Background (KokoFresh Story Style) */}
<section className="relative py-24 bg-black text-white text-center overflow-hidden">

  {/* Content */}
  <div className="relative z-10 max-w-3xl mx-auto px-6">
    {/* Decorative Quote Mark */}
  

    {/* Quote Text */}
    <p className="font-serif text-xl sm:text-2xl md:text-3xl leading-relaxed text-white/90 mb-8">
      <span className="text-[#FED649] font-semibold">KokoFresh</span>, where we bring you the most authentic flavors of India,  
      straight from our home to yours. Our passion for purity and tradition  
      is sealed in every pack of our exquisite spice powders.
    </p>

    <p className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
      We believe that the heart of any delicious meal lies in the quality of its ingredients —  
      and we are dedicated to providing you with the finest, most flavorful spices  
      to elevate your culinary creations.
    </p>

    {/* Subtle Divider */}
    <div className="mt-10 mx-auto w-24 h-[2px] bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] rounded-full" />

    {/* Signature Line */}
    <div className="mt-6 text-[#FED649]/80 font-semibold tracking-wide uppercase text-sm">
      From the Heart of KokoFresh
    </div>
  </div>
</section>





{/* USP Section - White Theme (Drop Us a Line Style) */}
<section className="py-24 bg-white text-[#3B2B13] font-sans">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="text-center mb-16">
      <h2 className="font-serif font-bold text-4xl md:text-6xl mb-6 text-[#3B2B13]">
        Not Your{" "}
        <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
          Average Masala
        </span>
      </h2>
      <p className="text-lg md:text-xl text-[#3B2B13]/70 font-medium max-w-3xl mx-auto">
        We're the spice brand that gets it — authentic flavors, modern convenience, and that irresistible touch that
        makes your food (and your feed) shine.
      </p>
    </div>

    {/* Feature Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        {
      icon: <HandHeart className="h-16 sm:h-20 lg:h-24 w-auto text-[#DD9627] group-hover:text-[#B47B2B] transition-colors" />,
          title: "Handcrafted Heritage",
          description:
            "Rooted in India’s spice traditions, every blend is carefully handcrafted to preserve authentic regional flavors passed through generations.",
          stat: "Traditional Process",
        },
         {
          icon: <Leaf className="h-16 sm:h-20 lg:h-24 w-auto text-[#DD9627] group-hover:text-[#B47B2B] transition-colors" />,
          title: "100% Natural Ingredients",
          description:
            "No preservatives. No artificial colors. Only pure, farm-fresh spices sourced directly from the hands that nurture them.",
          stat: "Pure & Clean",
        },
        {
      icon: <Package className="h-16 sm:h-20 lg:h-24 w-auto text-[#DD9627] group-hover:text-[#B47B2B] transition-colors" />,
      title: "Sealed for Purity",
      description:
        "Air-tight, eco-conscious packaging ensures each spice stays as fresh and fragrant as the day it was ground.",
      stat: "Stay Fresh",
    }
      ].map((usp, index) => (
        <Card
          key={index}
          className="group bg-white border-2 border-[#DD9627]/20 hover:border-[#DD9627]/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <CardContent className="p-8 text-center">
            <div className="mb-6 flex justify-center">{usp.icon}</div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-[#3B2B13] group-hover:text-[#B47B2B] transition-colors">
              {usp.title}
            </h3>
            <p className="text-[#3B2B13]/80 leading-relaxed mb-6">{usp.description}</p>
            <div className="inline-block bg-[#FED649]/20 text-[#B47B2B] border border-[#FED649]/50 font-bold px-4 py-2 rounded-full text-sm uppercase tracking-wide">
              {usp.stat}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>


<section className="py-20 bg-white text-[#3B2B13]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
    <div className="text-center mb-16">
      <h2 className="font-serif font-bold text-4xl md:text-6xl mb-4 leading-tight text-[#3B2B13]">
        Pick Your{" "}
        <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
          Main Character
        </span>{" "}
        Era
      </h2>
      <p className="text-lg md:text-xl text-[#6B4A0F]/80 font-medium">
        Every spice tells a story. What's yours?
      </p>
    </div>

    {/* Error Display */}
    {error && (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg font-medium">{error}</p>
      </div>
    )}

    {/* Product Grid */}
    {isLoading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden bg-white border border-[#F0E6C0]">
            <CardContent className="p-0">
              <div className="h-64 bg-[#FFF6CC] animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const currentPrice = getCurrentPrice(product)
          const productId = product._id || product.id || ""
          const selectedVariantId = selectedVariants[productId]
          const visibleVariants = product.variants?.filter((variant) => variant.variant.visible) || []
          const selectedVariant = visibleVariants.find((v) => v._id === selectedVariantId) || visibleVariants[0]
          const pid = product.slug || product._id || product.id || ""

          return (
            <Link key={productId} href={`/product?id=${pid}`}>
              <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white rounded-xl hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
  src={getProductImage(product) || "/placeholder.svg"}
  alt={product.name || "Product Image"}
  width={500}
  height={500}
  className="object-contain w-full aspect-square bg-white group-hover:scale-105 transition-all duration-500"
  priority={false}
  loading="lazy"
/>

                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.bestseller && (
                        <Badge className="bg-[#DD9627] text-white text-xs px-2 py-1 rounded-full shadow-lg border-0 font-medium">
                          ✨ Bestseller
                        </Badge>
                      )}
                      {product.limitedEdition && (
                        <Badge className="bg-[#B47B2B] text-white text-xs px-2 py-1 rounded-full shadow-lg border-0 font-medium">
                          🔥 Limited
                        </Badge>
                      )}
                      {isMadeToOrder(product) && (
                        <Badge className="bg-[#FED649] text-black text-xs px-2 py-1 rounded-full shadow-lg border-0 font-medium">
                          👨‍🍳 Made to Order
                        </Badge>
                      )}
                      {!isInStock(product) && (
                        <Badge className="bg-gray-900/90 text-white text-xs px-2 py-1 rounded-full shadow-lg border-0 font-medium">
                          Out of Stock
                        </Badge>
                      )}
                    </div>

                    <button className="absolute top-2 right-2 p-2 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg">
                      <Heart className="h-3 w-3 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-1 sm:mb-2 lg:mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-base sm:text-lg lg:text-xl text-[#3B2B13] mb-1 lg:mb-2 line-clamp-2 leading-tight group-hover:text-[#DD9627] transition-colors duration-200">
                          {product.name}
                        </h3>
                      </div>
                      {typeof product.rating === "number" && (
                        <div className="flex items-center gap-1 bg-[#FFF6CC] px-2 lg:px-3 py-1 lg:py-2 rounded-full ml-2 lg:ml-3 flex-shrink-0 border border-[#FED649]/40">
                          <Star className="h-3 w-3 lg:h-4 lg:w-4 fill-[#FED649] text-[#FED649]" />
                          <span className="text-xs lg:text-sm font-semibold text-[#B47B2B]">
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 lg:gap-2 mb-2 lg:mb-4">
                      {product.region && (
                        <span className="text-xs lg:text-sm text-[#B47B2B] font-semibold bg-[#FFF6CC] px-2 lg:px-3 py-1 lg:py-2 rounded-full border border-[#DD9627]">
                          📍 {product.region}
                        </span>
                      )}
                      {product.category && (
                        <span className="text-xs lg:text-sm text-[#6B4A0F] font-medium bg-[#FFF9E8] px-2 lg:px-3 py-1 lg:py-2 rounded-full">
                          {product.category}
                        </span>
                      )}
                    </div>

                    {product.variants && product.variants.length > 0 && (
                      <div className="mb-3 space-y-3">
                        <div className="flex items-center justify-between text-[#3B2B13]">
                          <span className="text-xs lg:text-sm font-medium">Weight:</span>
                          <select
                            value={selectedVariantId || ""}
                            onChange={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleVariantChange(productId, e.target.value)
                            }}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            className="px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm border border-[#EAD9A2] rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9627] focus:border-transparent bg-white text-[#3B2B13]"
                          >
                            {product.variants
                              .filter((variant) => variant.variant.visible)
                              .map((variant) => (
                                <option key={variant._id} value={variant._id}>
                                  {variant.choices.weight}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg lg:text-xl font-bold text-[#B47B2B]">
                            {selectedVariant?.variant.priceData.formatted.price || `₹${currentPrice}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Updated Add to Cart Button (Matching Send Message Style) */}
                    <Button
                      className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-bold text-base lg:text-lg py-2 lg:py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        try {
                          if (!isInStock(product)) throw new Error("Out of stock")
                          const exportProductId = product._id || product.id || ""
                          const selectedVariantId = selectedVariant?._id

                          const optionsArray = selectedVariant
                            ? Object.entries(selectedVariant.choices).map(([name, value]) => ({
                                name,
                                value,
                              }))
                            : []

                          await add(exportProductId, 1, optionsArray, selectedVariantId)

                          const weightText = selectedVariant ? ` (${selectedVariant.choices.weight})` : ""
                          toast.success("Added to cart", { description: `${product.name}${weightText}` })
                        } catch (err) {
                          const message = err instanceof Error ? err.message : "Add to cart failed"
                          toast.error(message)
                        }
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    )}

    {/* CTA Button */}
    <div className="text-center mt-12">
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-bold text-lg px-10 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
      >
        <Link href="/shop">
          Shop All Spices
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  </div>
</section>




      {/* Social Proof Banner */}
<section className="py-20 bg-black text-center text-white relative overflow-hidden">
  {/* Subtle Gold Glow */}
  <div className="absolute inset-0">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DD9627]/10 rounded-full blur-3xl opacity-40" />
  </div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        { value: "100K+", label: "Happy Customers" },
        { value: "4.9★", label: "Average Rating" },
        { value: "50M+", label: "Insta Views" },
        { value: "24/7", label: "Flavor Support" },
      ].map((stat, i) => (
        <div key={i} className="group transition-all duration-300">
          {/* Number */}
          <div
            className="text-4xl md:text-5xl font-serif font-black mb-2 
                       bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B]
                       bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-110"
            style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}
          >
            {stat.value}
          </div>

          {/* Label */}
          <div
            className="text-sm md:text-base text-white/80 font-sans font-medium 
                       tracking-wide group-hover:text-[#FED649] transition-colors duration-300"
            style={{ fontFamily: "var(--font-sans, 'Inter', sans-serif)" }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>



      <ManufacturingProcess />
      {/* UGC Section - Social Media Native */}
      {/* <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl md:text-6xl mb-6 text-balance">
              The <span className="text-[#DD9627]">#FlavourzChallenge</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our community is serving looks AND flavors. Join the movement.
            </p>


            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-8">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#DD9627] text-[#DD9627] hover:bg-[#DD9627] hover:text-white bg-transparent whitespace-nowrap"
              >
                <a
                  href="https://www.instagram.com/koko_fresh_india?igsh=dHltYm0waWVtZTdu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Follow @kokofresh
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#DD9627] text-[#DD9627] hover:bg-[#DD9627] hover:text-white bg-transparent whitespace-nowrap"
              >
                <a
                  href="https://x.com/KOKOFresh_IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  Tweet #FlavourzChallenge
                </a>
              </Button>
            </div>
          </div>

   
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reels.map((reel) => (
              <div
                key={reel._id}
                className="rounded-lg shadow-lg p-2 bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="relative w-full overflow-hidden rounded-lg">
                  <iframe
                    src={`${reel.url}embed`}
                    width="100%"
                    height="500"
                    frameBorder="0"
                    scrolling="no"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    className="rounded-lg w-full min-h-[450px] md:min-h-[500px] scale-[1.01] origin-top"
                    style={{
                      transformOrigin: "top center",
                    }}
                  />
                </div>

   
              </div>
            ))}
          </div>

         
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Ready to join the flavor revolution? Tag us and get featured!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#DD9627] hover:bg-[#B47B2B] text-white font-bold">
                <a
                  href="https://www.instagram.com/koko_fresh_india?igsh=dHltYm0waWVtZTdu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  Post Your Creation
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-[#DD9627] text-[#DD9627] hover:bg-[#DD9627] hover:text-white font-bold bg-transparent"
              >
                <a href="https://www.youtube.com/@kokofresh" target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-5 w-5" />
                  Watch Tutorials
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section> */}


<section className="py-20 bg-white text-gray-900">
  <div className="max-w-4xl mx-auto px-4 text-center">
    {/* Heading */}
   
  <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-balance">
  Ready to{" "}
  <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent font-semibold">
    Level Up
  </span>{" "}
  Your Kitchen Game?
</h2>

    {/* Subtext */}
    <p className="text-xl mb-10 text-muted-foreground">
      Join 100K+ Gen Z food lovers who've already upgraded their spice game.
      Your taste buds (and your followers) will thank you.
    </p>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-6 justify-center">
      {/* Solid Gradient Button */}
      <Button
        size="lg"
        className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black 
                   font-bold text-lg px-8 py-4 flex items-center justify-center 
                   hover:brightness-90 transition-all"
      >
        Shop Now – Free Shipping
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      {/* Gradient Outline Button */}
      {/* <Button
        size="lg"
        variant="outline"
        className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black 
                   font-bold text-lg px-8 py-4 flex items-center justify-center hover:brightness-90 
                   border-0"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Get Recipe Inspo
      </Button> */}
    </div>

    {/* Note */}
    {/* <p className="text-sm mt-8 text-muted-foreground">
      ✨ Use code <span className="font-semibold text-[#DD9627]">GENZ20</span> for 20% off your first order ✨
    </p> */}
  </div>
</section>



      <Footer />
    </div>
  )
}
