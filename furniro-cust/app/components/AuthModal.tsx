"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, isLoading } = useAuth();

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    const result = await login({ email, password, rememberMe });

    if (result.success) {
      onClose(); // Close modal on successful login
    } else {
      setError(result.error || "Login failed. Please try again.");
    }

    setIsSubmitting(false);
  };

  // Handle register form submission
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const phone = formData.get("phone") as string;
    const acceptsMarketing = formData.get("acceptsMarketing") === "on";

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (!firstName) {
      setError("Please enter your full name");
      setIsSubmitting(false);
      return;
    }

    const result = await register({
      email,
      password,
      firstName,
      lastName,
      phone: phone || undefined,
      acceptsMarketing,
    });

    if (result.success) {
      onClose(); // Close modal on successful registration
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }

    setIsSubmitting(false);
  };

  // Clear error when switching tabs
  const handleTabChange = (newTab: "login" | "register") => {
    setTab(newTab);
    setError("");
  };

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
            onClick={() => handleTabChange("login")}
          >
            Login
          </button>
          <button
            className={`modal-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => handleTabChange("register")}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="modal-error" role="alert">
            {error}
          </div>
        )}

        {tab === "login" ? (
          <form className="modal-body" onSubmit={handleLogin}>
            <label className="modal-label">
              Email address
              <input 
                type="email" 
                name="email"
                className="modal-input" 
                placeholder="you@example.com" 
                required 
                disabled={isSubmitting || isLoading}
              />
            </label>
            <label className="modal-label">
              Password
              <input 
                type="password" 
                name="password"
                className="modal-input" 
                placeholder="••••••••" 
                required 
                disabled={isSubmitting || isLoading}
              />
            </label>
            <div className="modal-row">
              <label className="modal-checkbox">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  disabled={isSubmitting || isLoading}
                />
                <span>Remember me</span>
              </label>
              <a className="modal-link" href="#">Forgot password?</a>
            </div>
            <button 
              className="modal-primary-btn" 
              type="submit" 
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? "Signing in..." : "Sign in"}
            </button>

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
          <form className="modal-body" onSubmit={handleRegister}>
            <div className="modal-grid-2">
              <label className="modal-label">
                Full name
                <input 
                  type="text" 
                  name="fullName"
                  className="modal-input" 
                  placeholder="Your name" 
                  required 
                  disabled={isSubmitting || isLoading}
                />
              </label>
              <label className="modal-label">
                Phone (optional)
                <input 
                  type="tel" 
                  name="phone"
                  className="modal-input" 
                  placeholder="+84 ..." 
                  disabled={isSubmitting || isLoading}
                />
              </label>
            </div>
            <label className="modal-label">
              Email address
              <input 
                type="email" 
                name="email"
                className="modal-input" 
                placeholder="you@example.com" 
                required 
                disabled={isSubmitting || isLoading}
              />
            </label>
            <div className="modal-grid-2">
              <label className="modal-label">
                Password
                <input 
                  type="password" 
                  name="password"
                  className="modal-input" 
                  placeholder="Create a password" 
                  required 
                  disabled={isSubmitting || isLoading}
                />
              </label>
              <label className="modal-label">
                Confirm password
                <input 
                  type="password" 
                  name="confirmPassword"
                  className="modal-input" 
                  placeholder="Repeat password" 
                  required 
                  disabled={isSubmitting || isLoading}
                />
              </label>
            </div>
            <label className="modal-checkbox">
              <input 
                type="checkbox" 
                name="acceptsMarketing"
                disabled={isSubmitting || isLoading}
              />
              <span>I would like to receive marketing emails</span>
            </label>
            <label className="modal-checkbox">
              <input 
                type="checkbox" 
                required 
                disabled={isSubmitting || isLoading}
              />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>
            <button 
              className="modal-primary-btn" 
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? "Creating account..." : "Create account"}
            </button>

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


