import api from './api';

export const itemCategoryService = {
  getAll: (page = 1, limit = 10) => api.get(`/item-categories?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/item-categories/${id}`),
  create: (data) => api.post('/item-categories', data),
  update: (id, data) => api.put(`/item-categories/${id}`, data),
  delete: (id) => api.delete(`/item-categories/${id}`)
};

