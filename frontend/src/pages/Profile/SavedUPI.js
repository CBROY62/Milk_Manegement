import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const SavedUPI = () => {
  const [upiIds, setUpiIds] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUPI, setNewUPI] = useState('');

  const handleAddUPI = () => {
    if (!newUPI.trim()) {
      toast.error('Please enter UPI ID');
      return;
    }

    if (!newUPI.includes('@')) {
      toast.error('Invalid UPI ID format');
      return;
    }

    setUpiIds([...upiIds, newUPI]);
    setNewUPI('');
    setIsAdding(false);
    toast.success('UPI ID saved');
  };

  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <div className="profile-section-header">
          <h2 className="profile-section-title">Saved UPI</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="profile-edit-link"
          >
            {isAdding ? 'Cancel' : 'Add UPI'}
          </button>
        </div>

        {isAdding && (
          <div className="profile-section-form">
            <div className="profile-form-group">
              <input
                type="text"
                value={newUPI}
                onChange={(e) => setNewUPI(e.target.value)}
                placeholder="yourname@paytm"
                className="profile-input"
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
                onClick={handleAddUPI}
                className="profile-btn profile-btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="profile-section-content">
          {upiIds.length === 0 ? (
            <p>No UPI IDs saved. Add your UPI ID for faster checkout.</p>
          ) : (
            upiIds.map((upi, index) => (
              <div key={index} className="profile-info-row">
                <span className="profile-info-value">{upi}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedUPI;
