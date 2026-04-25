import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ioe_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ioe_token');
      localStorage.removeItem('ioe_user');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  resetUserPassword: (data) => API.post('/auth/reset-user-password', data),
};

export const papersAPI = {
  list: (params) => API.get('/papers', { params }),
  adminList: (params) => API.get('/papers/admin', { params }),
  upload: (formData) => API.post('/papers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  delete: (id) => API.delete(`/papers/${id}`),
  toggle: (id) => API.patch(`/papers/${id}/toggle`),
  previewUrl: (id) => `${process.env.REACT_APP_API_URL || '/api'}/papers/${id}/preview`,
  downloadUrl: (id) => `${process.env.REACT_APP_API_URL || '/api'}/papers/${id}/download`,
  getSubjects: (params) => API.get('/papers/subjects/list', { params }),
  addSubject: (data) => API.post('/papers/subjects', data),
};

export const universitiesAPI = {
  list: () => API.get('/universities'),
  getDepartments: (id) => API.get(`/universities/${id}/departments`),
  allDepartments: () => API.get('/universities/departments/all'),
  addUniversity: (data) => API.post('/universities', data),
  addDepartment: (id, data) => API.post(`/universities/${id}/departments`, data),
  deleteDepartment: (id) => API.delete(`/universities/departments/${id}`),
};

export const usersAPI = {
  list: () => API.get('/users'),
  create: (data) => API.post('/users', data),
  toggle: (id) => API.patch(`/users/${id}/toggle`),
  delete: (id) => API.delete(`/users/${id}`),
};

export default API;
