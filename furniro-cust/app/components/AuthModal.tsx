"use client";

import { useState } from "react";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-brand">
          <div className="modal-logo" aria-hidden="true" />
          <div className="modal-brand-text">Furniro</div>
        </div>

        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 id="authModalTitle" className="modal-title">{tab === "login" ? "Welcome back" : "Create your account"}</h2>
            <p className="modal-subtitle">{tab === "login" ? "Sign in to continue shopping and track your orders." : "Join us to save your favorites and checkout faster."}</p>
          </div>
          <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`modal-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        {tab === "login" ? (
          <form className="modal-body" onSubmit={(e) => e.preventDefault()}>
            <label className="modal-label">
              Email address
              <input type="email" className="modal-input" placeholder="you@example.com" required />
            </label>
            <label className="modal-label">
              Password
              <input type="password" className="modal-input" placeholder="••••••••" required />
            </label>
            <div className="modal-row">
              <label className="modal-checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a className="modal-link" href="#">Forgot password?</a>
            </div>
            <button className="modal-primary-btn" type="submit">Sign in</button>

            <div className="modal-divider"><span>or continue with</span></div>
            <div className="modal-socials">
              <button type="button" className="modal-social-btn google" aria-label="Sign in with Google">
                <span className="social-icon google" /> Google
              </button>
              <button type="button" className="modal-social-btn facebook" aria-label="Sign in with Facebook">
                <span className="social-icon facebook" /> Facebook
              </button>
              <button type="button" className="modal-social-btn github" aria-label="Sign in with GitHub">
                <span className="social-icon github" /> GitHub
              </button>
            </div>
          </form>
        ) : (
          <form className="modal-body" onSubmit={(e) => e.preventDefault()}>
            <div className="modal-grid-2">
              <label className="modal-label">
                Full name
                <input type="text" className="modal-input" placeholder="Your name" required />
              </label>
              <label className="modal-label">
                Phone (optional)
                <input type="tel" className="modal-input" placeholder="+84 ..." />
              </label>
            </div>
            <label className="modal-label">
              Email address
              <input type="email" className="modal-input" placeholder="you@example.com" required />
            </label>
            <div className="modal-grid-2">
              <label className="modal-label">
                Password
                <input type="password" className="modal-input" placeholder="Create a password" required />
              </label>
              <label className="modal-label">
                Confirm password
                <input type="password" className="modal-input" placeholder="Repeat password" required />
              </label>
            </div>
            <label className="modal-checkbox">
              <input type="checkbox" required />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>
            <button className="modal-primary-btn" type="submit">Create account</button>

            <div className="modal-divider"><span>or sign up with</span></div>
            <div className="modal-socials">
              <button type="button" className="modal-social-btn google"><span className="social-icon google" /> Google</button>
              <button type="button" className="modal-social-btn facebook"><span className="social-icon facebook" /> Facebook</button>
              <button type="button" className="modal-social-btn github"><span className="social-icon github" /> GitHub</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


