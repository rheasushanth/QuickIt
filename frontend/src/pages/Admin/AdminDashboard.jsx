import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, getAdminProducts, getAdminCategories, getAdminSubcategories } = useContext(StoreContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    totalSubcategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        getAdminProducts(),
        getAdminCategories(),
        getAdminSubcategories()
      ]);

      if (productsRes.success) {
        const activeProducts = productsRes.products.filter(p => p.isActive).length;
        setStats(prev => ({
          ...prev,
          totalProducts: productsRes.products.length,
          activeProducts
        }));
      }

      if (categoriesRes.success) {
        setStats(prev => ({
          ...prev,
          totalCategories: categoriesRes.categories.length
        }));
      }

      if (subcategoriesRes.success) {
        setStats(prev => ({
          ...prev,
          totalSubcategories: subcategoriesRes.subcategories.length
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">📦</div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-number">{stats.totalProducts}</p>
            <span className="stat-detail">{stats.activeProducts} active</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon categories">📂</div>
          <div className="stat-info">
            <h3>Categories</h3>
            <p className="stat-number">{stats.totalCategories}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon subcategories">🏷️</div>
          <div className="stat-info">
            <h3>Subcategories</h3>
            <p className="stat-number">{stats.totalSubcategories}</p>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="action-btn products-btn"
            onClick={() => navigate('/admin/products')}
          >
            <span className="btn-icon">📦</span>
            <span>Manage Products</span>
          </button>

          <button 
            className="action-btn categories-btn"
            onClick={() => navigate('/admin/categories')}
          >
            <span className="btn-icon">📂</span>
            <span>Manage Categories</span>
          </button>

          <button 
            className="action-btn subcategories-btn"
            onClick={() => navigate('/admin/subcategories')}
          >
            <span className="btn-icon">🏷️</span>
            <span>Manage Subcategories</span>
          </button>

          <button 
            className="action-btn orders-btn"
            onClick={() => navigate('/admin/orders')}
          >
            <span className="btn-icon">📋</span>
            <span>Manage Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
