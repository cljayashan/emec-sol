import api from './api';

export const brandService = {
  getAll: (page = 1, limit = 10, search = '') => api.get(`/vehicle-brands?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getById: (id) => api.get(`/vehicle-brands/${id}`),
  create: (data) => api.post('/vehicle-brands', data),
  update: (id, data) => api.put(`/vehicle-brands/${id}`, data),
  delete: (id) => api.delete(`/vehicle-brands/${id}`)
};

