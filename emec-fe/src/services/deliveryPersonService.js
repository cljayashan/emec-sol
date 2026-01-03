import api from './api';

export const deliveryPersonService = {
  getAll: (page = 1, limit = 10) => api.get(`/delivery-persons?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/delivery-persons/${id}`),
  create: (data) => api.post('/delivery-persons', data),
  update: (id, data) => api.put(`/delivery-persons/${id}`, data),
  delete: (id) => api.delete(`/delivery-persons/${id}`)
};

