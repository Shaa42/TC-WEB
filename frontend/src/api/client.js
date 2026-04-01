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
    return request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  listProjects(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (entry === undefined || entry === null) {
            return;
          }
          const trimmed = String(entry).trim();
          if (trimmed !== '') {
            search.append(key, trimmed);
          }
        });
        return;
      }
      const trimmedValue = String(value).trim();
      if (trimmedValue !== '') {
        search.set(key, trimmedValue);
      }
    });
    const query = search.toString();
    return request(`/api/projects${query ? `?${query}` : ''}`);
  },
  listLabels() {
    return request('/api/labels');
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
