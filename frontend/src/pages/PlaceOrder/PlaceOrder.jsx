import React, { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import './PlaceOrder.css'

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, prod_list, user, token, placeOrder } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'India',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is logged in
  useEffect(() => {
    if (!user || !token) {
      alert('Please login to place an order');
      navigate('/');
      return;
    }
    
    // Pre-fill user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user, token, navigate]);

  const totalAmount = getTotalCartAmount();
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const platformFee = 5;
  const gst = Math.round(totalAmount * 0.05); // 5% GST
  const finalTotal = totalAmount + deliveryFee + platformFee + gst;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (totalAmount === 0) {
      // Cart is empty - redirect to home instead of showing alert
      navigate('/');
      return;
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Prepare order data for backend
      const orderData = {
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.zipcode,
          phone: formData.phone
        },
        paymentMethod: paymentMethod,
        notes: `Order placed via web app. Payment method: ${paymentMethod}`
      };

      // Place order through context
      const result = await placeOrder(orderData);
      
      if (result.success) {
        // Wait 2 seconds then navigate to My Orders page
        setTimeout(() => {
          navigate('/my-orders');
        }, 2000);
      } else {
        setError(result.message || 'Failed to place order');
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !token) {
    return (
      <div className="empty-cart">
        <h2>Please login to place an order</h2>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Go to Home
        </button>
      </div>
    );
  }

  if (totalAmount === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="multi-fields">
          <input
            name="firstName"
            onChange={handleInputChange}
            value={formData.firstName}
            type="text"
            placeholder="First name"
            required
            disabled={isLoading}
          />
          <input
            name="lastName"
            onChange={handleInputChange}
            value={formData.lastName}
            type="text"
            placeholder="Last name"
            required
            disabled={isLoading}
          />
        </div>
        
        <input
          name="email"
          onChange={handleInputChange}
          value={formData.email}
          type="email"
          placeholder="Email address"
          required
          disabled={isLoading}
        />
        
        <input
          name="street"
          onChange={handleInputChange}
          value={formData.street}
          type="text"
          placeholder="Street address"
          required
          disabled={isLoading}
        />
        
        <div className="multi-fields">
          <input
            name="city"
            onChange={handleInputChange}
            value={formData.city}
            type="text"
            placeholder="City"
            required
            disabled={isLoading}
          />
          <input
            name="state"
            onChange={handleInputChange}
            value={formData.state}
            type="text"
            placeholder="State"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="multi-fields">
          <input
            name="zipcode"
            onChange={handleInputChange}
            value={formData.zipcode}
            type="text"
            placeholder="Pin code"
            required
            disabled={isLoading}
          />
          <input
            name="country"
            onChange={handleInputChange}
            value={formData.country}
            type="text"
            placeholder="Country"
            disabled={isLoading}
          />
        </div>
        
        <input
          name="phone"
          onChange={handleInputChange}
          value={formData.phone}
          type="tel"
          placeholder="Phone number"
          required
          disabled={isLoading}
        />

        <div className="payment-method">
          <p className="title">Payment Method</p>
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
              <span>Cash on Delivery</span>
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
              <span>UPI Payment</span>
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
              <span>Credit/Debit Card</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{totalAmount}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Platform Fee</p>
              <p>₹{platformFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>GST (5%)</p>
              <p>₹{gst}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{finalTotal}</b>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Placing Order...' : `PLACE ORDER (₹${finalTotal})`}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
