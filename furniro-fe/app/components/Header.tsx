"use client";

import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

export default function Header() {
  const [authOpen, setAuthOpen] = useState(false);

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
          <button className="icon-button" aria-label="Account" onClick={() => setAuthOpen(true)}>
            <span className="icon-img" aria-hidden="true" style={{backgroundImage: 'url(/image/Vectors.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}} />
          </button>
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


