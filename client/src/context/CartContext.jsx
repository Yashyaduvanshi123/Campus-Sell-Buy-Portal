import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const STORAGE_KEY = 'campus_marketplace_cart';

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart items from server (or localStorage for guests)
  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        // First check if there were guest items to sync
        const guestSaved = localStorage.getItem(STORAGE_KEY);
        if (guestSaved) {
          try {
            const guestItems = JSON.parse(guestSaved);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              await Promise.all(
                guestItems.map(item => api.post(`/cart/${item.id}`).catch(() => null))
              );
              localStorage.removeItem(STORAGE_KEY);
            }
          } catch (e) {
            console.error('Error migrating guest cart:', e);
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        const res = await api.get('/cart');
        if (res.data?.success) {
          setCart(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load cart from server:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest mode
      try {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          setCart(JSON.parse(localData));
        } else {
          setCart([]);
        }
      } catch (e) {
        setCart([]);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Set of product IDs in cart for O(1) membership check
  const cartIds = useMemo(() => {
    return new Set(cart.map((item) => parseInt(item.id, 10)));
  }, [cart]);

  const isInCart = useCallback((productId) => {
    if (!productId) return false;
    return cartIds.has(parseInt(productId, 10));
  }, [cartIds]);

  // Add item to cart
  const addToCart = async (product) => {
    if (!product || !product.id) return { success: false };

    const pid = parseInt(product.id, 10);

    // Rule: Sold items cannot be added
    if (product.status === 'sold') {
      toast.error('This item has already been marked as sold.');
      return { success: false, reason: 'sold' };
    }

    // Rule: Seller cannot add their own item
    if (user && (user.id === product.seller_id || user.id === product.seller?.id)) {
      toast.error('You cannot add your own listed product to your cart.');
      return { success: false, reason: 'self_item' };
    }

    // Rule: Prevent duplicate additions (1-of-1 second hand item)
    if (isInCart(pid)) {
      toast.error('This product is already in your cart (Max quantity: 1).');
      return { success: false, reason: 'duplicate' };
    }

    const cartItem = {
      id: pid,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      product_condition: product.product_condition,
      campus: product.campus || product.seller_campus || 'Main Campus',
      status: product.status || 'active',
      is_available: product.status === 'active',
      seller_id: product.seller_id || product.seller?.id,
      seller_name: product.seller_name || product.seller?.full_name || 'Campus Student',
      seller_phone: product.seller_phone || product.seller?.phone || '',
      allow_whatsapp: product.allow_whatsapp,
      primary_image: product.primary_image || (product.images && product.images[0]?.image_url) || '',
      category_name: product.category_name || product.category?.name || 'Item',
      added_at: new Date().toISOString()
    };

    if (isAuthenticated) {
      try {
        const res = await api.post(`/cart/${pid}`);
        if (res.data.success) {
          setCart((prev) => [cartItem, ...prev]);
          toast.success(`"${product.title}" added to cart!`);
          return { success: true };
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to add item to cart.';
        toast.error(msg);
        return { success: false, message: msg };
      }
    } else {
      // Guest addition to local storage
      const nextCart = [cartItem, ...cart];
      setCart(nextCart);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCart));
      toast.success(`"${product.title}" added to cart!`);
      return { success: true };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    const pid = parseInt(productId, 10);

    if (isAuthenticated) {
      try {
        await api.delete(`/cart/${pid}`);
        setCart((prev) => prev.filter((item) => parseInt(item.id, 10) !== pid));
        toast.success('Item removed from cart.');
        return true;
      } catch (err) {
        toast.error('Failed to remove item.');
        return false;
      }
    } else {
      const nextCart = cart.filter((item) => parseInt(item.id, 10) !== pid);
      setCart(nextCart);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCart));
      toast.success('Item removed from cart.');
      return true;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
        setCart([]);
        toast.success('Cart cleared.');
      } catch (err) {
        toast.error('Failed to clear cart.');
      }
    } else {
      setCart([]);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Cart cleared.');
    }
  };

  // Proceed to Contact Seller / Confirm Interest checkout inquiry flow
  const checkoutInquiry = async (customMessage, selectedProductIds) => {
    if (!isAuthenticated) {
      toast.error('Please login to confirm interest and contact sellers.');
      return { success: false, requireLogin: true };
    }

    try {
      setLoading(true);
      const res = await api.post('/cart/checkout-inquiry', {
        custom_message: customMessage,
        selected_product_ids: selectedProductIds
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Interest confirmed! Inquiries sent to sellers.');
        await fetchCart();
        return { success: true, contacted: res.data.contacted };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit cart inquiry.';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Summary calculations
  const summary = useMemo(() => {
    let subtotal = 0;
    let availableCount = 0;
    let unavailableCount = 0;

    cart.forEach((item) => {
      if (item.status === 'active' || item.is_available) {
        subtotal += parseFloat(item.price || 0);
        availableCount += 1;
      } else {
        unavailableCount += 1;
      }
    });

    return {
      itemCount: cart.length,
      availableCount,
      unavailableCount,
      subtotal,
      total: subtotal
    };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.length,
        cartIds,
        isInCart,
        addToCart,
        removeFromCart,
        clearCart,
        checkoutInquiry,
        fetchCart,
        summary,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
