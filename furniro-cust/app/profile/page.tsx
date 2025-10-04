"use client";

import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useState } from 'react';

export default function ProfilePage() {
  const { customer, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    acceptsMarketing: customer?.acceptsMarketing || false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // TODO: Implement profile update API
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      acceptsMarketing: customer?.acceptsMarketing || false,
    });
    setIsEditing(false);
  };

  return (
    <ProtectedRoute>
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Account</h1>
            <p>Manage your account settings and preferences</p>
          </div>

          <div className="profile-content">
            <div className="profile-sidebar">
              <div className="profile-nav">
                <button 
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <span>👤</span> Profile Information
                </button>
                <button 
                  className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <span>📦</span> Order History
                </button>
                <button 
                  className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  <span>📍</span> Addresses
                </button>
              </div>
            </div>

            <div className="profile-main">
              {activeTab === 'profile' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Profile Information</h2>
                    {!isEditing && (
                      <button 
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="profile-form">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={isEditing ? 'editable' : 'readonly'}
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={isEditing ? 'editable' : 'readonly'}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={isEditing ? 'editable' : 'readonly'}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={isEditing ? 'editable' : 'readonly'}
                      />
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="acceptsMarketing"
                          checked={formData.acceptsMarketing}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        <span>I would like to receive marketing emails</span>
                      </label>
                    </div>

                    {isEditing && (
                      <div className="form-actions">
                        <button className="save-btn" onClick={handleSave}>
                          Save Changes
                        </button>
                        <button className="cancel-btn" onClick={handleCancel}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Order History</h2>
                  </div>
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No orders yet</h3>
                    <p>When you place your first order, it will appear here.</p>
                    <a href="/shop" className="shop-btn">Start Shopping</a>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Addresses</h2>
                    <button className="add-btn">Add Address</button>
                  </div>
                  <div className="empty-state">
                    <div className="empty-icon">📍</div>
                    <h3>No addresses saved</h3>
                    <p>Add an address to make checkout faster.</p>
                    <button className="add-btn">Add Your First Address</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
