"use client";

import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function OrdersPage() {
  const { customer } = useAuth();

  return (
    <ProtectedRoute>
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>Order History</h1>
            <p>Track your orders and view order details</p>
          </div>

          <div className="orders-content">
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h2>No orders found</h2>
              <p>You haven't placed any orders yet. Start shopping to see your order history here.</p>
              <a href="/shop" className="shop-btn">Browse Products</a>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
