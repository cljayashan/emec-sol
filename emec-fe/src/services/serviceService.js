import api from './api';

export const serviceService = {
  getAll: (page = 1, limit = 10, search = '') => api.get(`/services?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
};
