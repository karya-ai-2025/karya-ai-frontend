const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    throw new Error(data.message || 'Agent API call failed');
  }

  return data;
};

export const sendAgentChat = async ({ conversationId, message, clientState }) => (
  apiCall('/agent/chat', 'POST', {
    conversationId,
    message,
    clientState
  })
);

export const getAgentThreadState = async (conversationId) => (
  apiCall(`/agent/thread/${conversationId}/state`)
);

export const saveWebsiteEvidence = async ({ conversationId, url }) => (
  apiCall('/agent/evidence/website', 'POST', {
    conversationId,
    url
  })
);
