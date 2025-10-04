// API configuration and client functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Auth API functions
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    customer: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
      phone?: string;
      isEmailVerified: boolean;
      isActive: boolean;
      lastLogin?: string;
    };
    accessToken: string;
    expiresIn: number;
  };
  error?: string;
}

export interface CustomerMeResponse {
  success: boolean;
  data: {
    customer: {
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
    };
  };
  error?: string;
}

// Customer Authentication API
export const customerAuth = {
  // Register new customer
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  // Login customer
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify(data),
    });

    return response.json();
  },

  // Get current customer info
  me: async (accessToken: string): Promise<CustomerMeResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    return response.json();
  },

  // Logout customer
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    return response.json();
  },

  // Refresh access token
  refresh: async (): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    return response.json();
  },
};

// Utility functions for token management
export const tokenUtils = {
  // Store access token in localStorage
  setAccessToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customerAccessToken', token);
    }
  },

  // Get access token from localStorage
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customerAccessToken');
    }
    return null;
  },

  // Remove access token
  removeAccessToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customerAccessToken');
    }
  },

  // Check if token is expired (basic check)
  isTokenExpired: (expiresIn: number): boolean => {
    return Date.now() / 1000 > expiresIn;
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error?.error) {
    return error.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Product API functions
export async function fetchProducts(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  category?: string;
  search?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.category) searchParams.append('category', params.category);
  if (params.search) searchParams.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/api/public/products?${searchParams}`, {
    cache: 'no-store', // Disable caching to get fresh data
    next: { revalidate: 0 } // Revalidate immediately
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/public/products/${id}`, {
    cache: 'no-store', // Disable caching to get fresh data
    next: { revalidate: 0 } // Revalidate immediately
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }
  
  return response.json();
}

// Utility functions
export function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

export function getProductImage(product: any, index: number = 0): string {
  if (product.images && product.images.length > index) {
    return `${API_BASE_URL}${product.images[index]}`;
  }
  return '/image/placeholder.png';
}

export function calculateDiscountPercentage(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// Customer Authentication functions (for compatibility)
export async function customerRegister(data: RegisterData): Promise<{ success: boolean; error?: string; customer?: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Registration failed' };
    }
    return { success: true, customer: result.data.customer };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export async function customerLogin(data: LoginData): Promise<{ success: boolean; error?: string; customer?: any; accessToken?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Login failed' };
    }
    return { success: true, customer: result.data.customer, accessToken: result.data.accessToken };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export async function customerLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Logout failed' };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export async function customerMe(token: string): Promise<{ success: boolean; error?: string; customer?: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to fetch customer profile' };
    }
    return { success: true, customer: result.data.customer };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export async function customerRefreshToken(): Promise<{ success: boolean; error?: string; accessToken?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to refresh token' };
    }
    return { success: true, accessToken: result.data.accessToken };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}