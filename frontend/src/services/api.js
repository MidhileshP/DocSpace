import { auth } from '../config/firebase';

const API_BASE_URL = 'http://localhost:5000/api'; // Ensure this is your correct backend URL

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    // Force refresh the token if it's expired.
    return await user.getIdToken(true);
  }
  return null;
};

const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  if (!token) {
    // Handle case where user is not authenticated
    throw new Error('User is not authenticated.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to parse the error message from the backend's JSON response
    const errorBody = await response.json().catch(() => ({
        error: `API request failed with status: ${response.status} ${response.statusText}`
    }));
    // Throw an error with the specific message from the server
    throw new Error(errorBody.error || 'An unknown API error occurred.');
  }

  // For 204 No Content responses (like a successful delete), response.json() will fail.
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const documentApi = {
  getAll: () => apiRequest('/docs'),
  getById: (id) => apiRequest(`/docs/${id}`),
  create: (data) => apiRequest('/docs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/docs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/docs/${id}`, {
    method: 'DELETE',
  }),
  getPermissions: (id) => apiRequest(`/docs/${id}/permissions`),
  share: (id, email, role) => apiRequest(`/docs/${id}/share`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  }),
  removeAccess: (id, userId) => apiRequest(`/docs/${id}/remove_access`, {
      method: 'POST',
      body: JSON.stringify({ userIdToRemove: userId }),
  }),
  getUserDetails: (userIds) => apiRequest('/docs/users/details', {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  }),
};