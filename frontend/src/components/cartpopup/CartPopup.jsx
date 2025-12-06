import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import './CartPopup.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';

const CartPopup = ({ setShowCart }) => {
  const { cartItems, prod_list, addToCart, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  // Get cart items with product details
  const cartItemsArray = Object.keys(cartItems)
    .filter(itemId => cartItems[itemId] > 0)
    .map(itemId => {
      const product = prod_list.find(p => p._id === itemId);
      return {
        ...product,
        quantity: cartItems[itemId]
      };
    });

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const removeItemCompletely = (itemId) => {
    // Remove all quantities of this item
    const quantity = cartItems[itemId];
    for (let i = 0; i < quantity; i++) {
      removeFromCart(itemId);
    }
  };

  return (
    <div className="cart-popup-overlay" onClick={() => setShowCart(false)}>
      <div className="cart-popup" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button 
            onClick={() => setShowCart(false)} 
            className="cart-close-btn"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="cart-content">
          {cartItemsArray.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
              <button 
                className="continue-shopping-btn"
                onClick={() => setShowCart(false)}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItemsArray.map((item) => (
                  <div key={item._id} className="cart-item">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.currentTarget.src = assets.logo;
                      }}
                    />
                    
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">₹{item.price}</p>
                      
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="quantity-btn"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item._id)}
                            className="quantity-btn"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItemCompletely(item._id)}
                          className="remove-btn"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="cart-item-total">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                className="checkout-btn"
                onClick={() => {
                  setShowCart(false);
                  navigate('/address');
                }}
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPopup;