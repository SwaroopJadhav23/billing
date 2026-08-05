import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
