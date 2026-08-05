import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const inactiveAccount = status === 403 && /inactive/i.test(message);
    // Don't wipe/redirect on login form errors — show the message instead
    if (!isLoginRequest && (status === 401 || inactiveAccount)) {
      clearSession();
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
