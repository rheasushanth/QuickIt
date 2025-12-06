import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { 
      shippingAddress, 
      paymentMethod = 'cod',
      notes,
      items: clientItems = []
    } = req.body;
    
    // Prefer client-provided items if available; otherwise fall back to server cart
    let items = [];
    let subtotal = 0;

    if (Array.isArray(clientItems) && clientItems.length > 0) {
      // Map client items (productId, quantity, price) into order items
      const validClientItems = clientItems.filter(i => i.productId);
      const productCustomIds = validClientItems.map(i => i.productId);
      const products = await Product.find({ customId: { $in: productCustomIds } });
      const productMap = new Map(products.map(p => [p.customId, p]));

      for (const ci of validClientItems) {
        const prod = productMap.get(ci.productId);
        if (!prod) {
          console.log(`Product not found for customId: ${ci.productId}`);
          continue;
        }
        // Optional stock validation
        if (prod.stock < ci.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${prod.name}. Only ${prod.stock} available.`
          });
        }
        items.push({
          product: prod._id,
          name: prod.name,
          image: prod.image,
          price: ci.price,
          quantity: ci.quantity,
          category: prod.category
        });
        subtotal += ci.price * ci.quantity;
      }
    } else {
      // Get user's cart from DB
      const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }
      // Validate and map cart items
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.product.name}. Only ${item.product.stock} available.`
          });
        }
      }
      items = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image,
        price: item.price,
        quantity: item.quantity,
        category: item.product.category
      }));
      subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // If we still don't have items (e.g., invalid ids from client), fallback to server cart
    if (items.length === 0) {
      const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }
      for (const item of cart.items) {
        items.push({
          product: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.price,
          quantity: item.quantity,
          category: item.product.category
        });
      }
      subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery above ₹500
    const platformFee = 5;
    const gstRate = 0.05; // 5% GST
    const gst = Math.round(subtotal * gstRate);
    const total = subtotal + deliveryFee + platformFee + gst;

    // Generate order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `QIT${timestamp.slice(-6)}${random}`;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderNumber,
      items,
      shippingAddress: {
        name: shippingAddress.name,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        phone: shippingAddress.phone
      },
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'completed'
      },
      pricing: {
        subtotal,
        deliveryFee,
        platformFee,
        gst,
        total
      },
      orderStatus: 'pending',
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      notes: notes || ''
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear server cart if used
    try {
      const cart = await Cart.findOne({ user: req.user.id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
    } catch (_) {}

    // Populate order for response
    await order.populate('items.product', 'name image category');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { user: req.user.id };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('items.product', 'name image category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.product', 'name image category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    
    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
};

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).select('orderNumber orderStatus statusHistory estimatedDelivery deliveredAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { 
        tracking: {
          orderNumber: order.orderNumber,
          currentStatus: order.orderStatus,
          statusHistory: order.statusHistory,
          estimatedDelivery: order.estimatedDelivery,
          deliveredAt: order.deliveredAt
        }
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking order'
    });
  }
};

// ============= ADMIN ONLY ROUTES =============

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.orderStatus = orderStatus;
    
    // Add to status history
    order.statusHistory.push({
      status: orderStatus,
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    // Set delivered date if status is delivered
    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentInfo.status = 'completed';
    }

    await order.save();
    await order.populate('user', 'name email phone');
    await order.populate('items.product', 'name image category');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};