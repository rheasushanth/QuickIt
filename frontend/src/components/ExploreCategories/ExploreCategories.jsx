import React from 'react'
import './ExploreCategories.css'
import { cat_list } from '../../assets/assets'

const ExploreCategories = ({ category, setCategory }) => {
  const toggleCategory = (name) => {
    setCategory((prev) => (prev === name ? 'All' : name))
  }

  const handleKey = (e, name) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleCategory(name)
    }
  }

  return (
    <div className="explore-categories" id="explore-categories">
      <h2>Explore Categories</h2>
      <p className="explore-categories-text">Browse through various categories of products</p>

      <div className="explore-categories-list">
        {cat_list.map((item, index) => {
          const isActive = category === item.cat_name
          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              className={`explore-categories-list-item ${isActive ? 'selected' : ''}`}
              onClick={() => toggleCategory(item.cat_name)}
              onKeyDown={(e) => handleKey(e, item.cat_name)}
            >
              <img
                className={`explore-img ${isActive ? 'active' : ''}`}
                src={item.cat_image}
                alt={item.cat_name}
                loading="lazy"
              />
              <p className="explore-categories-item-title">{item.cat_name}</p>
            </div>
          )
        })}
      </div>

      <hr />
    </div>
  )
}

export default ExploreCategories