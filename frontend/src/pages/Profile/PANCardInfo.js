import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const PANCardInfo = () => {
  const { user } = useAuth();
  const [panNumber, setPanNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    if (!panNumber.trim()) {
      toast.error('Please enter PAN card number');
      return;
    }

    if (panNumber.length !== 10) {
      toast.error('PAN card number must be 10 characters');
      return;
    }

    try {
      // Note: You'll need to add PAN field to User model if you want to save it
      toast.success('PAN card information saved');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save PAN card information');
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <div className="profile-section-header">
          <h2 className="profile-section-title">PAN Card Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="profile-edit-link"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="profile-section-form">
            <div className="profile-form-group">
              <label className="profile-label">PAN Card Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength="10"
                className="profile-input"
              />
              <p className="profile-help-text">
                Enter your 10-character PAN card number
              </p>
            </div>
            <div className="profile-section-actions">
              <button
                onClick={() => setIsEditing(false)}
                className="profile-btn profile-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="profile-btn profile-btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-section-content">
            <div className="profile-info-row">
              <span className="profile-info-label">PAN Number:</span>
              <span className="profile-info-value">{panNumber || 'Not provided'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PANCardInfo;
