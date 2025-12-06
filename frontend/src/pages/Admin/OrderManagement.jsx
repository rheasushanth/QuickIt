import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import './OrderManagement.css';

const OrderManagement = () => {
  const { user, token, updateOrderStatus, API_URL } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate('/');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchAllOrders();
  }, [user, token, navigate, filterStatus]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParam = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const response = await fetch(`${API_URL}/orders/admin/all${queryParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        // Update the order in the list
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
        alert('Order status updated successfully');
      } else {
        alert(result.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
      'pending': 'Pending',
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="admin-orders-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Error loading orders</h2>
        <p>{error}</p>
        <button onClick={fetchAllOrders} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="admin-orders-container">
        <div className="admin-header">
          <h1>Order Management</h1>
          <div className="filter-section">
            <label>Filter by Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Orders</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <h2>No orders found</h2>
            <p>There are no orders matching your filter criteria.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => (
              <div key={order._id} className="admin-order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.orderNumber}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                    <p className="customer-info">
                      Customer: {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})
                    </p>
                  </div>
                  <div
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                  >
                    {getStatusText(order.orderStatus)}
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name || 'Unknown Product'}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                </div>

                {order.shippingAddress && (
                  <div className="shipping-address">
                    <p><strong>Shipping Address:</strong></p>
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                    <p>{order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                  </div>
                )}

                <div className="order-actions">
                  <label>Update Status:</label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    disabled={updatingOrderId === order._id || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                    className="status-select"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {updatingOrderId === order._id && <span className="updating-text">Updating...</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
