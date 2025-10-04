"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

export default function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { customer, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    // Prevent body scroll when modal open
    if (authOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [authOpen]);

  useEffect(() => {
    // Close profile dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (profileOpen && !target.closest('.account-section')) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setProfileOpen(!profileOpen);
    } else {
      setAuthOpen(true);
    }
  };
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon" />
          <div className="logo-text">Furniro</div>
        </div>
        <nav className="nav-menu">
          <a href="/">Home</a>
          <a href="/shop">Shop</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-icons">
          <div className="account-section">
            <button 
              className={`icon-button ${isAuthenticated ? 'authenticated' : ''}`} 
              aria-label="Account" 
              onClick={handleAccountClick}
            >
              <span className="icon-img" aria-hidden="true" style={{backgroundImage: 'url(/image/Vectors.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}} />
              {isAuthenticated && customer && (
                <span className="user-indicator">
                  {customer.firstName.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            
            {profileOpen && isAuthenticated && customer && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {customer.firstName.charAt(0).toUpperCase()}{customer.lastName.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">{customer.fullName}</div>
                    <div className="profile-email">{customer.email}</div>
                  </div>
                </div>
                <div className="profile-menu">
                  <a href="/profile" className="profile-menu-item">
                    <span>👤</span> My Profile
                  </a>
                  <a href="/orders" className="profile-menu-item">
                    <span>📦</span> My Orders
                  </a>
                  <a href="/wishlist" className="profile-menu-item">
                    <span>❤️</span> Wishlist
                  </a>
                  <a href="/addresses" className="profile-menu-item">
                    <span>📍</span> Addresses
                  </a>
                  <div className="profile-divider"></div>
                  <button 
                    className="profile-menu-item logout" 
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    <span>🚪</span> {isLoading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <span className="icon-img" aria-label="Search" style={{backgroundImage: 'url(/image/akar-icons_search.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}} />
          <span className="icon-img" aria-label="Wishlist" style={{backgroundImage: 'url(/image/akar-icons_heart.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}} />
          <span className="cart-icon-wrap">
            <span className="icon-img" id="cartIconBtn" aria-label="Cart" style={{backgroundImage: 'url(/image/ant-design_shopping-cart-outlined.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}} />
            <span className="cart-badge" id="cartCountBadge" aria-hidden="true">0</span>
          </span>
        </div>
      </div>
      <div className="cart-overlay" id="cartOverlay"></div>
      <aside className="cart-drawer" id="cartDrawer" aria-hidden="true">
        <div className="cart-header">
          <div className="cart-title">Shopping Cart</div>
          <button className="cart-close" id="cartCloseBtn">×</button>
        </div>
        <div className="cart-items" id="cartItems"></div>
        <div className="cart-footer">
          <div className="cart-subtotal"><span>Subtotal</span><strong id="cartSubtotal">$ 0</strong></div>
          <div className="cart-actions">
            <button className="cart-action-btn light">Cart</button>
            <button className="cart-action-btn primary">Checkout</button>
            <button className="cart-action-btn light">Comparison</button>
          </div>
        </div>
      </aside>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}


