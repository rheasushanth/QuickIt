import React, { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import './Address.css'


const Address = () => {
  const { getTotalCartAmount, user, token, API_URL, getUserAddresses } = useContext(StoreContext);
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

  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Check if user is logged in and cart has items
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
    
    // Load saved addresses
    loadSavedAddresses();
    
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
  }, [user, token, navigate, getTotalCartAmount]);

  const loadSavedAddresses = async () => {
    const result = await getUserAddresses();
    if (result.success) {
      setSavedAddresses(result.addresses);
      // Auto-select default address if exists
      const defaultAddr = result.addresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        selectAddress(defaultAddr);
      }
    }
  };

  const selectAddress = (address) => {
    setSelectedAddressId(address._id);
    const nameParts = address.fullName.split(' ');
    setFormData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user.email || '',
      street: address.street,
      city: address.city,
      state: '',
      zipcode: address.pincode,
      country: 'India',
      phone: address.phone
    });
  };

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

  const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'phone'];
  const missingFields = requiredFields.filter(field => !formData[field]);

  if (missingFields.length > 0) {
    alert('Please fill in all required fields');
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${API_URL}/users/address`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        pincode: formData.zipcode
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Address saved:', data.addresses);
      // Save only for UI reference (optional)
      localStorage.setItem('deliveryAddress', JSON.stringify(formData));
      navigate('/payment');
    } else {
      alert(data.message || 'Failed to save address');
    }
  } catch (error) {
    console.error('Error saving address:', error);
    alert('Failed to save address');
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
    <div className="address-page">
      <div className="address-container">
        <div className="address-left">
          <h2>Delivery Address</h2>
          
          {savedAddresses.length > 0 && (
            <div className="saved-addresses">
              <h3>Select from saved addresses:</h3>
              <div className="address-options">
                {savedAddresses.map(address => (
                  <div 
                    key={address._id} 
                    className={`address-option ${selectedAddressId === address._id ? 'selected' : ''}`}
                    onClick={() => selectAddress(address)}
                  >
                    <div className="address-option-content">
                      <strong>{address.fullName}</strong>
                      <p>{address.street}, {address.city} - {address.pincode}</p>
                      <p>Phone: {address.phone}</p>
                    </div>
                    {address.isDefault && <span className="default-badge">Default</span>}
                  </div>
                ))}
              </div>
              <p className="or-divider">OR enter a new address:</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="address-form">
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

            <div className="address-buttons">
              <button 
                type="button" 
                onClick={() => navigate('/cart')} 
                className="back-button"
              >
                Back to Cart
              </button>
              <button type="submit" className="continue-button">
                Continue to Payment
              </button>
            </div>
          </form>
        </div>
        
        <div className="address-right">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <p>Subtotal</p>
                <p>₹{totalAmount}</p>
              </div>
              <div className="summary-row">
                <p>Delivery Fee</p>
                <p>₹{deliveryFee}</p>
              </div>
              <div className="summary-row">
                <p>Platform Fee</p>
                <p>₹{platformFee}</p>
              </div>
              <div className="summary-row">
                <p>GST (5%)</p>
                <p>₹{gst}</p>
              </div>
              <hr />
              <div className="summary-row total">
                <strong>Total</strong>
                <strong>₹{finalTotal}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Address