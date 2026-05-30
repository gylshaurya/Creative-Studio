const BASE_URL = 'http://localhost:8000/api';

/**
 * Updated to use 'access' to match your partner's fetch.js
 * This ensures both clients see the same logged-in user.
 */
const getCleanToken = () => {
  const token = localStorage.getItem('access');
    
  if (!token) return null;
  // Removes potential quotes if stored as a JSON string
  return token.replace(/^["']|["']$/g, '');
};

/**
 * Updated to use 'refresh' and 'access' keys
 */
const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh');
    
  if (!refresh) return false;
  
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    
    if (res.ok) {
      const data = await res.json();
      // Update the 'access' key so all API calls use the new token
      localStorage.setItem('access', data.access);
      return true;
    }
  } catch (err) {
    console.error("Token refresh failed", err);
  }
  
  return false;
};

const apiClient = {
  async get(endpoint) {
    const token = getCleanToken();
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) return apiClient.get(endpoint);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error('Network response was not ok');
      error.response = { data: errorData };
      throw error;
    }
    
    return response.json();
  },

  async post(endpoint, data) {
    const token = getCleanToken();
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) return apiClient.post(endpoint, data);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error('Failed to post data');
      error.response = { data: errorData };
      throw error;
    }
    
    return response.json();
  },

  async patch(endpoint, data) {
    const token = getCleanToken();
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) return apiClient.patch(endpoint, data);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error('Failed to patch data');
      error.response = { data: errorData };
      throw error;
    }

    return response.json();
  },

  async delete(endpoint) {
    const token = getCleanToken();
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) return apiClient.delete(endpoint);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error('Failed to delete');
      error.response = { data: errorData };
      throw error;
    }

    if (response.status === 204) return null;
    return response.json();
  }
};

export { apiClient };