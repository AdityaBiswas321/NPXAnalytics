import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Helper to get API URL
const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [iframeToken, setIframeToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          setLoading(true);
          const response = await fetch(`${backendURL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            // Also refresh the iframeToken
            refreshIframeToken();
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error("Authentication error:", err);
          setError("Authentication failed");
          logout();
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
  }, [token]);

  // Refresh ephemeral token function
  const refreshIframeToken = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${backendURL}/auth/refresh-iframe-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setIframeToken(data.iframeToken);
      } else {
        console.error("Failed to refresh iframe token");
      }
    } catch (err) {
      console.error("Error refreshing iframe token:", err);
    }
  };

  // Set up periodic refresh of the iframe token
  useEffect(() => {
    let interval;
    if (token) {
      interval = setInterval(refreshIframeToken, 90000); // every 90 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Save token and user data
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIframeToken(data.iframeToken);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIframeToken(null);
  };

  // Use tokens function
  const spendTokens = async (amount) => {
    if (!token || !user) return false;
    
    try {
      const response = await fetch(`${backendURL}/inference/use-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tokenCount: amount })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to use tokens');
      }
      
      // Update user with new token balance
      setUser({
        ...user,
        tokenBalance: data.newBalance
      });
      
      return true;
    } catch (err) {
      console.error("Error using tokens:", err);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    token,
    iframeToken,
    loading,
    error,
    login,
    signup,
    logout,
    spendTokens,
    refreshIframeToken
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 