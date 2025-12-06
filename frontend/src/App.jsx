import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import Cart from './pages/Cart/Cart.jsx'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder.jsx'
import ProductDetail from './pages/ProductDetail/ProductDetail.jsx'
import MyOrders from './pages/MyOrders/MyOrders.jsx'
import Address from './pages/Address/Address.jsx'
import AddressManagement from './pages/Address/AddressManagement.jsx'
import Payment from './pages/Payment/Payment.jsx'
import SearchResults from './pages/SearchResults/SearchResults.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import ProductManagement from './pages/Admin/ProductManagement.jsx'
import CategoryManagement from './pages/Admin/CategoryManagement.jsx'
import SubcategoryManagement from './pages/Admin/SubcategoryManagement.jsx'
import OrderManagement from './pages/Admin/OrderManagement.jsx'
import StoreContextProvider from './Context/StoreContext.jsx' 

const App = () => {
  return (
    <StoreContextProvider>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search/:query" element={<SearchResults />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/address" element={<Address />} />
          <Route path="/address-management" element={<AddressManagement />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/my-orders" element={<MyOrders />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/subcategories" element={<SubcategoryManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
        </Routes>
      </div>
    </StoreContextProvider>
  )
}

export default App