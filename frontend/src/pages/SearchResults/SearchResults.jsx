import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './SearchResults.css'
import ProductItem from '../../components/ProductItem/ProductItem'
import { StoreContext } from '../../Context/StoreContext'

const SearchResults = () => {
  const { query } = useParams()
  const navigate = useNavigate()
  const { searchProducts, prod_list } = useContext(StoreContext)
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch search results from backend when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query || !query.trim()) {
        setSearchResults([])
        return
      }

      setLoading(true)
      const results = await searchProducts(query)
      setSearchResults(results)
      setLoading(false)
    }

    fetchSearchResults()
  }, [query])

  // Get similar products from the same categories as search results
  const similarProducts = React.useMemo(() => {
    if (searchResults.length === 0) return []
    
    // Get all categories from search results
    const searchCategories = [...new Set(searchResults.map(p => p.category))]
    
    // Find products from these categories that are not in search results
    const searchResultIds = new Set(searchResults.map(p => p._id))
    return prod_list.filter(product => 
      searchCategories.includes(product.category) && 
      !searchResultIds.has(product._id)
    ).slice(0, 8) // Limit to 8 similar products
  }, [prod_list, searchResults])

  if (!query || !query.trim()) {
    return (
      <div className="search-results-page">
        <div className="search-error">
          <h2>No search query provided</h2>
          <button onClick={() => navigate('/')} className="back-home-btn">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Home
        </button>
        <h1>Search Results for "{query}"</h1>
        <p className="results-count">
          {loading ? 'Searching...' : `${searchResults.length} ${searchResults.length === 1 ? 'product' : 'products'} found`}
        </p>
      </div>

      <div className="search-results-content">
        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="search-results-grid">
              {searchResults.map((product) => (
                <ProductItem key={product._id} product={product} />
              ))}
            </div>

            {/* Similar Products Section */}
            {similarProducts.length > 0 && (
              <div className="similar-products-section">
                <h2>Similar Products from Related Categories</h2>
                <div className="similar-products-grid">
                  {similarProducts.map((product) => (
                    <ProductItem key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <h3>No products found for "{query}"</h3>
            <p>Try searching with different keywords or browse our categories.</p>
            <button onClick={() => navigate('/')} className="browse-btn">
              Browse All Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults