import api from './api';

export const saleService = {
  getAll: (page = 1, limit = 10) => api.get(`/sales?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  cancel: (id) => api.put(`/sales/${id}/cancel`),
  print: (id) => api.get(`/sales/${id}/print`, { responseType: 'blob' })
};

