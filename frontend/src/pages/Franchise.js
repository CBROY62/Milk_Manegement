import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import './Franchise.css';

const Franchise = () => {
  const { user } = useAuth();
  const [franchise, setFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchFranchise();
  }, []);

  const fetchFranchise = async () => {
    try {
      setLoading(true);
      const response = await api.get('/franchises/my-franchise');
      if (response.data.success) {
        setFranchise(response.data.data);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching franchise:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/franchises/apply', formData);
      if (response.data.success) {
        toast.success('Franchise application submitted successfully!');
        setShowForm(false);
        fetchFranchise();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  if (loading) {
    return <div className="franchise-loading">Loading...</div>;
  }

  return (
    <div className="franchise-container">
      <h1>Franchise Program</h1>
      <p className="franchise-intro">
        Join White Craft as a franchise partner and grow your business with us!
      </p>

      {franchise ? (
        <div className="franchise-status-card">
          <h2>Your Franchise Application</h2>
          <div className="franchise-details">
            <p><strong>Name:</strong> {franchise.name}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge ${franchise.status}`}>
                {franchise.status.toUpperCase()}
              </span>
            </p>
            <p><strong>Address:</strong> {franchise.address}</p>
            <p><strong>Phone:</strong> {franchise.phone}</p>
            <p><strong>Email:</strong> {franchise.email}</p>
            {franchise.contractStartDate && (
              <p><strong>Contract Start:</strong> {new Date(franchise.contractStartDate).toLocaleDateString()}</p>
            )}
            {franchise.contractEndDate && (
              <p><strong>Contract End:</strong> {new Date(franchise.contractEndDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {!showForm ? (
            <div className="franchise-info">
              <h2>Why Become a Franchise Partner?</h2>
              <ul>
                <li>Proven business model</li>
                <li>Marketing support</li>
                <li>Training and guidance</li>
                <li>Competitive commission rates</li>
              </ul>
              <button onClick={() => setShowForm(true)} className="btn btn-primary">
                Apply for Franchise
              </button>
            </div>
          ) : (
            <div className="franchise-form-card">
              <h2>Franchise Application</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Franchise Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Franchise;

