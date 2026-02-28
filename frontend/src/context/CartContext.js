import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create context
const CartContext = createContext();

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    calculateTotals();
  }, [cart]);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const items = cart.reduce((acc, item) => acc + item.quantity, 0);
    const price = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotalItems(items);
    setTotalPrice(price);
  }, [cart]);

  // Add to cart
  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  }, [removeFromCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Add to wishlist
  const addToWishlist = useCallback((product) => {
    setWishlist(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  // Remove from wishlist
  const removeFromWishlist = useCallback((productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  }, []);

  // Move to cart
  const moveToCart = useCallback((productId) => {
    const product = wishlist.find(item => item.id === productId);
    if (product) {
      addToCart(product);
      removeFromWishlist(productId);
    }
  }, [wishlist, addToCart, removeFromWishlist]);

  // Check if in cart
  const isInCart = useCallback((productId) => {
    return cart.some(item => item.id === productId);
  }, [cart]);

  // Check if in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  const value = {
    cart,
    wishlist,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInCart,
    isInWishlist,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
