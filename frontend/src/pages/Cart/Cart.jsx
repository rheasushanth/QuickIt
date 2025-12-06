import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate, useLocation } from 'react-router-dom'
import './Cart.css'

const Cart = () => {
  const { cartItems, prod_list, addToCart, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [justPlacedOrder, setJustPlacedOrder] = useState(false);

  const totalAmount = getTotalCartAmount();

  useEffect(() => {
    // Check if user was redirected here after placing an order
    if (location.state?.fromOrderPlacement) {
      setJustPlacedOrder(true);
      // Clear the state after showing the message
      setTimeout(() => setJustPlacedOrder(false), 5000);
    }
  }, [location.state]);

  if (totalAmount === 0) {
    return (
      <div className="cart-empty">
        <h2>{justPlacedOrder ? "Order placed successfully!" : "Your cart is empty"}</h2>
        <p>{justPlacedOrder ? "Your order has been placed. Check your orders page for details." : "Add some delicious items to your cart!"}</p>
        <div className="cart-empty-buttons">
          <button onClick={() => navigate('/')} className="continue-shopping">
            Continue Shopping
          </button>
          {justPlacedOrder && (
            <button onClick={() => navigate('/my-orders')} className="view-orders">
              View My Orders
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-items-title">
              <p>Items</p>
              <p>Title</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Total</p>
              <p>Remove</p>
            </div>
            <hr />
            
            {prod_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id}>
                    <div className="cart-items-title cart-items-item">
                      <img src={item.image} alt={item.name} />
                      <p>{item.name}</p>
                      <p>₹{item.price}</p>
                      <div className="cart-quantity-controls">
                        <button onClick={() => removeFromCart(item._id)}>-</button>
                        <p>{cartItems[item._id]}</p>
                        <button onClick={() => addToCart(item._id)}>+</button>
                      </div>
                      <p>₹{item.price * cartItems[item._id]}</p>
                      <p 
                        onClick={() => removeFromCart(item._id, true)} 
                        className="cross"
                      >
                        ×
                      </p>
                    </div>
                    <hr />
                  </div>
                );
              }
              return null;
            })}
          </div>
          
          <div className="cart-bottom">
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
                  <p>₹{totalAmount === 0 ? 0 : totalAmount > 500 ? 0 : 40}</p>
                </div>
                <hr />
                <div className="cart-total-details">
                  <b>Total</b>
                  <b>₹{totalAmount === 0 ? 0 : totalAmount + (totalAmount > 500 ? 0 : 40)}</b>
                </div>
              </div>
              <button onClick={() => navigate('/address')}>
                PROCEED TO CHECKOUT
              </button>
            </div>
            
            <div className="cart-promocode">
              <div>
                <p>If you have a promo code, Enter it here</p>
                <div className="cart-promocode-input">
                  <input type="text" placeholder="promo code" />
                  <button>Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
