import React from 'react'
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <img src="/header.png" alt="Hero banner" className="header-image" />
      <div className="header-content">
        <h2>Order your favourite products here!</h2>
        <p>Choose from a variety of categories</p>
      </div>
    </header>
  )
}

export default Header