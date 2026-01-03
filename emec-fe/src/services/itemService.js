import api from './api';

export const itemService = {
  getAll: (page = 1, limit = 10, search = '') => api.get(`/items?page=${page}&limit=${limit}&search=${search}`),
  getById: (id) => api.get(`/items/${id}`),
  getByBarcode: (barcode) => api.get(`/items/barcode/${barcode}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`)
};

