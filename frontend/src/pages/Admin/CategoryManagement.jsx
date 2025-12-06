import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const { 
    user, 
    getAdminCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useContext(StoreContext);
  
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await getAdminCategories();
      if (result.success) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const categoryData = {
      ...formData,
      sortOrder: parseInt(formData.sortOrder)
    };

    let result;
    if (editingCategory) {
      result = await updateCategory(editingCategory._id, categoryData);
    } else {
      result = await createCategory(categoryData);
    }

    if (result.success) {
      alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      resetForm();
      fetchCategories();
    } else {
      alert(result.message || 'Operation failed');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete category "${categoryName}"? This will affect all products in this category.`)) {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert(result.message || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      sortOrder: 0,
      isActive: true
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="category-management loading">Loading...</div>;
  }

  return (
    <div className="category-management">
      <div className="cm-header">
        <h1>Category Management</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="category-form-card">
          <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Vegetables"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Category description..."
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label>Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                min="0"
              />
              <small>Lower numbers appear first</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category._id} className="category-card">
            {category.image && (
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>
            )}
            <div className="category-content">
              <div className="category-header">
                <h3>{category.name}</h3>
                <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
              <div className="category-meta">
                <span className="sort-order">Order: {category.sortOrder}</span>
              </div>
            </div>
            <div className="category-actions">
              <button className="btn-edit" onClick={() => handleEdit(category)}>
                Edit
              </button>
              <button className="btn-delete" onClick={() => handleDelete(category._id, category.name)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="no-results">No categories found. Add your first category!</div>
      )}
    </div>
  );
};

export default CategoryManagement;
