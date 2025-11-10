"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function ProductSlugRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Extract the slug from /product/:slug
    const slug = pathname.split("/product/")[1]
    if (slug) {
      // Redirect to the ?id= version
      router.replace(`/product?id=${slug}`)
    } else {
      router.replace("/shop")
    }
  }, [pathname, router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      <p>Redirecting to product...</p>
    </div>
  )
}
