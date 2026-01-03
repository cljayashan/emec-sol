import api from './api';

export const quotationService = {
  getAll: (page = 1, limit = 10) => api.get(`/quotations?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  delete: (id) => api.delete(`/quotations/${id}`)
};

