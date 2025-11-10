// Persistent mock storage for wishlist functionality
// This is used when Wix Data collection doesn't exist
// Uses localStorage for persistence across sessions

type MockWishlistItem = {
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

// Persistent storage using localStorage (survives browser sessions)
const STORAGE_KEY = 'flavourz_wishlist_storage';

// Get stored data from localStorage
const getStoredData = (): MockWishlistItem[] => {
  if (typeof window === 'undefined') return []; // Server-side rendering
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading wishlist from localStorage:', error);
    return [];
  }
};

// Save data to localStorage
const saveStoredData = (data: MockWishlistItem[]) => {
  if (typeof window === 'undefined') return; // Server-side rendering
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
};

// Initialize with stored data
let mockWishlistStorage: MockWishlistItem[] = getStoredData();

export const mockWishlistAPI = {
  // Get wishlist items for a contact
  getWishlist: (contactId: string): MockWishlistItem[] => {
    // Reload from localStorage to get latest data
    mockWishlistStorage = getStoredData();
    return mockWishlistStorage.filter(item => item.contactId === contactId);
  },

  // Add item to wishlist
  addToWishlist: (item: Omit<MockWishlistItem, '_id' | 'addedDate'>): MockWishlistItem => {
    // Reload from localStorage to get latest data
    mockWishlistStorage = getStoredData();
    
    const newItem: MockWishlistItem = {
      ...item,
      _id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedDate: new Date().toISOString()
    };
    
    mockWishlistStorage.push(newItem);
    saveStoredData(mockWishlistStorage);
    return newItem;
  },

  // Remove item from wishlist
  removeFromWishlist: (contactId: string, itemId: string): boolean => {
    // Reload from localStorage to get latest data
    mockWishlistStorage = getStoredData();
    
    const initialLength = mockWishlistStorage.length;
    mockWishlistStorage = mockWishlistStorage.filter(
      item => !(item._id === itemId && item.contactId === contactId)
    );
    
    const removed = mockWishlistStorage.length < initialLength;
    if (removed) {
      saveStoredData(mockWishlistStorage);
    }
    return removed;
  },

  // Check if item exists in wishlist
  itemExists: (contactId: string, productId: string): boolean => {
    // Reload from localStorage to get latest data
    mockWishlistStorage = getStoredData();
    
    return mockWishlistStorage.some(
      item => item.contactId === contactId && item.productId === productId
    );
  },

  // Get storage stats (for debugging)
  getStats: () => {
    mockWishlistStorage = getStoredData();
    return {
      totalItems: mockWishlistStorage.length,
      uniqueContacts: new Set(mockWishlistStorage.map(item => item.contactId)).size,
      allItems: mockWishlistStorage
    };
  },

  // Clear all data (for testing)
  clearAll: () => {
    mockWishlistStorage = [];
    saveStoredData(mockWishlistStorage);
  },

  // Sync data from localStorage (useful for client-side)
  syncFromStorage: () => {
    mockWishlistStorage = getStoredData();
    return mockWishlistStorage;
  }
};
