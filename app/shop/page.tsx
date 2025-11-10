"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Search, X, Plus, Minus, ChevronRight, Filter, Check } from "lucide-react"
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
      visible: boolean
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

type WeightOption = {
  weight: string
  price: number
  originalPrice?: number
}

const getWeightOptions = (basePrice: number): WeightOption[] => [
  { weight: "100g", price: Math.round(basePrice * 0.6) },
  { weight: "250g", price: basePrice },
  { weight: "500g", price: Math.round(basePrice * 1.8) },
  { weight: "1kg", price: Math.round(basePrice * 3.4) },
]

export default function ShopPage() {
  const { add, cart, updateQuantity, remove, reload } = useCart()

  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showBestsellers, setShowBestsellers] = useState(false)
  const [showLimitedEdition, setShowLimitedEdition] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [hoveredProducts, setHoveredProducts] = useState<Record<string, number>>({})
  const [mobileCartQuantities, setMobileCartQuantities] = useState<Record<string, number>>({})
  const [categories, setCategories] = useState<string[]>(["all"])

  const totalCartItems = Array.isArray(cart?.lineItems)
    ? cart.lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)

        // fetch products + categories in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/collections", { cache: "no-store" }),
        ])

        if (!productsRes.ok) throw new Error("Failed to load products")
        if (!categoriesRes.ok) throw new Error("Failed to load categories")

        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()

        console.log("productsData:", productsData)
        console.log("categoriesData:", categoriesData)

        // 🧠 Helper to Title-Case text (camelized)
        const toTitleCase = (str: string) =>
          str
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

        // map category IDs to names
        const categoryMap: Record<string, string> = {}
        ;(categoriesData.categories || []).forEach((cat: any) => {
          const formattedName = toTitleCase(cat.name?.trim() || "")
          categoryMap[cat._id] = formattedName
        })

        // assign correct category name to each product
        const mappedProducts = (productsData.products || []).map((p: Product) => {
          const mainCollectionId = p.collectionIds?.find((id: string) => id !== "00000000-000000-000000-000000000001")
          const categoryName = categoryMap[mainCollectionId] || "Uncategorized"
          return { ...p, category: categoryName }
        })

        console.log("✅ Mapped products with category:", mappedProducts)

        const uniqueCategories = Array.from(new Set(mappedProducts.map((p: Product) => p.category).filter(Boolean)))
          .map(toTitleCase)
          .sort((a, b) => {
            // Put "Coming Soon" at the end
            if (a === "Coming Soon") return 1
            if (b === "Coming Soon") return -1
            // Otherwise sort alphabetically
            return a.localeCompare(b)
          })

        // set in state (for filters)
        setCategories(["All", ...uniqueCategories])
        setProducts(mappedProducts)

        // select default visible variants
        const defaultVariants: Record<string, string> = {}
        mappedProducts.forEach((product: Product) => {
          const productId = product._id || product.id || ""
          if (product.variants && product.variants.length > 0) {
            const firstVisibleVariant = product.variants.find((v) => v.variant.visible)
            defaultVariants[productId] = firstVisibleVariant ? firstVisibleVariant._id : product.variants[0]._id
          }
        })
        setSelectedVariants(defaultVariants)
      } catch (e: any) {
        setError(e?.message || "Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const getCurrentPrice = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) {
      return product.priceData?.price ?? product.price?.price ?? 0
    }

    const selectedVariantId = selectedVariants[product._id || product.id || ""]
    const selectedVariant =
      product.variants.find((v) => v._id === selectedVariantId) ||
      product.variants.find((v) => v.variant.visible) ||
      product.variants[0]
    return selectedVariant.variant.priceData.price
  }

  const getCurrentImage = (product: Product): string => {
    const productId = product._id || product.id || ""
    const hoverIndex = hoveredProducts[productId] || 0

    if (product.media?.items && product.media.items.length > 1) {
      const imageIndex = hoverIndex % product.media.items.length
      return product.media.items[imageIndex]?.image?.url || "/placeholder.svg"
    }

    return getProductImage(product)
  }

  const getProductImage = (product: Product): string => {
    return product.media?.mainMedia?.image?.url || product.media?.items?.[0]?.image?.url || "/placeholder.svg"
  }

  const getProductPrice = (product: Product): number => {
    return product.priceData?.price ?? product.price?.price ?? 0
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
    const selectedVariant =
      product.variants.find((v) => v._id === selectedVariantId) ||
      product.variants.find((v) => v.variant.visible) ||
      product.variants[0]
    return selectedVariant.stock.inStock
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

  const handleMouseEnter = (productId: string) => {
    const product = products.find((p) => (p._id || p.id) === productId)
    if (product?.media?.items && product.media.items.length > 1) {
      const interval = setInterval(() => {
        setHoveredProducts((prev) => ({
          ...prev,
          [productId]: ((prev[productId] || 0) + 1) % product.media.items!.length,
        }))
      }, 800)
      ;(window as any)[`interval_${productId}`] = interval
    }
  }

  const handleMouseLeave = (productId: string) => {
    const interval = (window as any)[`interval_${productId}`]
    if (interval) {
      clearInterval(interval)
      delete (window as any)[`interval_${productId}`]
    }
    setHoveredProducts((prev) => ({
      ...prev,
      [productId]: 0,
    }))
  }

  const handleMobileAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (!isInStock(product)) throw new Error("Out of stock")

      const productId = product._id || product.id || ""
      const selectedVariantId = selectedVariants[productId]
      const selectedVariant =
        product.variants?.find((v) => v._id === selectedVariantId) ||
        product.variants?.find((v) => v.variant.visible) ||
        product.variants?.[0]

      const exportProductId = product._id || product.id || ""
      const optionsArray = selectedVariant
        ? Object.entries(selectedVariant.choices).map(([name, value]) => ({
            name,
            value,
          }))
        : []

      await add(exportProductId, 1, optionsArray, selectedVariantId)
      setMobileCartQuantities((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }))

      const weightText = selectedVariant ? ` (${selectedVariant.choices.weight})` : ""
      // toast.success("Added to cart", {
      //   description: `${product.name}${weightText}`,
      // })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Add to cart failed"
      toast.error(message)
    }
  }

  const handleMobileIncrement = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (!isInStock(product)) throw new Error("Out of stock")

      const productId = product._id || product.id || ""
      const selectedVariantId = selectedVariants[productId]
      const selectedVariant =
        product.variants?.find((v) => v._id === selectedVariantId) ||
        product.variants?.find((v) => v.variant.visible) ||
        product.variants?.[0]

      const exportProductId = product._id || product.id || ""
      const optionsArray = selectedVariant
        ? Object.entries(selectedVariant.choices).map(([name, value]) => ({ name, value }))
        : []

      await add(exportProductId, 1, optionsArray, selectedVariantId)

      // 🔄 refresh the cart to update floating count
      await reload()

      // update UI
      setMobileCartQuantities((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Add to cart failed"
      toast.error(message)
    }
  }

  const handleMobileDecrement = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const productId = product._id || product.id || ""
      const lineItem = cart?.lineItems?.find((item) => item.catalogReference?.catalogItemId === productId)

      if (!lineItem) return

      const newQty = Math.max(0, (lineItem.quantity || 0) - 1)

      if (newQty === 0) {
        await remove(lineItem.id)
      } else {
        await updateQuantity(lineItem.id, newQty)
      }

      // 🔄 reload cart to sync floating cart count
      await reload()

      // update local UI quantity
      setMobileCartQuantities((prev) => ({
        ...prev,
        [productId]: newQty,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to decrease quantity"
      toast.error(message)
    }
  }

  const filteredProducts = products
    .filter((product) => {
      if (selectedRegion !== "all" && product.region !== selectedRegion) return false
      // Fixed: Compare categories case-insensitively and handle "All" properly
      if (selectedCategory !== "all" && selectedCategory !== "All") {
        if (product.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false
      }
      if (showBestsellers && !product.bestseller) return false
      if (showLimitedEdition && !product.limitedEdition) return false
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return getCurrentPrice(a) - getCurrentPrice(b)
        case "price-high":
          return getCurrentPrice(b) - getCurrentPrice(a)
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const clearAllFilters = () => {
    setSelectedRegion("all")
    setSelectedCategory("all")
    setShowBestsellers(false)
    setShowLimitedEdition(false)
    setSearchQuery("")
    setSortBy("featured")
  }

  const activeFilterCount = [
    selectedRegion !== "all" ? 1 : 0,
    selectedCategory !== "all" ? 1 : 0,
    showBestsellers ? 1 : 0,
    showLimitedEdition ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#3B2B13] font-sans">
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-start bg-black pt-5 pb-10 mt-16 md:mt-24">
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent leading-tight">
            Spices That Speak Flavor
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Discover handcrafted masalas made with love, tradition, and purity — straight from our home to your kitchen.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B] text-[#3B2B13] w-full min-h-screen py-8 sm:py-10 px-4 sm:px-6 lg:px-12">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          {/* Search and Controls */}
          <div className="flex flex-col gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
            {/* Controls Row */}
            <div className="flex flex-col gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
              {/* Unified Row: Search + Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                {/* 🔍 Search Bar (Left Side) */}
                <div className="w-full sm:w-[70%] md:w-[55%] lg:w-[45%] xl:w-[40%]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FED649]" />
                    <input
                      type="text"
                      placeholder="Search spices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 
                                 bg-[#1A1A1A] text-white 
                                 border border-gray-700 
                                 rounded-lg 
                                 placeholder-[#FED649] 
                                 focus:outline-none focus:ring-2 focus:ring-[#FED649] focus:border-transparent 
                                 text-sm sm:text-base transition-all duration-300"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 sm:py-3 bg-black border border-[#DD9627]/30 rounded-lg hover:bg-[#1A1A1A] transition-all duration-200 text-[#FED649] font-semibold text-sm"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-[#DD9627] text-black text-xs font-bold rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedRegion !== "all" ||
            selectedCategory !== "all" ||
            showBestsellers ||
            showLimitedEdition ||
            searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedRegion !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedRegion}
                  <button onClick={() => setSelectedRegion("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {showBestsellers && (
                <Badge variant="secondary" className="gap-1">
                  Bestsellers
                  <button onClick={() => setShowBestsellers(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {showLimitedEdition && (
                <Badge variant="secondary" className="gap-1">
                  Limited Edition
                  <button onClick={() => setShowLimitedEdition(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-[#DD9627] hover:text-[#B47B2B] hover:bg-[#FFF6CC]"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 lg:gap-8">
          {/* LEFT FILTER PANEL */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              {/* 🖥 DESKTOP FILTER PANEL ONLY */}
              <div className="hidden lg:block space-y-6 sm:space-y-8 lg:space-y-10">
                <div className="bg-black border border-[#DD9627]/30 rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
                  <h3 className="font-serif text-sm sm:text-base lg:text-lg font-bold mb-3 sm:mb-4 text-[#FED649]">
                    Category
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsFilterOpen(false)
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          selectedCategory === category
                            ? "bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold"
                            : "hover:bg-[#1A1A1A] text-[#FED649] hover:text-[#DD9627] font-medium"
                        }`}
                      >
                        {category === "All" ? "All Categories" : category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isFilterOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)} />

              {/* Bottom Sheet */}
              <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between rounded-t-3xl">
                  <h2 className="font-serif text-lg font-bold text-[#3B2B13]">Filters</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X className="h-6 w-6 text-[#3B2B13]" />
                  </button>
                </div>

                {/* Filter Content */}
                <div className="p-4 space-y-6">
                  {/* Categories Section */}
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#3B2B13] mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category)
                            setIsFilterOpen(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            selectedCategory === category
                              ? "bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold shadow-md"
                              : "bg-gray-50 hover:bg-gray-100 text-[#3B2B13] border border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              selectedCategory === category ? "bg-black border-black" : "border-gray-300 bg-white"
                            }`}
                          >
                            {selectedCategory === category && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">
                            {category === "All" ? "All Categories" : category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bestsellers Filter */}
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#3B2B13] mb-3">Special</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowBestsellers(!showBestsellers)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          showBestsellers
                            ? "bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold shadow-md"
                            : "bg-gray-50 hover:bg-gray-100 text-[#3B2B13] border border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            showBestsellers ? "bg-black border-black" : "border-gray-300 bg-white"
                          }`}
                        >
                          {showBestsellers && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium">✨ Bestsellers</span>
                      </button>

                      <button
                        onClick={() => setShowLimitedEdition(!showLimitedEdition)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          showLimitedEdition
                            ? "bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-semibold shadow-md"
                            : "bg-gray-50 hover:bg-gray-100 text-[#3B2B13] border border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            showLimitedEdition ? "bg-black border-black" : "border-gray-300 bg-white"
                          }`}
                        >
                          {showLimitedEdition && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium">🔥 Limited Edition</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      className="flex-1 border-gray-300 text-[#3B2B13] hover:bg-gray-50 bg-transparent"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {error && (
              <Card className="p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6 border-[#DD9627]/20 bg-[#FFF9E8]">
                <p className="text-sm lg:text-base text-[#B47B2B] font-medium">{error}</p>
              </Card>
            )}

            <div
              className={`grid gap-2 sm:gap-3 lg:gap-4 ${
                viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => {
                const currentPrice = getCurrentPrice(product)
                const productId = product._id || product.id || ""
                const selectedVariantId = selectedVariants[productId]
                const selectedVariant =
                  product.variants?.find((v) => v._id === selectedVariantId) ||
                  product.variants?.find((v) => v.variant.visible) ||
                  product.variants?.[0]
                const mobileQuantity = mobileCartQuantities[productId] || 0
                const outOfStock = !isInStock(product)

                const CardWrapper = outOfStock ? "div" : Link
                const cardProps = outOfStock ? {} : { href: `/product?id=${product.slug || productId}` }

                return (
                  <CardWrapper key={productId} {...cardProps}>
                    <Card
                      className={`group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/95 rounded-lg hover:-translate-y-0.5 border border-[#DD9627]/20 ${
                        viewMode === "list" ? "flex flex-row max-w-4xl mx-auto" : ""
                      } ${outOfStock ? "opacity-60 grayscale pointer-events-none" : ""}`}
                      onMouseEnter={() => !outOfStock && handleMouseEnter(productId)}
                      onMouseLeave={() => !outOfStock && handleMouseLeave(productId)}
                    >
                      <CardContent className="p-0 flex-1">
                        {viewMode === "list" ? (
                          <div className="flex flex-col sm:flex-row h-full">
                            <div className="w-full sm:w-48 md:w-56 lg:w-64 flex-shrink-0 relative overflow-hidden">
                              <div className="relative w-full aspect-square overflow-hidden bg-black rounded-t-lg">
                                <img
                                  src={getCurrentImage(product) || "/placeholder.svg"}
                                  alt={product.name}
                                  className={`object-cover w-full h-full transition-transform duration-500 ${
                                    !outOfStock && "group-hover:scale-105"
                                  }`}
                                />
                              </div>

                              <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                                {product.bestseller && (
                                  <Badge className="bg-[#DD9627] text-white text-xs px-2 py-0.5 rounded-full shadow-lg border-0 font-medium">
                                    ✨ Bestseller
                                  </Badge>
                                )}
                                {product.limitedEdition && (
                                  <Badge className="bg-[#B47B2B] text-white text-xs px-2 py-0.5 rounded-full shadow-lg border-0 font-medium">
                                    🔥 Limited
                                  </Badge>
                                )}
                                {isMadeToOrder(product) && (
                                  <Badge className="bg-[#FED649] text-black text-xs px-2 py-0.5 rounded-full shadow-lg border-0 font-medium">
                                    👨‍🍳 Made to Order
                                  </Badge>
                                )}
                                {outOfStock && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs px-2 py-0.5 rounded-full shadow-lg border-0 font-medium"
                                  >
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>

                              <button
                                disabled={outOfStock}
                                className={`absolute top-1.5 right-1.5 p-1.5 bg-white/95 backdrop-blur-sm rounded-full opacity-0 ${!outOfStock && "group-hover:opacity-100"} transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg disabled:opacity-0 disabled:cursor-not-allowed`}
                              >
                                <Heart className="h-3 w-3 text-gray-600 hover:text-red-500 transition-colors" />
                              </button>
                            </div>

                            <div className="flex-1 p-2.5 sm:p-3 lg:p-4 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between mb-1.5 sm:mb-2 lg:mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-serif font-semibold text-xs sm:text-sm lg:text-base text-[#3B2B13] mb-0.5 lg:mb-1 line-clamp-2 leading-tight group-hover:text-[#DD9649] transition-colors duration-200">
                                      {product.name}
                                    </h3>
                                  </div>
                                  {typeof product.rating === "number" && (
                                    <div className="flex items-center gap-0.5 bg-[#FFF6CC] px-1.5 sm:px-2 lg:px-3 py-0.5 lg:py-1 rounded-full ml-1.5 sm:ml-2 lg:ml-3 flex-shrink-0 border border-[#FED649]/40">
                                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-[#FED649] text-[#FED649]" />
                                      <span className="text-xs font-semibold text-[#B47B2B]">{product.rating}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 lg:gap-2 mb-1.5 sm:mb-2 lg:mb-3">
                                  {product.region && (
                                    <span className="text-xs text-[#B47B2B] font-semibold px-1.5 sm:px-2 lg:px-3 py-0.5 lg:py-1 rounded-full border border-[#DD9627]">
                                      {"📍 "}
                                      {product.region}
                                    </span>
                                  )}
                                  {product.category && (
                                    <span className="text-xs text-gray-600 font-medium bg-gray-50 px-1.5 sm:px-2 lg:px-3 py-0.5 lg:py-1 rounded-full">
                                      {product.category}
                                    </span>
                                  )}
                                </div>

                                {product.variants && product.variants.length > 0 && (
                                  <div className="mb-1.5 sm:mb-2 lg:mb-3 space-y-1 lg:space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-1 lg:gap-2">
                                      <span className="text-xs lg:text-sm font-medium text-gray-700">Weight:</span>
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
                                        disabled={outOfStock}
                                        className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-2 text-xs lg:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9627] focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                                      <span className="text-sm sm:text-base lg:text-lg font-bold text-[#B47B2B]">
                                        {selectedVariant?.variant.priceData.formatted.price || `₹${currentPrice}`}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {(!product.variants || product.variants.length === 0) && (
                                  <div className="mb-1.5 sm:mb-2 lg:mb-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm sm:text-base lg:text-lg font-bold text-[#B47B2B]">
                                        ₹{currentPrice}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <Button
                                disabled={outOfStock}
                                className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-bold text-xs lg:text-sm py-1.5 lg:py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg h-9 lg:h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  try {
                                    console.log("Adding to cart:", product)
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
                                    toast.success("Added to cart", {
                                      description: `${product.name}${weightText}`,
                                    })
                                  } catch (err) {
                                    const message = err instanceof Error ? err.message : "Add to cart failed"
                                    toast.error(message)
                                  }
                                }}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1.5" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="relative overflow-hidden">
                              <div className="relative w-full aspect-square overflow-hidden bg-white rounded-t-lg p-1">
                                <img
                                  src={getCurrentImage(product) || "/placeholder.svg"}
                                  alt={product.name}
                                  className={`object-contain w-full h-full transition-transform duration-500 ${
                                    !outOfStock && "group-hover:scale-105"
                                  }`}
                                />
                              </div>

                              {/* 🏷 Ribbons */}
                              <div className="absolute top-1 left-1 flex flex-col gap-0.5">
                                {product.bestseller && (
                                  <Badge className="bg-[#DD9627] text-white text-[10px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-md border-0 font-medium">
                                    ✨ Bestseller
                                  </Badge>
                                )}
                                {product.limitedEdition && (
                                  <Badge className="bg-[#B47B2B] text-white text-[10px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-md border-0 font-medium">
                                    🔥 Limited
                                  </Badge>
                                )}
                                {outOfStock && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-md border-0 font-medium"
                                  >
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>

                              <button
                                disabled={outOfStock}
                                className={`absolute top-1 right-1 p-[5px] sm:p-1 bg-white/90 backdrop-blur-sm rounded-full opacity-0 ${!outOfStock && "group-hover:opacity-100"} transition-all duration-300 hover:bg-white hover:scale-110 shadow-md disabled:opacity-0 disabled:cursor-not-allowed`}
                              >
                                <Heart className="h-[10px] w-[10px] sm:h-[10px] sm:w-[10px] text-gray-600 hover:text-red-500 transition-colors" />
                              </button>
                            </div>

                            <div className="p-1.5 sm:p-2.5 lg:p-3 flex flex-col h-[180px] sm:h-[200px] md:h-[220px] lg:h-auto">
                              {/* 🧾 Product Name + Rating */}
                              <div className="flex items-start justify-between mb-1 sm:mb-1.5 flex-shrink-0">
                                <h3 className="font-serif font-semibold text-[14px] sm:text-[13px] md:text-xs lg:text-sm text-[#3B2B13] line-clamp-2 leading-snug group-hover:text-[#DD9627] transition-colors duration-200">
                                  {product.name}
                                </h3>
                                {typeof product.rating === "number" && (
                                  <div className="flex items-center gap-0.5 bg-[#FFF6CC] px-1 py-[2px] sm:px-1 sm:py-0.5 rounded-full border border-[#FED649]/40 flex-shrink-0">
                                    <Star className="h-[10px] w-[10px] sm:h-[10px] sm:w-[10px] fill-[#FED649] text-[#FED649]" />
                                    <span className="text-[11px] sm:text-[11px] font-semibold text-[#B47B2B]">
                                      {product.rating}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* 📍 Region + Category Tags */}
                              <div className="flex flex-col gap-0.5 mb-1 sm:mb-1.5 flex-shrink-0">
                                {product.region && (
                                  <span className="text-[11px] sm:text-[11px] text-[#B47B2B] font-semibold px-1 py-[2px] rounded-full border border-[#DD9627] w-fit">
                                    📍 {product.region}
                                  </span>
                                )}
                                {product.category && (
                                  <span className="text-[11px] sm:text-[11px] text-gray-600 font-medium bg-gray-50 px-1 py-[2px] rounded-full w-fit">
                                    {product.category}
                                  </span>
                                )}
                              </div>

                              {/* ⚖ Weight + Price - Flexible section that grows */}
                              <div className="space-y-1 mb-1 sm:mb-1.5 flex-grow flex flex-col justify-end">
                                {product.variants && product.variants.length > 0 && (
                                  <>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[11px] sm:text-[11px] font-medium text-gray-700">
                                        Weight:
                                      </span>
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
                                        disabled={outOfStock}
                                        className="px-1 py-[2px] text-[11px] sm:text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#DD9627] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                                      <span className="text-[14px] sm:text-[14px] md:text-sm font-bold text-[#B47B2B]">
                                        {selectedVariant?.variant.priceData.formatted.price || `₹${currentPrice}`}
                                      </span>
                                    </div>
                                  </>
                                )}

                                {(!product.variants || product.variants.length === 0) && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[14px] sm:text-[14px] md:text-sm font-bold text-[#B47B2B]">
                                      ₹{currentPrice}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Button - Always at bottom */}
                              <div className="lg:hidden mt-auto pt-1">
                                {mobileQuantity === 0 ? (
                                  <Button
                                    disabled={outOfStock}
                                    className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-semibold text-[11px] sm:text-[11px] md:text-xs py-1.5 sm:py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg h-8 sm:h-9 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={(e) => handleMobileAddToCart(product, e)}
                                  >
                                    ADD
                                  </Button>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] rounded-md py-1.5 sm:py-2 px-2 h-8 sm:h-9">
                                    <button
                                      onClick={(e) => handleMobileDecrement(product, e)}
                                      className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-white/20 hover:bg-white/30 rounded transition-all"
                                    >
                                      <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-black" />
                                    </button>
                                    <span className="text-black font-bold text-[12px] sm:text-[12px] md:text-sm min-w-[24px] text-center">
                                      {mobileQuantity}
                                    </span>
                                    <button
                                      onClick={(e) => handleMobileIncrement(product, e)}
                                      className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-white/20 hover:bg-white/30 rounded transition-all"
                                    >
                                      <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-black" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Desktop: Show regular button */}
                              <div className="hidden lg:block">
                                <Button
                                  disabled={outOfStock}
                                  className="w-full bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:brightness-95 text-black font-semibold text-[10px] sm:text-[11px] md:text-xs py-1.5 sm:py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg h-8 sm:h-9 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </CardWrapper>
                )
              })}
            </div>

            {filteredProducts.length === 0 && !isLoading && (
              <Card className="text-center py-12 lg:py-16 border-dashed border-2 border-[#DD9627]/20 bg-[#FFF9E8]">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-[#FED649]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-[#B47B2B]" />
                  </div>
                  <h3 className="font-serif text-lg lg:text-xl font-bold mb-2 text-[#3B2B13]">No products found</h3>
                  <p className="text-[#6B4A0F]/80 mb-4 lg:mb-6 text-sm lg:text-base">
                    We couldn't find any products matching your current filters. Try adjusting your search criteria.
                  </p>
                  <Button onClick={clearAllFilters} className="bg-[#DD9627] hover:bg-[#B47B2B] text-white">
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {totalCartItems > 0 && (
        <Link href="/cart" className="lg:hidden">
          <button
            className="
        fixed bottom-4 left-1/2 -translate-x-1/2
        z-50
        flex flex-col items-center justify-center
        bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B]
        hover:brightness-95
        text-black font-semibold
        py-2.5 px-6
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300
        active:scale-95
      "
            style={{ minWidth: "160px" }}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm font-semibold">View Cart</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-[#3B2B13]/80 mt-[2px]">{totalCartItems} items</span>
          </button>
        </Link>
      )}
    </div>
  )
}
