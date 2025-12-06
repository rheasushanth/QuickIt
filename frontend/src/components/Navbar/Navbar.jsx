import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'
import { assets } from '../../assets/assets'
import LoginPopup from '../LoginPopup/LoginPopup'
import CartPopup from '../cartpopup/CartPopup'
import { StoreContext } from '../../Context/StoreContext'

const Navbar = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { getTotalCartItems, user, logout, searchQuery, setSearchQuery } = useContext(StoreContext);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const totalItems = getTotalCartItems();

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <img src={assets.logo} alt="QuickIt" className="logo" />

          <nav className="nav-links" aria-label="Primary">
            <ul className="navbar-menu">
              <li className="nav-item" onClick={() => navigate('/')}>Home</li>
              {user && (
                <li className="nav-item" onClick={() => navigate('/my-orders')}>My Orders</li>
              )}
            </ul>
          </nav>
        </div>

        <div className="navbar-center">
          <div className="search-wrapper" role="search">
            <input
              className="search-input"
              type="search"
              placeholder="Search products, categories..."
              aria-label="Search"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="search-btn" 
              aria-label="Search" 
              onClick={handleSearch}
            >
              <img src={assets.search} alt="Search" className="search-icon" />
            </button>
          </div>
        </div>

        <div className="navbar-right">
          <button 
            className="cart-btn" 
            aria-label="View cart"
            onClick={() => setShowCart(true)}
          >
            <img src={assets.basket} alt="Cart" className="cart-icon" />
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>

          {user ? (
            <div className="profile-menu">
              <button 
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                👤 {user.name}
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <p><strong>{user.name}</strong></p>
                    <p>{user.email}</p>
                  </div>
                  <hr />
                  {user.role === 'admin' && (
                    <>
                      <button onClick={() => { navigate('/admin'); setShowProfileMenu(false); }}>
                        🛠️ Admin Dashboard
                      </button>
                      <hr />
                    </>
                  )}
                  <button onClick={() => { navigate('/my-orders'); setShowProfileMenu(false); }}>My Orders</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="signin-btn"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      {showCart && <CartPopup setShowCart={setShowCart} />}
    </>
  )
}

export default Navbar