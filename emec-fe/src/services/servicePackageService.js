import api from './api';

export const servicePackageService = {
  getAll: (page = 1, limit = 10, search = '') => api.get(`/service-packages?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getById: (id) => api.get(`/service-packages/${id}`),
  create: (data) => api.post('/service-packages', data),
  update: (id, data) => api.put(`/service-packages/${id}`, data),
  delete: (id) => api.delete(`/service-packages/${id}`)
};
