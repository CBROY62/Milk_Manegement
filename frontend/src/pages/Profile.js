import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      // Split name into first and last name
      const nameParts = (user.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        gender: user.gender || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSectionEdit = (section) => {
    setEditingSection(section);
  };

  const handleSectionCancel = () => {
    // Reset form data to original user data
    if (user) {
      const nameParts = (user.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        gender: user.gender || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setEditingSection(null);
  };

  const handleSectionSave = async (section) => {
    if (!user?._id) {
      toast.error('User information not available');
      return;
    }

    try {
      setLoading({ [section]: true });
      let updateData = {};

      if (section === 'personal') {
        // Combine firstName and lastName
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        updateData = {
          name: fullName,
          gender: formData.gender
        };
      } else if (section === 'email') {
        // Email is typically read-only, but handle if needed
        toast.info('Email cannot be changed');
        setEditingSection(null);
        return;
      } else if (section === 'mobile') {
        updateData = {
          phone: formData.phone
        };
      }

      const response = await api.put(`/users/${user._id}`, updateData);
      
      if (response.data.success) {
        updateUser(response.data.data);
        toast.success('Profile updated successfully!');
        setEditingSection(null);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading({ [section]: false });
    }
  };

  const formatGender = (gender) => {
    if (!gender) return '';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  if (!user) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-sections">
        {/* Personal Information Section */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <h2 className="profile-section-title">Personal Information</h2>
            {editingSection !== 'personal' && (
              <button
                onClick={() => handleSectionEdit('personal')}
                className="profile-edit-link"
              >
                Edit
              </button>
            )}
          </div>

          {editingSection === 'personal' ? (
            <div className="profile-section-form">
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="profile-input"
                  />
                </div>
                <div className="profile-form-group">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="profile-input"
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Your Gender</label>
                <div className="profile-radio-group">
                  <label className="profile-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleInputChange}
                      className="profile-radio"
                    />
                    <span>Male</span>
                  </label>
                  <label className="profile-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleInputChange}
                      className="profile-radio"
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div className="profile-section-actions">
                <button
                  onClick={handleSectionCancel}
                  className="profile-btn profile-btn-secondary"
                  disabled={loading.personal}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSectionSave('personal')}
                  className="profile-btn profile-btn-primary"
                  disabled={loading.personal}
                >
                  {loading.personal ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-section-content">
              <div className="profile-info-row">
                <span className="profile-info-label">Name:</span>
                <span className="profile-info-value">{user.name || 'N/A'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Gender:</span>
                <span className="profile-info-value">{formatGender(user.gender) || 'Not specified'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Email Address Section */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <h2 className="profile-section-title">Email Address</h2>
            {editingSection !== 'email' && (
              <button
                onClick={() => handleSectionEdit('email')}
                className="profile-edit-link"
              >
                Edit
              </button>
            )}
          </div>

          {editingSection === 'email' ? (
            <div className="profile-section-form">
              <div className="profile-form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="profile-input profile-input-disabled"
                />
                <p className="profile-help-text">
                  Email address cannot be changed. Please contact support if you need to update your email.
                </p>
              </div>
              <div className="profile-section-actions">
                <button
                  onClick={handleSectionCancel}
                  className="profile-btn profile-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-section-content">
              <div className="profile-info-row">
                <span className="profile-info-label">Email:</span>
                <span className="profile-info-value">{user.email || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Number Section */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <h2 className="profile-section-title">Mobile Number</h2>
            {editingSection !== 'mobile' && (
              <button
                onClick={() => handleSectionEdit('mobile')}
                className="profile-edit-link"
              >
                Edit
              </button>
            )}
          </div>

          {editingSection === 'mobile' ? (
            <div className="profile-section-form">
              <div className="profile-form-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Mobile Number"
                  className="profile-input"
                />
              </div>
              <div className="profile-section-actions">
                <button
                  onClick={handleSectionCancel}
                  className="profile-btn profile-btn-secondary"
                  disabled={loading.mobile}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSectionSave('mobile')}
                  className="profile-btn profile-btn-primary"
                  disabled={loading.mobile}
                >
                  {loading.mobile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-section-content">
              <div className="profile-info-row">
                <span className="profile-info-label">Mobile:</span>
                <span className="profile-info-value">{user.phone || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* FAQs Section */}
        <div className="profile-section-card profile-faqs-card">
          <h2 className="profile-section-title">FAQs</h2>
          <div className="profile-faqs-content">
            <div className="profile-faq-item">
              <h3 className="profile-faq-question">
                What happens when I update my email address (or mobile number)?
              </h3>
              <p className="profile-faq-answer">
                Your email address and mobile number are used for account verification and important notifications. 
                When you update these details, you may need to verify the new information through a verification code 
                sent to your new email or mobile number.
              </p>
            </div>

            <div className="profile-faq-item">
              <h3 className="profile-faq-question">
                When will my account be updated with the new email address (or mobile number)?
              </h3>
              <p className="profile-faq-answer">
                Your account will be updated immediately after you verify the new email address or mobile number. 
                You will receive a verification code that you need to enter to complete the update process.
              </p>
            </div>

            <div className="profile-faq-item">
              <h3 className="profile-faq-question">
                What happens to my existing account when I update my email address (or mobile number)?
              </h3>
              <p className="profile-faq-answer">
                Your account remains the same with all your data, orders, and preferences intact. Only your contact 
                information (email or mobile number) will be updated. All your account history and settings will 
                remain unchanged.
              </p>
            </div>

            <div className="profile-faq-item">
              <h3 className="profile-faq-question">
                Does my account get affected when I update my email address?
              </h3>
              <p className="profile-faq-answer">
                No, your account will not be affected. All your orders, subscriptions, payment history, and other 
                account information will remain the same. Only your email address for login and notifications will be updated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
