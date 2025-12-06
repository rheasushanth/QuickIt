import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import ProductItem from '../../components/ProductItem/ProductItem';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { prod_list, addToCart } = useContext(StoreContext);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Find product by customId (which matches the frontend _id)
    const foundProduct = prod_list.find(p => p._id === id);
    setProduct(foundProduct);

    if (foundProduct) {
      // Find similar products from the same category
      const similar = prod_list
        .filter(p => p.category === foundProduct.category && p._id !== id)
        .slice(0, 8); // Show max 8 similar products
      setSimilarProducts(similar);
    }
  }, [id, prod_list]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product._id);
      }
      alert(`Added ${quantity} ${product.name} to cart!`);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="back-home-btn">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        {/* Product Info Section */}
        <div className="product-info">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>
          
          <div className="product-details">
            <h1 className="product-name">{product.name}</h1>
            <p className="product-category">{product.category}</p>
            
            <div className="product-pricing">
              <span className="current-price">₹{product.price}</span>
              {product.originalPrice && (
                <span className="original-price">₹{product.originalPrice}</span>
              )}
              {product.discount > 0 && (
                <span className="discount">{product.discount}% OFF</span>
              )}
            </div>

            {product.description && (
              <div className="product-description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="product-meta">
              {product.weight && (
                <div className="meta-item">
                  <strong>Weight:</strong> {product.weight}
                </div>
              )}
              {product.brand && (
                <div className="meta-item">
                  <strong>Brand:</strong> {product.brand}
                </div>
              )}
              <div className="meta-item">
                <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </div>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
              
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="similar-products">
          <h2>Similar Products from {product.category}</h2>
          {similarProducts.length > 0 ? (
            <div className="similar-products-grid">
              {similarProducts.map((item) => (
                <ProductItem 
                  key={item._id} 
                  product={item}
                />
              ))}
            </div>
          ) : (
            <div className="no-similar-products">
              <p>No other products available in this category at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;