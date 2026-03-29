const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const TOKEN_KEY = 'tc_web_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request('/auth/me');
  },
  createProject(payload) {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  listProjects(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        search.set(key, value);
      }
    });
    const query = search.toString();
    return request(`/projects${query ? `?${query}` : ''}`);
  },

  likeProject(projectId) {
  // Ajout de /api au début du chemin
  return request(`/api/projects/${projectId}/like`, {
    method: 'POST',
  });
},

  dislikeProject(projectId) {
    return request(`/api/projects/${projectId}/dislike`, {
      method: 'POST', // Ou 'PATCH'
    });
  },

unlikeProject(projectId) {
  // Ajout de /api au début du chemin
  return request(`/api/projects/${projectId}/like`, {
    method: 'DELETE',
  });
},
  myProjects() {
    return request('/me/projects');
  },
  myLikes() {
    return request('/me/likes');
  },
};
