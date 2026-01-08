import api from './api';

export const serviceJobService = {
  getAll: (page = 1, limit = 10, search = '', date = '') => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (date) params.append('date', date);
    return api.get(`/service-jobs?${params}`);
  },
  getById: (id) => api.get(`/service-jobs/${id}`),
  create: (data) => api.post('/service-jobs', data),
  update: (id, data) => api.put(`/service-jobs/${id}`, data),
  delete: (id) => api.delete(`/service-jobs/${id}`)
};

