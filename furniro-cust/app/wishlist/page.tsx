"use client";

import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function WishlistPage() {
  const { customer } = useAuth();

  return (
    <ProtectedRoute>
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1>My Wishlist</h1>
            <p>Save items you love for later</p>
          </div>

          <div className="wishlist-content">
            <div className="empty-state">
              <div className="empty-icon">❤️</div>
              <h2>Your wishlist is empty</h2>
              <p>Start adding items to your wishlist by clicking the heart icon on any product.</p>
              <a href="/shop" className="shop-btn">Discover Products</a>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
