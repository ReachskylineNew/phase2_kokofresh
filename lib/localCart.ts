// Local cart implementation as a fallback when Wix Stores API is not available
export interface CartItem {
  productId: string
  quantity: number
  name: string
  price: number
  image: string
}

export interface LocalCart {
  id: string
  items: CartItem[]
  total: number
  createdAt: string
}

const CART_STORAGE_KEY = "local_cart"

export function getLocalCart(): LocalCart {
  if (typeof window === "undefined") {
    return {
      id: "",
      items: [],
      total: 0,
      createdAt: new Date().toISOString()
    }
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error loading local cart:", error)
  }

  return {
    id: `local_${Date.now()}`,
    items: [],
    total: 0,
    createdAt: new Date().toISOString()
  }
}

export function saveLocalCart(cart: LocalCart): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error("Error saving local cart:", error)
  }
}

export function addToLocalCart(productId: string, quantity: number, product: { name: string; price: number; image: string }): LocalCart {
  const cart = getLocalCart()
  
  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(item => item.productId === productId)
  
  if (existingItemIndex >= 0) {
    // Update existing item
    cart.items[existingItemIndex].quantity += quantity
  } else {
    // Add new item
    cart.items.push({
      productId,
      quantity,
      name: product.name,
      price: product.price,
      image: product.image
    })
  }
  
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  saveLocalCart(cart)
  return cart
}

export function removeFromLocalCart(productId: string): LocalCart {
  const cart = getLocalCart()
  cart.items = cart.items.filter(item => item.productId !== productId)
  
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  saveLocalCart(cart)
  return cart
}

export function updateLocalCartItemQuantity(productId: string, quantity: number): LocalCart {
  const cart = getLocalCart()
  const item = cart.items.find(item => item.productId === productId)
  
  if (item) {
    if (quantity <= 0) {
      return removeFromLocalCart(productId)
    }
    item.quantity = quantity
  }
  
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  saveLocalCart(cart)
  return cart
}

export function clearLocalCart(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CART_STORAGE_KEY)
}
