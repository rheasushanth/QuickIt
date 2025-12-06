import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import './Address.css';

const AddressManagement = () => {
  const { user, token, getUserAddresses, addAddress, updateAddress, deleteAddress } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    if (!user || !token) {
      navigate('/');
      return;
    }
    loadAddresses();
  }, [user, token, navigate]);

  const loadAddresses = async () => {
    setIsLoading(true);
    const result = await getUserAddresses();
    if (result.success) {
      setAddresses(result.addresses);
    }
    setIsLoading(false);
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
    setIsLoading(true);

    const result = editingId 
      ? await updateAddress(editingId, formData)
      : await addAddress(formData);

    if (result.success) {
      setAddresses(result.addresses);
      resetForm();
    } else {
      alert(result.message || 'Failed to save address');
    }
    setIsLoading(false);
  };

  const handleEdit = (address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    setIsLoading(true);
    const result = await deleteAddress(addressId);
    if (result.success) {
      setAddresses(result.addresses);
    } else {
      alert(result.message || 'Failed to delete address');
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      street: '',
      city: '',
      pincode: '',
      isDefault: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (!user || !token) {
    return null;
  }

  return (
    <div className="address-management">
      <div className="address-header">
        <h2>Manage Addresses</h2>
        <button 
          className="add-address-btn" 
          onClick={() => setShowForm(!showForm)}
          disabled={isLoading}
        >
          {showForm ? 'Cancel' : '+ Add New Address'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="address-form">
          <h3>{editingId ? 'Edit Address' : 'New Address'}</h3>
          
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Full Name"
            required
            disabled={isLoading}
          />
          
          <input
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            required
            disabled={isLoading}
          />
          
          <input
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            placeholder="Street Address"
            required
            disabled={isLoading}
          />
          
          <div className="multi-fields">
            <input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              required
              disabled={isLoading}
            />
            <input
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="Pincode"
              required
              disabled={isLoading}
            />
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            Set as default address
          </label>

          <div className="form-buttons">
            <button type="button" onClick={resetForm} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (editingId ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      )}

      <div className="address-list">
        {isLoading && addresses.length === 0 ? (
          <p>Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p>No addresses saved. Add your first address above.</p>
        ) : (
          addresses.map(address => (
            <div key={address._id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              {address.isDefault && <span className="default-badge">Default</span>}
              <h4>{address.fullName}</h4>
              <p>{address.street}</p>
              <p>{address.city}, {address.pincode}</p>
              <p>Phone: {address.phone}</p>
              <div className="address-actions">
                <button onClick={() => handleEdit(address)} disabled={isLoading}>
                  Edit
                </button>
                <button onClick={() => handleDelete(address._id)} disabled={isLoading}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressManagement;
