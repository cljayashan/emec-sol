import api from './api';

export const supplierService = {
  getAll: (page = 1, limit = 10) => api.get(`/suppliers?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`)
};

