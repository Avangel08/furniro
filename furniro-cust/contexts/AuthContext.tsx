'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { customerAuth, tokenUtils, handleApiError } from '../lib/api';
import type { RegisterData, LoginData } from '../lib/api';

interface Customer {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  addresses: any[];
  totalOrders: number;
  totalSpent: number;
  lastLogin?: string;
}

interface AuthContextType {
  // State
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // Utils
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = tokenUtils.getAccessToken();
      
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      // Try to get customer info with current token
      const response = await customerAuth.me(accessToken);
      
      if (response.success) {
        setCustomer(response.data.customer);
        setIsAuthenticated(true);
      } else {
        // Token might be expired, try to refresh
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          // Refresh failed, clear token
          tokenUtils.removeAccessToken();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      tokenUtils.removeAccessToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await customerAuth.login(data);
      
      if (response.success) {
        // Store access token
        tokenUtils.setAccessToken(response.data.accessToken);
        
        // Set customer data
        setCustomer(response.data.customer);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: handleApiError(error) };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await customerAuth.register(data);
      
      if (response.success) {
        // Store access token
        tokenUtils.setAccessToken(response.data.accessToken);
        
        // Set customer data
        setCustomer(response.data.customer);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: handleApiError(error) };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API to clear refresh token
      await customerAuth.logout();
      
      // Clear local state
      tokenUtils.removeAccessToken();
      setCustomer(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      tokenUtils.removeAccessToken();
      setCustomer(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await customerAuth.refresh();
      
      if (response.success) {
        // Update access token
        tokenUtils.setAccessToken(response.data.accessToken);
        
        // Update customer data if provided
        if (response.data.customer) {
          setCustomer(response.data.customer);
          setIsAuthenticated(true);
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    customer,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
