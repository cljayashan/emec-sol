import api from './api';

export const purchaseService = {
  getAll: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (filters.billNumber) params.append('billNumber', filters.billNumber);
    if (filters.date) params.append('date', filters.date);
    return api.get(`/purchases?${params}`);
  },
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  cancel: (id) => api.put(`/purchases/${id}/cancel`),
  print: (id) => api.get(`/purchases/${id}/print`, { responseType: 'blob' })
};

