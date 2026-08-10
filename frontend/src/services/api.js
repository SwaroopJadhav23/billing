import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export function setAuthTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('token', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
  setAuthTokens({ accessToken: data.accessToken || data.token, refreshToken: data.refreshToken });
  return data.accessToken || data.token;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    const original = error.config;
    const isAuthRoute = original?.url?.includes('/auth/login')
      || original?.url?.includes('/auth/refresh')
      || original?.url?.includes('/auth/forgot');

    if (status === 401 && !original?._retry && !isAuthRoute && localStorage.getItem('refreshToken')) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        refreshPromise = null;
        clearAuthTokens();
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.replace('/');
        }
        return Promise.reject(error);
      }
    }

    const inactiveAccount = status === 403 && /inactive/i.test(message);
    if (!isAuthRoute && (status === 401 || inactiveAccount) && !localStorage.getItem('refreshToken')) {
      clearAuthTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/forgot') && !window.location.pathname.startsWith('/reset') && window.location.pathname !== '/') {
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);

export const listResource = async (resource, params) => {
  const { data } = await api.get(`/${resource}`, { params });
  return data;
};

export const createResource = async (resource, payload) => {
  const { data } = await api.post(`/${resource}`, payload);
  return data;
};

export const updateResource = async (resource, id, payload) => {
  const { data } = await api.put(`/${resource}/${id}`, payload);
  return data;
};

export const deleteResource = async (resource, id) => {
  const { data } = await api.delete(`/${resource}/${id}`);
  return data;
};
