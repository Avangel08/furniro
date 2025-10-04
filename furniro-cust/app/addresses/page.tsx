"use client";

import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AddressesPage() {
  const { customer } = useAuth();

  return (
    <ProtectedRoute>
      <div className="addresses-page">
        <div className="addresses-container">
          <div className="addresses-header">
            <h1>My Addresses</h1>
            <p>Manage your shipping and billing addresses</p>
          </div>

          <div className="addresses-content">
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <h2>No addresses saved</h2>
              <p>Add an address to make checkout faster and track your orders.</p>
              <button className="add-btn">Add Your First Address</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
