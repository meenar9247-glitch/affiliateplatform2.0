import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create context
const WishlistContext = createContext();

// Custom hook
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Provider component
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        setWishlist(parsed);
        setWishlistCount(parsed.length);
      } catch (error) {
        console.error('Failed to parse wishlist:', error);
      }
    }
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  // Add to wishlist
  const addToWishlist = useCallback((product) => {
    setWishlist(prev => {
      // Check if already exists
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...product, addedAt: new Date().toISOString() }];
    });
  }, []);

  // Remove from wishlist
  const removeFromWishlist = useCallback((productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, { ...product, addedAt: new Date().toISOString() }];
      }
    });
  }, []);

  // Check if in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  // Clear wishlist
  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  // Get wishlist items by category
  const getItemsByCategory = useCallback((category) => {
    return wishlist.filter(item => item.category === category);
  }, [wishlist]);

  // Get recent items
  const getRecentItems = useCallback((limit = 5) => {
    return [...wishlist]
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, limit);
  }, [wishlist]);

  // Move to cart (if you have cart context)
  const moveToCart = useCallback((productId, addToCart) => {
    const product = wishlist.find(item => item.id === productId);
    if (product && addToCart) {
      addToCart(product);
      removeFromWishlist(productId);
    }
  }, [wishlist, removeFromWishlist]);

  const value = {
    wishlist,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getItemsByCategory,
    getRecentItems,
    moveToCart,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
