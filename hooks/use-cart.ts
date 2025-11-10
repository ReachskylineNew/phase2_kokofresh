import { useCart as useCartContext } from "../context/cart-context";

export function useCart() {
  return useCartContext();
}
