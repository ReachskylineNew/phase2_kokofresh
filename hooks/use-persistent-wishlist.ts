"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/context/user-context';

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

const STORAGE_KEY = 'flavourz_wishlist_storage';

export function usePersistentWishlist() {
  const { contact } = useUser();
  const [localWishlist, setLocalWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from localStorage when contact changes
  useEffect(() => {
    if (!contact?._id) {
      setLocalWishlist([]);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allItems: WishlistItem[] = stored ? JSON.parse(stored) : [];
      const userItems = allItems.filter(item => item.contactId === contact._id);
      setLocalWishlist(userItems);
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      setLocalWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [contact?._id]);

  // Add item to wishlist
  const addToWishlist = (cartItem: any): boolean => {
    if (!contact?._id) {
      console.error("No user contact available");
      return false;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allItems: WishlistItem[] = stored ? JSON.parse(stored) : [];
      
      // Check if item already exists
      const existingItem = allItems.find(
        item => item.contactId === contact._id && 
        item.productId === (cartItem.catalogReference?.catalogItemId || cartItem.id)
      );
      
      if (existingItem) {
        console.log("Item already in wishlist");
        return true; // Consider it successful if already exists
      }

      const newItem: WishlistItem = {
        _id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        contactId: contact._id,
        productId: cartItem.catalogReference?.catalogItemId || cartItem.id,
        productName: cartItem.productName?.original || cartItem.name || "Product",
        price: cartItem.price || { amount: "0.00", formattedAmount: "₹0.00" },
        image: cartItem.image || { url: "/placeholder.svg" },
        quantity: cartItem.quantity || 1,
        catalogReference: cartItem.catalogReference || {
          appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
          catalogItemId: cartItem.id
        },
        addedDate: new Date().toISOString()
      };

      allItems.push(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allItems));
      
      // Update local state
      setLocalWishlist(prev => [...prev, newItem]);
      
      return true;
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      return false;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = (itemId: string): boolean => {
    if (!contact?._id) {
      console.error("No user contact available");
      return false;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allItems: WishlistItem[] = stored ? JSON.parse(stored) : [];
      
      const filteredItems = allItems.filter(
        item => !(item._id === itemId && item.contactId === contact._id)
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems));
      
      // Update local state
      setLocalWishlist(prev => prev.filter(item => item._id !== itemId));
      
      return filteredItems.length < allItems.length;
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      return false;
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return localWishlist.some(item => 
      item.productId === productId || 
      item.catalogReference.catalogItemId === productId
    );
  };

  // Reload wishlist (useful when switching users)
  const reload = () => {
    if (!contact?._id) {
      setLocalWishlist([]);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allItems: WishlistItem[] = stored ? JSON.parse(stored) : [];
      const userItems = allItems.filter(item => item.contactId === contact._id);
      setLocalWishlist(userItems);
    } catch (error) {
      console.error('Error reloading wishlist:', error);
      setLocalWishlist([]);
    }
  };

  return {
    wishlist: localWishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    reload
  };
}
