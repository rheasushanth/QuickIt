import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import './ProductManagement.css';

const ProductManagement = () => {
  const { 
    user, 
    getAdminProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    getAdminCategories,
    getAdminSubcategories 
  } = useContext(StoreContext);
  
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [formData, setFormData] = useState({
    customId: '',
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    subcategory: '',
    image: '',
    stock: '',
    unit: 'kg',
    weight: '',
    isFeatured: false,
    isOrganic: false,
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
      const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        getAdminProducts(),
        getAdminCategories(),
        getAdminSubcategories()
      ]);

      if (productsRes.success) setProducts(productsRes.products);
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
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      stock: parseInt(formData.stock),
      weight: parseFloat(formData.weight)
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct._id, productData);
    } else {
      result = await createProduct(productData);
    }

    if (result.success) {
      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      resetForm();
      fetchData();
    } else {
      alert(result.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      customId: product.customId,
      name: product.name,
      description: product.description || '',
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      subcategory: product.subcategory || '',
      image: product.image,
      stock: product.stock,
      unit: product.unit,
      weight: product.weight,
      isFeatured: product.isFeatured,
      isOrganic: product.isOrganic,
      isActive: product.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      const result = await deleteProduct(productId);
      if (result.success) {
        alert('Product deleted successfully!');
        fetchData();
      } else {
        alert(result.message || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customId: '',
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      category: '',
      subcategory: '',
      image: '',
      stock: '',
      unit: 'kg',
      weight: '',
      isFeatured: false,
      isOrganic: false,
      isActive: true
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.customId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.isActive) ||
                         (filterStatus === 'inactive' && !product.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return <div className="product-management loading">Loading...</div>;
  }

  return (
    <div className="product-management">
      <div className="pm-header">
        <h1>Product Management</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="product-form-card">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Product ID *</label>
                <input
                  type="text"
                  name="customId"
                  value={formData.customId}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., PROD001"
                />
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Product description..."
                />
              </div>

              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Discount Price</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.filter(c => c.isActive).map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subcategory</label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.filter(sc => sc.isActive).map(subcat => (
                    <option key={subcat._id} value={subcat.name}>{subcat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Weight *</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Image URL *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  Featured Product
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleInputChange}
                  />
                  Organic
                </label>
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
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filters-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td>{product.customId}</td>
                <td>
                  <img src={product.image} alt={product.name} className="product-thumbnail" />
                </td>
                <td>
                  <div className="product-name">
                    {product.name}
                    {product.isFeatured && <span className="badge featured">Featured</span>}
                    {product.isOrganic && <span className="badge organic">Organic</span>}
                  </div>
                </td>
                <td>{product.category}</td>
                <td>
                  ₹{product.discountPrice || product.price}
                  {product.discountPrice && (
                    <span className="original-price">₹{product.price}</span>
                  )}
                </td>
                <td className={product.stock < 10 ? 'low-stock' : ''}>{product.stock}</td>
                <td>
                  <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(product._id, product.name)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-results">No products found</div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
