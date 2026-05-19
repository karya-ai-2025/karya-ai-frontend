'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Start with SSR-safe defaults — both server and client render the same initial state,
  // preventing hydration mismatches. localStorage is read only in useEffect (client-only).
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Runs only on the client after hydration
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Restore from cache immediately — unblocks navbar/route-guards without any network wait
    try {
      const cached = localStorage.getItem('user');
      if (cached) setUser(JSON.parse(cached));
    } catch {}
    setLoading(false); // render instantly from cache

    // Background re-validate — abort cleanly on unmount (React Strict Mode safe)
    const controller = new AbortController();
    checkAuth(controller.signal);
    return () => controller.abort('unmount');
  }, []);

  // Check authentication status
  // signal is optional — pass one from useEffect for cleanup, omit for manual calls
  const checkAuth = async (signal) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        ...(signal ? { signal } : {}),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else if (response.status === 401) {
        // Token is invalid/expired — clear and force fresh login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      // Any other status (5xx, etc.) — keep cached user, server may be temporarily down
    } catch (err) {
      if (err.name === 'AbortError') {
        // Component unmounted or navigation happened — silently keep cached user, do NOT clear token
        return;
      }
      // Network error (backend unreachable) — keep cached user so user stays logged in
      console.warn('Auth background check failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password, role = 'owner') => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(data.message || `Login failed (${response.status})`);
      }

      const data = await response.json();

      localStorage.removeItem('myProjects'); // clear previous user's cached projects
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout function - callers handle navigation via their own useRouter
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('myProjects');
      setUser(null);
    }
  };

  // Switch role function
  const switchRole = async (newRole) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/switch-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to switch role');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Create additional profile
  const createProfile = async (profileType, profileData = {}) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/create-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ profileType, profileData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create profile');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Change password (logged in user)
  const changePassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      // Update token if returned
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Deactivate account
  const deactivateAccount = async (password) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/deactivate`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deactivate account');
      }

      // Clear local storage and user state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Resend verification email
  const resendVerification = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: user?.email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend verification');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get auth header for API calls
  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Utility getters
  const isAuthenticated = !!user;
  const activeRole = user?.activeRole || 'owner';
  const hasOwnerProfile = user?.hasOwnerProfile || false;
  const hasExpertProfile = user?.hasExpertProfile || false;
  const canSwitchRole = hasOwnerProfile && hasExpertProfile;

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    activeRole,
    hasOwnerProfile,
    hasExpertProfile,
    canSwitchRole,
    login,
    register,
    logout,
    switchRole,
    createProfile,
    updateProfile,
    changePassword,
    deactivateAccount,
    resendVerification,
    checkAuth,
    getAuthHeader,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
