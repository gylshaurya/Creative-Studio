const BASE_URL = 'http://localhost:8000/api';

const apiClient = {
  // GET fn
  async get(endpoint) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  // POST fn
  async post(endpoint, data) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to post data');
    return response.json();
  }
};
export { apiClient };