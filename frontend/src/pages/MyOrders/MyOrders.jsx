import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
// images removed for My Orders — show names only
import './MyOrders.css';

const MyOrders = () => {
  const { getUserOrders, cancelOrder, trackOrder, user, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate('/');
      return;
    }
    
    fetchOrders();
  }, [user, token, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getUserOrders();
      
      if (result.success) {
        setOrders(result.orders || []);
      } else {
        setError(result.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      const result = await cancelOrder(orderId);
      
      if (result.success) {
        // Update the order in the list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, orderStatus: 'cancelled' }
              : order
          )
        );
        alert('Order cancelled successfully');
      } else {
        alert(result.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (order) => {
    // Can only cancel orders that are pending or confirmed
    return ['pending', 'confirmed'].includes(order.orderStatus);
  };

  const handleTrackOrder = async (orderId) => {
    try {
      setTrackingOrderId(orderId);
      const result = await trackOrder(orderId);
      
      if (result.success) {
        setTrackingData({ orderId, ...result.tracking });
      } else {
        alert(result.message || 'Failed to fetch tracking information');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      alert('Failed to fetch tracking information');
    } finally {
      setTrackingOrderId(null);
    }
  };

  const closeTrackingModal = () => {
    setTrackingData(null);
  };

  // Images intentionally not used in the My Orders list — only names, quantities and prices are shown.

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': '#ffa500',
      'confirmed': '#4CAF50',
      'preparing': '#2196F3',
      'out_for_delivery': '#9C27B0',
      'delivered': '#4CAF50',
      'cancelled': '#f44336'
    };
    return statusColors[status] || '#666';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'pending': 'Order Placed',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusTexts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || !token) {
    return (
      <div className="no-orders">
        <h2>Please login to view your orders</h2>
        <button onClick={() => navigate('/')} className="start-shopping">
          Go to Home
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Error loading orders</h2>
        <p>{error}</p>
        <button onClick={fetchOrders} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="no-orders">
        <h2>No orders yet</h2>
        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <button onClick={() => navigate('/')} className="start-shopping">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="orders-container">
        <h1>My Orders</h1>
        
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                >
                  {getStatusText(order.orderStatus)}
                </div>
              </div>
              
              <div className="order-items">
                {order.items.map((item, index) => {
                  const name = item.name || 'Unknown Product';

                  return (
                    <div 
                      key={index} 
                      className="order-item"
                    >
                      <div className="item-details">
                        <h4>{name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p className="item-price">₹{item.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="order-footer">
                {order.estimatedDelivery && order.orderStatus !== 'delivered' && (
                  <div className="delivery-info">
                    <p>Expected delivery: 15 min</p>
                  </div>
                )}
                
                <div className="order-actions">
                  <button 
                    className="track-order-btn"
                    onClick={() => handleTrackOrder(order._id)}
                    disabled={trackingOrderId === order._id}
                  >
                    {trackingOrderId === order._id ? 'Loading...' : 'Track Order'}
                  </button>
                  
                  {canCancelOrder(order) && (
                    <button 
                      className="cancel-order-btn"
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingOrderId === order._id}
                    >
                      {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
              
              {order.shippingAddress && (
                <div className="shipping-address">
                  <p><strong>Shipping to:</strong></p>
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingData && (
        <div className="tracking-modal-overlay" onClick={closeTrackingModal}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-modal-header">
              <h2>Order Tracking OTP - 1513</h2>
              <button className="close-modal" onClick={closeTrackingModal}>✕</button>
            </div>
            
            <div className="tracking-content">
              <div className="tracking-info">
                <p><strong>Order Number:</strong> {trackingData.orderNumber}</p>
                <p><strong>Current Status:</strong> <span style={{ color: getStatusColor(trackingData.currentStatus) }}>{getStatusText(trackingData.currentStatus)}</span></p>
                {trackingData.estimatedDelivery && (
                  <p><strong>Estimated Delivery:</strong> {formatDate(trackingData.estimatedDelivery)}</p>
                )}
              </div>

              <div className="tracking-timeline">
                <h3>Order Timeline</h3>
                {trackingData.statusHistory && trackingData.statusHistory.length > 0 ? (
                  <div className="timeline">
                    {trackingData.statusHistory.map((status, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot" style={{ backgroundColor: getStatusColor(status.status) }}></div>
                        <div className="timeline-content">
                          <h4>{getStatusText(status.status)}</h4>
                          <p>{formatDate(status.timestamp)}</p>
                          {status.notes && <p className="timeline-notes">{status.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No tracking history available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;