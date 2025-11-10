"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUser } from "./user-context";
import { useCart } from "./cart-context";
import { usePersistentWishlist } from "../hooks/use-persistent-wishlist";

type WishlistItem = {
  _id: string;
  contactId: string;
  productId: string;
  productName: string;
  price: {
    amount: string;
    formattedAmount: string;
  };
  image: {
    url: string;
  };
  quantity: number;
  catalogReference: {
    appId: string;
    catalogItemId: string;
    options?: any;
  };
  addedDate: string;
};

type WishlistContextType = {
  wishlist: WishlistItem[];
  loading: boolean;
  addToWishlist: (item: any) => Promise<boolean>;
  removeFromWishlist: (itemId: string) => Promise<boolean>;
  moveToCart: (item: WishlistItem) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  reload: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { contact } = useUser();
  const { add: addToCart } = useCart();
  
  // Use persistent wishlist hook for localStorage-based storage
  const persistentWishlist = usePersistentWishlist();
  
  // Fallback to API-based storage if needed (for future use)
  const [apiWishlist, setApiWishlist] = useState<WishlistItem[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [useApiStorage, setUseApiStorage] = useState(false);

  // Load wishlist when user contact is available (API fallback)
  useEffect(() => {
    if (contact?._id && useApiStorage) {
      loadWishlist();
    } else if (!useApiStorage) {
      setApiLoading(false);
    }
  }, [contact?._id, useApiStorage]);

  const loadWishlist = async () => {
    if (!contact?._id) return;

    setApiLoading(true);
    try {
      const res = await fetch(`/api/wishlist?contactId=${contact._id}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch wishlist: ${res.statusText}`);
      }

      const data = await res.json();
      setApiWishlist(data.wishlist || []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setApiWishlist([]);
    } finally {
      setApiLoading(false);
    }
  };

  const addToWishlist = async (cartItem: any): Promise<boolean> => {
    if (!contact?._id) {
      console.error("No user contact available");
      return false;
    }

    // Use persistent storage (localStorage) for now
    return persistentWishlist.addToWishlist(cartItem);
  };

  const removeFromWishlist = async (itemId: string): Promise<boolean> => {
    if (!contact?._id) {
      console.error("No user contact available");
      return false;
    }

    // Use persistent storage (localStorage) for now
    return persistentWishlist.removeFromWishlist(itemId);
  };

  const moveToCart = async (item: WishlistItem): Promise<boolean> => {
    try {
      // Add to cart first
      const success = await addToCart(
        item.catalogReference.catalogItemId,
        item.quantity,
        undefined,
        item.catalogReference.options?.variantId
      );

      if (success) {
        // Remove from wishlist after successful cart addition
        await removeFromWishlist(item._id);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to move to cart:", err);
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    // Use persistent storage for checking
    return persistentWishlist.isInWishlist(productId);
  };

  const reload = async () => {
    // Use persistent storage reload
    persistentWishlist.reload();
  };

  // Use persistent wishlist data
  const wishlist = persistentWishlist.wishlist;
  const loading = persistentWishlist.loading;

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlist, 
        loading, 
        addToWishlist, 
        removeFromWishlist, 
        moveToCart, 
        isInWishlist,
        reload 
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
