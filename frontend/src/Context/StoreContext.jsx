import React, { createContext, useState, useEffect } from "react";
import { prod_list as staticProducts } from "../assets/assets";

export const StoreContext = createContext({ prod_list: [] });

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : {};
  });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:8000/api';

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch products on app start
  useEffect(() => {
    fetchProducts();
  }, []);

  // Check if user is logged in on app start and sync cart
  useEffect(() => {
    if (token) {
      fetchUserProfile();
      syncCartWithBackend();
    }
  }, [token]);

  // Fetch all products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products?limit=1000`);
      const data = await response.json();
      
      if (data.success) {
        // Merge database products with static products
        // Database products (with proper images) come first
        const dbProducts = data.data.products.filter(p => p.image && !p.image.includes('placeholder'));
        setProducts([...dbProducts, ...staticProducts]);
      } else {
        // Fallback to static products if backend fails
        setProducts(staticProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to static products on error
      setProducts(staticProducts);
    } finally {
      setLoading(false);
    }
  };

  // Search products from backend and static list
  const searchProducts = async (query) => {
    try {
      if (!query || !query.trim()) return [];
      
      const searchTerm = query.toLowerCase();
      
      // Search in static products
      const staticResults = staticProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
      
      // Search in database
      const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      let dbResults = [];
      if (data.success) {
        // Only include db products with proper images
        dbResults = data.data.products.filter(p => p.image && !p.image.includes('placeholder'));
      }
      
      // Merge results (db products first, then static)
      return [...dbResults, ...staticResults];
    } catch (error) {
      console.error('Error searching products:', error);
      // Fallback to searching static products only
      const searchTerm = query.toLowerCase();
      return staticProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }
  };

  // Get single product by ID
  const getProductById = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, product: data.data.product };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, message: 'Failed to fetch product' };
    }
  };

  // Get similar products by category
  const getSimilarProducts = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/similar`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, products: data.data.similarProducts, category: data.data.category };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return { success: false, message: 'Failed to fetch similar products' };
    }
  };

  // Get products by category
  const getProductsByCategory = async (category, page = 1, limit = 20) => {
    try {
      const response = await fetch(`${API_URL}/products/category/${category}?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return { 
          success: true, 
          products: data.data.products, 
          pagination: data.data.pagination 
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { success: false, message: 'Failed to fetch products' };
    }
  };

  // Get featured products
  const getFeaturedProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/featured`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, products: data.data.products };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return { success: false, message: 'Failed to fetch featured products' };
    }
  };

  // API call helper with automatic token refresh
  const fetchWithAuth = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If 401 Unauthorized, try to refresh token
      if (response.status === 401) {
        const refreshResult = await refreshAccessToken();
        if (refreshResult.success) {
          // Retry the original request with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${refreshResult.token}`,
              'Content-Type': 'application/json'
            }
          });
          return retryResponse;
        } else {
          // Refresh failed, logout user
          logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  // API call to get user profile
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        // Token might be expired
        logout();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setToken(data.data.token);
        setRefreshToken(data.data.refreshToken);
        setUser(data.data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  // Register function
  const register = async (name, email, password, phone = '') => {
    try {
      console.log('Attempting to register with API URL:', `${API_URL}/users/register`);
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, phone })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        // Registration successful - user is auto-logged in
        // Store tokens and user data
        if (data.data.token) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          setToken(data.data.token);
          setRefreshToken(data.data.refreshToken);
          setUser(data.data.user);
        }
        return { 
          success: true,
          user: data.data.user
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Registration failed - Connection error' };
    }
  };



  // Logout function
  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${API_URL}/users/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('cartItems');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setCartItems({});
    }
  };

  // ============= CART FUNCTIONS =============

  // Sync cart with backend
  const syncCartWithBackend = async () => {
    if (!user && !token) return;
    
    try {
      const response = await fetchWithAuth(`${API_URL}/cart`);
      const data = await response.json();
      
      if (data.success && data.data.cart) {
        // Convert backend cart format to frontend format
        const backendCart = {};
        data.data.cart.items.forEach(item => {
          backendCart[item.product._id] = item.quantity;
        });
        
        // Merge with local cart (local cart takes precedence)
        const mergedCart = { ...backendCart, ...cartItems };
        setCartItems(mergedCart);
        
        // Update backend with merged cart if there were local items
        if (Object.keys(cartItems).length > 0) {
          await syncLocalCartToBackend(mergedCart);
        }
      }
    } catch (error) {
      console.error('Cart sync error:', error);
    }
  };

  // Sync local cart to backend
  const syncLocalCartToBackend = async (cart = cartItems) => {
    if (!token) return;
    
    try {
      // Add each item to backend cart
      for (const [productId, quantity] of Object.entries(cart)) {
        if (quantity > 0) {
          await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
          });
        }
      }
    } catch (error) {
      console.error('Sync local cart to backend error:', error);
    }
  };

  // Add item to cart
  const addToCart = async (itemId) => {
    const newCart = {
      ...cartItems,
      [itemId]: (cartItems[itemId] || 0) + 1
    };
    setCartItems(newCart);

    // Sync with backend if logged in
    if (token) {
      try {
        await fetchWithAuth(`${API_URL}/cart/add`, {
          method: 'POST',
          body: JSON.stringify({ productId: itemId, quantity: 1 })
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId, removeAll = false) => {
    const newCart = { ...cartItems };
    if (removeAll || newCart[itemId] === 1) {
      delete newCart[itemId];
      
      // Remove from backend if logged in
      if (token) {
        try {
          await fetchWithAuth(`${API_URL}/cart/remove/${itemId}`, {
            method: 'DELETE'
          });
        } catch (error) {
          console.error('Error removing from cart:', error);
        }
      }
    } else if (newCart[itemId] > 1) {
      newCart[itemId] -= 1;
      
      // Update backend if logged in
      if (token) {
        try {
          await fetchWithAuth(`${API_URL}/cart/update`, {
            method: 'PUT',
            body: JSON.stringify({ productId: itemId, quantity: newCart[itemId] })
          });
        } catch (error) {
          console.error('Error updating cart:', error);
        }
      }
    }
    setCartItems(newCart);
  };

  // Clear cart (useful after order placement)
  const clearCart = async () => {
    setCartItems({});
    
    if (token) {
      try {
        await fetchWithAuth(`${API_URL}/cart/clear`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  // Get total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = products.find((product) => product._id === itemId);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId];
        }
      }
    }
    return totalAmount;
  };

  // Get total items count
  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const itemId in cartItems) {
      totalItems += cartItems[itemId];
    }
    return totalItems;
  };

  // Place order function
  const placeOrder = async (orderData) => {
    try {
      console.log('=== PLACE ORDER DEBUG ===');
      console.log('Cart items:', cartItems);
      console.log('Cart items keys:', Object.keys(cartItems));
      console.log('Total cart amount:', getTotalCartAmount());
      
      // Check if cart has items
      if (Object.keys(cartItems).length === 0 || getTotalCartAmount() === 0) {
        console.log('Cart is empty - no items or zero amount');
        return { success: false, message: 'Cart is empty' };
      }

      // Prepare order items from cart
      const orderItems = Object.keys(cartItems).map(itemId => {
        console.log(`Processing item ID: ${itemId}`);
        const product = products.find(p => p._id === itemId);
        console.log(`Found product:`, product);
        if (!product) {
          console.warn(`Product not found for ID: ${itemId}`);
          return null;
        }
        const orderItem = {
          productId: itemId,
          quantity: cartItems[itemId],
          price: product.price
        };
        console.log(`Created order item:`, orderItem);
        return orderItem;
      }).filter(item => item !== null);

      console.log('Final order items:', orderItems);

      if (orderItems.length === 0) {
        console.log('No valid order items found');
        return { success: false, message: 'No valid items in cart' };
      }

      // Calculate totals
      const subtotal = getTotalCartAmount();
      const deliveryFee = subtotal > 500 ? 0 : 40;
      const platformFee = 5;
      const gst = Math.round(subtotal * 0.05);
      const total = subtotal + deliveryFee + platformFee + gst;

      const fullOrderData = {
        items: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        totalAmount: total,
        notes: orderData.notes || ''
      };

      console.log('Placing order with data:', fullOrderData);

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fullOrderData)
      });

      const data = await response.json();
      console.log('Order response:', data);
      
      if (data.success) {
        // Clear cart after successful order
        await clearCart();
        // Unwrap order object from data
        const order = data.data?.order || data.data;
        return { success: true, order };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Place order error:', error);
      return { success: false, message: 'Failed to place order' };
    }
  };

  // Get user orders function
  const getUserOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const orders = data.data?.orders || [];
        return { success: true, orders };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get orders error:', error);
      return { success: false, message: 'Failed to fetch orders' };
    }
  };

  // Cancel order function
  const cancelOrder = async (orderId, reason = '') => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, order: data.data.order };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      return { success: false, message: 'Failed to cancel order' };
    }
  };

  // Track order function
  const trackOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/track`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, tracking: data.data.tracking };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Track order error:', error);
      return { success: false, message: 'Failed to track order' };
    }
  };

  // Get single order by ID
  const getOrderById = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, order: data.data.order };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get order error:', error);
      return { success: false, message: 'Failed to fetch order' };
    }
  };

  // Update order status (admin only)
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus: status })
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, order: data.data.order };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update order status error:', error);
      return { success: false, message: 'Failed to update order status' };
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        logout();
        return { success: false };
      }

      const response = await fetch(`${API_URL}/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setToken(data.data.token);
        setRefreshToken(data.data.refreshToken);
        return { success: true, token: data.data.token };
      } else {
        logout();
        return { success: false };
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
      return { success: false };
    }
  };

  // Update user profile
  const updateUserProfile = async (name, phone) => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  // Get user addresses
  const getUserAddresses = async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, addresses: data.data.user.addresses || [] };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get addresses error:', error);
      return { success: false, message: 'Failed to fetch addresses' };
    }
  };

  // Add new address
  const addAddress = async (addressData) => {
    try {
      const response = await fetch(`${API_URL}/users/address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update user object with new addresses
        await fetchUserProfile();
        return { success: true, addresses: data.addresses };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Add address error:', error);
      return { success: false, message: 'Failed to add address' };
    }
  };

  // Update existing address
  const updateAddress = async (addressId, addressData) => {
    try {
      const response = await fetch(`${API_URL}/users/address/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update user object with modified addresses
        await fetchUserProfile();
        return { success: true, addresses: data.data.addresses };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update address error:', error);
      return { success: false, message: 'Failed to update address' };
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      const response = await fetch(`${API_URL}/users/address/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Update user object with remaining addresses
        await fetchUserProfile();
        return { success: true, addresses: data.data.addresses };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Delete address error:', error);
      return { success: false, message: 'Failed to delete address' };
    }
  };

  // ============= ADMIN FUNCTIONS =============

  // Get all products for admin (includes inactive)
  const getAdminProducts = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_URL}/products/admin/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, products: data.data.products, pagination: data.data.pagination };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get admin products error:', error);
      return { success: false, message: 'Failed to fetch products' };
    }
  };

  // Create new product (admin)
  const createProduct = async (productData) => {
    try {
      const response = await fetch(`${API_URL}/products/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, product: data.data.product };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Create product error:', error);
      return { success: false, message: 'Failed to create product' };
    }
  };

  // Update product (admin)
  const updateProduct = async (productId, productData) => {
    try {
      const response = await fetch(`${API_URL}/products/admin/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, product: data.data.product };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update product error:', error);
      return { success: false, message: 'Failed to update product' };
    }
  };

  // Delete product (admin - soft delete)
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/products/admin/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Delete product error:', error);
      return { success: false, message: 'Failed to delete product' };
    }
  };

  // ============= CATEGORY & SUBCATEGORY PUBLIC FUNCTIONS =============

  // Get all active categories (public)
  const getCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, categories: data.data.categories };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get categories error:', error);
      return { success: false, message: 'Failed to fetch categories' };
    }
  };

  // Get single category by ID (public)
  const getCategoryById = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, category: data.data.category };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get category error:', error);
      return { success: false, message: 'Failed to fetch category' };
    }
  };

  // Get all active subcategories (public)
  const getSubcategories = async () => {
    try {
      const response = await fetch(`${API_URL}/subcategories`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, subcategories: data.data.subcategories };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get subcategories error:', error);
      return { success: false, message: 'Failed to fetch subcategories' };
    }
  };

  // Get subcategories by category (public)
  const getSubcategoriesByCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/subcategories/category/${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, subcategories: data.data.subcategories };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get subcategories by category error:', error);
      return { success: false, message: 'Failed to fetch subcategories' };
    }
  };

  // Get all categories for admin (includes inactive)
  const getAdminCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, categories: data.data.categories };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get admin categories error:', error);
      return { success: false, message: 'Failed to fetch categories' };
    }
  };

  // Create new category (admin)
  const createCategory = async (categoryData) => {
    try {
      const response = await fetch(`${API_URL}/categories/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, category: data.data.category };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Create category error:', error);
      return { success: false, message: 'Failed to create category' };
    }
  };

  // Update category (admin)
  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await fetch(`${API_URL}/categories/admin/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, category: data.data.category };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update category error:', error);
      return { success: false, message: 'Failed to update category' };
    }
  };

  // Delete category (admin - soft delete)
  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/categories/admin/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Delete category error:', error);
      return { success: false, message: 'Failed to delete category' };
    }
  };

  // Get all subcategories for admin
  const getAdminSubcategories = async () => {
    try {
      const response = await fetch(`${API_URL}/subcategories/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, subcategories: data.data.subcategories };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get admin subcategories error:', error);
      return { success: false, message: 'Failed to fetch subcategories' };
    }
  };

  // Create new subcategory (admin)
  const createSubcategory = async (subcategoryData) => {
    try {
      const response = await fetch(`${API_URL}/subcategories/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subcategoryData)
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, subcategory: data.data.subcategory };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Create subcategory error:', error);
      return { success: false, message: 'Failed to create subcategory' };
    }
  };

  // Update subcategory (admin)
  const updateSubcategory = async (subcategoryId, subcategoryData) => {
    try {
      const response = await fetch(`${API_URL}/subcategories/admin/${subcategoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subcategoryData)
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, subcategory: data.data.subcategory };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update subcategory error:', error);
      return { success: false, message: 'Failed to update subcategory' };
    }
  };

  // Delete subcategory (admin - soft delete)
  const deleteSubcategory = async (subcategoryId) => {
    try {
      const response = await fetch(`${API_URL}/subcategories/admin/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Delete subcategory error:', error);
      return { success: false, message: 'Failed to delete subcategory' };
    }
  };

  const contextValue = {
    prod_list: products,
    products,
    loading,
    fetchProducts,
    searchProducts,
    getProductById,
    getSimilarProducts,
    getProductsByCategory,
    getFeaturedProducts,
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    getTotalCartItems,
    user,
    token,
    refreshToken,
    login,
    register,
    logout,
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    trackOrder,
    updateOrderStatus,
    refreshAccessToken,
    updateUserProfile,
    getUserAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    // Category & Subcategory public functions
    getCategories,
    getCategoryById,
    getSubcategories,
    getSubcategoriesByCategory,
    // Admin functions
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAdminSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    API_URL,
    searchQuery,
    setSearchQuery
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;