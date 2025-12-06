import React from 'react'
import './Home.css'
import Header from '../../components/Navbar/Header/Header'
import ExploreCategories from '../../components/ExploreCategories/ExploreCategories'
import ProductDisplay from '../../components/ProductDisplay/ProductDisplay'

const Home = () => {
  const [category, setCategory] = React.useState('All')

  return (
    <div>
      <Header />
      <ExploreCategories category={category} setCategory={setCategory} />
      <ProductDisplay category={category}/>
    </div>
  )
}

export default Home