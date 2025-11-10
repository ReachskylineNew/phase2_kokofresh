"use client"

import { useEffect, useState } from "react"
import { Toaster } from "sonner"

export function CustomToaster() {
  const [position, setPosition] = useState<"bottom-center" | "bottom-right">("bottom-right")

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth < 640) {
        setPosition("bottom-center")
      } else {
        setPosition("bottom-right")
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    return () => window.removeEventListener("resize", updatePosition)
  }, [])

  return <Toaster position={position} richColors closeButton />
}
