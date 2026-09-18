const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper to make authenticated requests with token
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('memai_auth_token');
  const userId = localStorage.getItem('memai_user_id') || '00000000-0000-0000-0000-000000000001';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : { 'x-user-id': userId }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Chat
  sendMessage: (payload) => request('/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Conversations
  getConversations: () => request('/conversations'),
  getConversation: (id) => request(`/conversations/${id}`),
  createConversation: (title) => request('/conversations', {
    method: 'POST',
    body: JSON.stringify({ title })
  }),
  updateConversation: (id, updates) => request(`/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteConversation: (id) => request(`/conversations/${id}`, {
    method: 'DELETE'
  }),

  // Memories
  getMemories: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    return request(`/memories?${query.toString()}`);
  },
  getMemoryStats: () => request('/memories/stats'),
  createMemory: (memoryData) => request('/memories', {
    method: 'POST',
    body: JSON.stringify(memoryData)
  }),
  updateMemory: (id, updates) => request(`/memories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteMemory: (id) => request(`/memories/${id}`, {
    method: 'DELETE'
  }),
  clearAllMemories: () => request('/memories', {
    method: 'DELETE'
  }),

  // Profile & Settings
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData) => request('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData)
  })
};
