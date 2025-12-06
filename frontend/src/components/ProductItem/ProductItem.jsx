import React, { useContext } from 'react'
import './ProductItem.css'
import { assets as allAssets } from '../../assets/assets'
import placeholder from '../../assets/logo.png'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'

const resolveImageSrc = (image) => {
  if (!image) return placeholder

  if (typeof image === 'string') {
    const t = image.trim()
    if (t.startsWith('http') || t.startsWith('/') || t.startsWith('data:') || t.startsWith('blob:')) {
      return t
    }
    if (allAssets && Object.prototype.hasOwnProperty.call(allAssets, t)) {
      return allAssets[t]
    }
    return t
  }

  return image
}

const ProductItem = ({ product }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const navigate = useNavigate();

  if (!product) return null

  const { _id, name, price, image } = product
  const src = resolveImageSrc(image)

  // Get quantity from context instead of local state
  const quantity = cartItems[_id] || 0;

  const addIconSrc = allAssets && allAssets.add_icon_green ? allAssets.add_icon_green : null

  const handleIncrement = (e) => {
    e.stopPropagation()
    addToCart(_id)
  }

  const handleDecrement = (e) => {
    e.stopPropagation()
    removeFromCart(_id)
  }

  const handleAddClick = (e) => {
    e.stopPropagation()
    addToCart(_id)
  }

  const handleOpenDetails = () => {
    navigate(`/product/${_id}`)
  }

  return (
    <div className="product-item" data-id={_id} onClick={handleOpenDetails}>
      <div className="product-item__image">
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = placeholder
          }}
        />
      </div>

      <div className="product-item__body">
        <div className="product-item__name" title={name}>
          {name}
        </div>

        <div className="product-item__meta">
          <div className="product-item__price">₹{price}</div>

          {quantity === 0 ? (
            <button
              className="product-item__add"
              onClick={handleAddClick}
              aria-label={`Add ${name} to cart`}
              type="button"
            >
              {addIconSrc && (
                <img
                  src={addIconSrc}
                  alt=""
                  className="product-item__add-icon"
                  aria-hidden="true"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <span className="product-item__add-text">Add</span>
            </button>
          ) : (
            <div className="product-item__counter" role="group" aria-label={`${name} quantity controls`}>
              <button
                className="product-item__counter-btn product-item__counter-btn--decrease"
                onClick={handleDecrement}
                aria-label={`Decrease ${name} quantity`}
                type="button"
              >
                −
              </button>

              <div className="product-item__counter-value" aria-live="polite">
                {quantity}
              </div>

              <button
                className="product-item__counter-btn product-item__counter-btn--increase"
                onClick={handleIncrement}
                aria-label={`Increase ${name} quantity`}
                type="button"
              >
                {addIconSrc ? (
                  <img src={addIconSrc} alt="" className="product-item__counter-plus-icon" />
                ) : (
                  '+'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductItem