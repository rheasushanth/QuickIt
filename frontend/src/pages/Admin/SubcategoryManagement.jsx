import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import './SubcategoryManagement.css';

const SubcategoryManagement = () => {
  const { 
    user, 
    getAdminCategories,
    getAdminSubcategories, 
    createSubcategory, 
    updateSubcategory, 
    deleteSubcategory 
  } = useContext(StoreContext);
  
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
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
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        getAdminCategories(),
        getAdminSubcategories()
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.categories);
      if (subcategoriesRes.success) setSubcategories(subcategoriesRes.subcategories);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    
    const subcategoryData = {
      ...formData,
      sortOrder: parseInt(formData.sortOrder)
    };

    let result;
    if (editingSubcategory) {
      result = await updateSubcategory(editingSubcategory._id, subcategoryData);
    } else {
      result = await createSubcategory(subcategoryData);
    }

    if (result.success) {
      alert(editingSubcategory ? 'Subcategory updated successfully!' : 'Subcategory created successfully!');
      resetForm();
      fetchData();
    } else {
      alert(result.message || 'Operation failed');
    }
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      category: subcategory.category._id || subcategory.category,
      description: subcategory.description || '',
      image: subcategory.image || '',
      sortOrder: subcategory.sortOrder || 0,
      isActive: subcategory.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (subcategoryId, subcategoryName) => {
    if (window.confirm(`Are you sure you want to delete subcategory "${subcategoryName}"?`)) {
      const result = await deleteSubcategory(subcategoryId);
      if (result.success) {
        alert('Subcategory deleted successfully!');
        fetchData();
      } else {
        alert(result.message || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      image: '',
      sortOrder: 0,
      isActive: true
    });
    setEditingSubcategory(null);
    setShowForm(false);
  };

  const filteredSubcategories = filterCategory
    ? subcategories.filter(sub => {
        const categoryId = sub.category?._id || sub.category;
        return categoryId === filterCategory;
      })
    : subcategories;

  if (loading) {
    return <div className="subcategory-management loading">Loading...</div>;
  }

  return (
    <div className="subcategory-management">
      <div className="scm-header">
        <h1>Subcategory Management</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Subcategory'}
        </button>
      </div>

      {showForm && (
        <div className="subcategory-form-card">
          <h2>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Parent Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Parent Category</option>
                {categories.filter(c => c.isActive).map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subcategory Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Leafy Vegetables"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Subcategory description..."
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
                {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <label>Filter by Category:</label>
        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="subcategories-grid">
        {filteredSubcategories.map(subcategory => (
          <div key={subcategory._id} className="subcategory-card">
            {subcategory.image && (
              <div className="subcategory-image">
                <img src={subcategory.image} alt={subcategory.name} />
              </div>
            )}
            <div className="subcategory-content">
              <div className="subcategory-header">
                <h3>{subcategory.name}</h3>
                <span className={`status-badge ${subcategory.isActive ? 'active' : 'inactive'}`}>
                  {subcategory.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="parent-category">
                <span className="label">Category:</span>
                <span className="value">{subcategory.category?.name || subcategory.categoryName}</span>
              </div>
              {subcategory.description && (
                <p className="subcategory-description">{subcategory.description}</p>
              )}
              <div className="subcategory-meta">
                <span className="sort-order">Order: {subcategory.sortOrder}</span>
              </div>
            </div>
            <div className="subcategory-actions">
              <button className="btn-edit" onClick={() => handleEdit(subcategory)}>
                Edit
              </button>
              <button className="btn-delete" onClick={() => handleDelete(subcategory._id, subcategory.name)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSubcategories.length === 0 && (
        <div className="no-results">No subcategories found. Add your first subcategory!</div>
      )}
    </div>
  );
};

export default SubcategoryManagement;
