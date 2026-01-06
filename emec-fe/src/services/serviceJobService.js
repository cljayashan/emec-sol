import api from './api';

export const serviceJobService = {
  getAll: (page = 1, limit = 10, search = '') => api.get(`/service-jobs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getById: (id) => api.get(`/service-jobs/${id}`),
  create: (data) => api.post('/service-jobs', data),
  update: (id, data) => api.put(`/service-jobs/${id}`, data),
  delete: (id) => api.delete(`/service-jobs/${id}`)
};

