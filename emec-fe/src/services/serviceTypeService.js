import api from './api';

export const serviceTypeService = {
  getAll: (page = 1, limit = 10, search = '') => api.get(`/service-types?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getById: (id) => api.get(`/service-types/${id}`),
  create: (data) => api.post('/service-types', data),
  update: (id, data) => api.put(`/service-types/${id}`, data),
  delete: (id) => api.delete(`/service-types/${id}`)
};

