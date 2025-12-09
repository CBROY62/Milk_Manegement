import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const ManageAddresses = () => {
  const { user, updateUser } = useAuth();
  const [addresses, setAddresses] = useState([user?.address || '']);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState('');

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    try {
      const response = await api.put(`/users/${user._id}`, { address: newAddress });
      if (response.data.success) {
        updateUser(response.data.data);
        setAddresses([newAddress]);
        setNewAddress('');
        setIsAdding(false);
        toast.success('Address added successfully');
      }
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <div className="profile-section-header">
          <h2 className="profile-section-title">Manage Addresses</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="profile-edit-link"
          >
            {isAdding ? 'Cancel' : 'Add New Address'}
          </button>
        </div>

        {isAdding && (
          <div className="profile-section-form">
            <div className="profile-form-group">
              <textarea
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter your address"
                className="profile-input profile-textarea"
                rows="4"
              />
            </div>
            <div className="profile-section-actions">
              <button
                onClick={() => setIsAdding(false)}
                className="profile-btn profile-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                className="profile-btn profile-btn-primary"
              >
                Save Address
              </button>
            </div>
          </div>
        )}

        <div className="profile-section-content">
          {addresses.length === 0 ? (
            <p>No addresses saved. Add your first address above.</p>
          ) : (
            addresses.map((address, index) => (
              <div key={index} className="profile-info-row">
                <span className="profile-info-value">{address || 'No address provided'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAddresses;
