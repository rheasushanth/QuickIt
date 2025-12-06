import React, { useCallback, useContext, useMemo } from 'react'
import './ProductDisplay.css'
import ProductItem from '../ProductItem/ProductItem.jsx'
import { StoreContext } from '../../Context/StoreContext'

const ProductDisplay = ({ category }) => {
  // avoid destructuring from a possibly-null context
  const store = useContext(StoreContext) || {}
  const prod_list = store.prod_list ?? []

  // normalize category and filter products
  const normalizedCategory = category?.toString().trim()
  const filteredProducts = useMemo(() => {
    return (!normalizedCategory || normalizedCategory === 'All')
      ? prod_list
      : prod_list.filter((p) => {
          const cat = p?.category?.toString().trim()
          return cat && cat === normalizedCategory
        })
  }, [prod_list, normalizedCategory])

  const handleAdd = useCallback((product) => {
    // hook this up to your cart logic or context later
    console.log('Add to cart:', product)
  }, [])

  return (
    <div className="prod-display" id="food-display">
      <h2>{normalizedCategory && normalizedCategory !== 'All' ? normalizedCategory : 'Popular Products'}</h2>

      <div className="product-grid">
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((prod) => (
            <ProductItem key={prod._id} product={prod} />
          ))
        ) : (
          <p className="no-products">No products found in this category.</p>
        )}
      </div>
    </div>
  )
}

export default ProductDisplay