/**
 * Client-Side Usage Examples
 * This file demonstrates how to use the AI-Genius API from client applications
 * 
 * Works with: React, Vue, Angular, vanilla JavaScript, or any HTTP client
 */

// ============================================
// USING FETCH API (VANILLA JAVASCRIPT)
// ============================================

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * 1. LOGIN - Get access and refresh tokens
 */
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important: Send/receive cookies
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store access token in localStorage
    localStorage.setItem('accessToken', data.data.accessToken);
    // Refresh token is automatically stored in httpOnly cookie
    
    console.log('✅ Login successful!');
    return data.data;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    throw error;
  }
}

/**
 * 2. ACCESS PROTECTED ENDPOINT - Free Model
 */
async function accessFreeModel() {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/ai/free-model`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to access free model');
    }

    console.log('✅ Free model accessed:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ Free model error:', error.message);
    throw error;
  }
}

/**
 * 3. ACCESS PREMIUM ENDPOINT - Premium Model
 */
async function accessPremiumModel(prompt) {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/ai/premium-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to access premium model');
    }

    console.log('✅ Premium model accessed:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ Premium model error:', error.message);
    throw error;
  }
}

/**
 * 4. ADMIN ENDPOINT - Purge Cache
 */
async function purgeCache() {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/ai/purge-cache`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to purge cache');
    }

    console.log('✅ Cache purged:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ Purge cache error:', error.message);
    throw error;
  }
}

/**
 * 5. REFRESH TOKEN - Get new access token
 */
async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include' // Send refresh token cookie
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    // Update access token
    localStorage.setItem('accessToken', data.data.accessToken);

    console.log('✅ Token refreshed successfully');
    return data.data;
  } catch (error) {
    console.error('❌ Token refresh error:', error.message);
    // Redirect to login on refresh failure
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw error;
  }
}

/**
 * 6. LOGOUT - Invalidate tokens
 */
async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Logout failed');
    }

    // Clear local storage
    localStorage.removeItem('accessToken');

    console.log('✅ Logout successful');
    return data;
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    throw error;
  }
}

// ============================================
// AUTO-REFRESH TOKEN INTERCEPTOR
// ============================================

/**
 * Wrapper for API calls with automatic token refresh
 */
async function apiCall(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('accessToken');

    if (!options.headers) {
      options.headers = {};
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // If token expired, try to refresh
    if (response.status === 401) {
      const errorData = await response.json();

      if (errorData.errorCode === 'TOKEN_EXPIRED') {
        console.log('Token expired, refreshing...');
        
        try {
          await refreshAccessToken();

          // Retry request with new token
          const newToken = localStorage.getItem('accessToken');
          options.headers['Authorization'] = `Bearer ${newToken}`;

          response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          throw refreshError;
        }
      }
    }

    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Example: Complete login flow
 */
async function exampleLoginFlow() {
  try {
    // 1. Login
    await login('admin@ai-genius.com', 'admin123');

    // 2. Access free model
    await accessFreeModel();

    // 3. Access premium model
    await accessPremiumModel('Generate a creative story');

    // 4. Admin operation
    await purgeCache();

    // 5. Logout
    await logout();
  } catch (error) {
    console.error('Flow error:', error);
  }
}

/**
 * Example: Using auto-refresh wrapper
 */
async function exampleWithAutoRefresh() {
  try {
    // Login first
    await login('premium@ai-genius.com', 'premium123');

    // Make API calls - will auto-refresh if needed
    const response = await apiCall('/ai/premium-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Hello AI' })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================
// REACT HOOK EXAMPLE
// ============================================

/**
 * Custom React Hook for API Calls with Auth
 */
function useAuthApi() {
  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('accessToken', data.data.accessToken);
    }
    return data;
  };

  const callApi = async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    
    if (!options.headers) options.headers = {};
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Handle token expiration
    if (response.status === 401) {
      const data = await response.json();
      if (data.errorCode === 'TOKEN_EXPIRED') {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.data.accessToken);

            // Retry original request
            options.headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
            response = await fetch(`${API_BASE_URL}${endpoint}`, options);
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          throw error;
        }
      }
    }

    return response.json();
  };

  return { login, callApi };
}

// ============================================
// EXPORT FOR USE IN MODULES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    login,
    accessFreeModel,
    accessPremiumModel,
    purgeCache,
    refreshAccessToken,
    logout,
    apiCall,
    useAuthApi
  };
}
