import React, { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import './Payment.css'

const Payment = () => {
  const { getTotalCartAmount, cartItems, prod_list, user, token, placeOrder } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Check if user is logged in and has address data
  useEffect(() => {
    if (!user || !token) {
      alert('Please login to place an order');
      navigate('/');
      return;
    }
    
    const totalAmount = getTotalCartAmount();
    if (totalAmount === 0) {
      // Cart is empty - redirect to home instead of showing alert
      navigate('/');
      return;
    }

    // Get address data from localStorage
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (!savedAddress) {
      alert('Please fill in your address first');
      navigate('/address');
      return;
    }

    setAddressData(JSON.parse(savedAddress));
  }, [user, token, navigate, getTotalCartAmount]);

  const totalAmount = getTotalCartAmount();
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const platformFee = 5;
  const gst = Math.round(totalAmount * 0.05);
  const finalTotal = totalAmount + deliveryFee + platformFee + gst;

  const handlePlaceOrder = async () => {
    if (!addressData) {
      alert('Address information missing');
      navigate('/address');
      return;
    }

    console.log('Cart items before placing order:', cartItems);
    console.log('Total cart amount:', getTotalCartAmount());
    console.log('Cart items keys:', Object.keys(cartItems));

    setIsLoading(true);

    try {
      // Prepare order data for backend
      const orderData = {
        shippingAddress: {
          name: `${addressData.firstName} ${addressData.lastName}`,
          address: addressData.street,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.zipcode,
          phone: addressData.phone
        },
        paymentMethod: paymentMethod,
        notes: `Order placed via web app. Payment method: ${paymentMethod.toUpperCase()}`
      };

      console.log('Order data being sent:', orderData);

      // Place order through context
      const result = await placeOrder(orderData);
      
      console.log('Place order result:', result);
      
      if (result.success) {
        // Clear address data from localStorage
        localStorage.removeItem('deliveryAddress');
        
        // Show success popup instead of alert
        setOrderDetails(result.order);
        setShowSuccessPopup(true);
        
        // Navigate to orders page after 10 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/my-orders');
        }, 10000);
      } else {
        alert('Failed to place order: ' + (result.message || 'Unknown error'));
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get cart items for display
  const getCartItems = () => {
    return Object.keys(cartItems).map(itemId => {
      const product = prod_list.find(p => p._id === itemId);
      return {
        ...product,
        quantity: cartItems[itemId]
      };
    }).filter(item => item.quantity > 0);
  };

  if (!user || !token || !addressData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-left">
          <h2>Payment Details</h2>
          
          {/* Address Summary */}
          <div className="address-summary">
            <h3>Delivery Address</h3>
            <div className="address-info">
              <p><strong>{addressData.firstName} {addressData.lastName}</strong></p>
              <p>{addressData.street}</p>
              <p>{addressData.city}, {addressData.state} - {addressData.zipcode}</p>
              <p>Phone: {addressData.phone}</p>
              <button 
                onClick={() => navigate('/address')} 
                className="change-address"
              >
                Change Address
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isLoading}
                />
                <div className="payment-info">
                  <span className="payment-title">💰 Cash on Delivery</span>
                  <span className="payment-desc">Pay when your order arrives</span>
                </div>
              </label>
              
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isLoading}
                />
                <div className="payment-info">
                  <span className="payment-title">📱 UPI Payment</span>
                  <span className="payment-desc">Pay using UPI apps</span>
                </div>
              </label>
              
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isLoading}
                />
                <div className="payment-info">
                  <span className="payment-title">💳 Credit/Debit Card</span>
                  <span className="payment-desc">Pay using your card</span>
                </div>
              </label>
            </div>
          </div>

          <div className="payment-buttons">
            <button 
              onClick={() => navigate('/address')} 
              className="back-button"
              disabled={isLoading}
            >
              Back to Address
            </button>
            <button 
              onClick={handlePlaceOrder} 
              className="place-order-button"
              disabled={isLoading}
            >
              {isLoading ? 'Placing Order...' : `PLACE ORDER (₹${finalTotal})`}
            </button>
          </div>
        </div>
        
        <div className="payment-right">
          <div className="order-review">
            <h2>Order Review</h2>
            
            {/* Cart Items */}
            <div className="order-items">
              {getCartItems().map((item, index) => (
                <div key={index} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                    <p className="item-price">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Price Breakdown */}
            <div className="price-breakdown">
              <div className="price-row">
                <p>Subtotal</p>
                <p>₹{totalAmount}</p>
              </div>
              <div className="price-row">
                <p>Delivery Fee</p>
                <p>₹{deliveryFee}</p>
              </div>
              <div className="price-row">
                <p>Platform Fee</p>
                <p>₹{platformFee}</p>
              </div>
              <div className="price-row">
                <p>GST (5%)</p>
                <p>₹{gst}</p>
              </div>
              <hr />
              <div className="price-row total">
                <strong>Total Amount</strong>
                <strong>₹{finalTotal}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-icon">✅</div>
            <h2>ORDER PLACED</h2>
            <p>Order Number: <strong>{orderDetails?.orderNumber}</strong></p>
            <p>Total Amount: <strong>₹{finalTotal}</strong></p>
            <p>Redirecting to your orders page in 10 seconds...</p>
            <div className="success-popup-buttons">
              <button 
                onClick={() => {
                  setShowSuccessPopup(false);
                  navigate('/my-orders');
                }}
                className="go-to-orders-btn"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payment