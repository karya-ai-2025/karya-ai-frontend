const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    credentials: 'include'
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }
  return data;
};

export const getConversations = async (page = 1, limit = 50) => {
  return apiCall(`/conversations?page=${page}&limit=${limit}`);
};

export const getConversation = async (id) => {
  return apiCall(`/conversations/${id}`);
};

export const createConversation = async (title) => {
  return apiCall('/conversations', 'POST', title ? { title } : {});
};

export const addMessage = async (conversationId, role, content) => {
  return apiCall(`/conversations/${conversationId}/messages`, 'POST', { role, content });
};

export const updateConversation = async (id, updates) => {
  return apiCall(`/conversations/${id}`, 'PUT', updates);
};

export const deleteConversation = async (id) => {
  return apiCall(`/conversations/${id}`, 'DELETE');
};
