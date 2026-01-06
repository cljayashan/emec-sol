import api from './api';

export const vehicleDefectService = {
  getAll: (page = 1, limit = 10, search = '') => api.get(`/vehicle-defects?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getById: (id) => api.get(`/vehicle-defects/${id}`),
  create: (data) => api.post('/vehicle-defects', data),
  update: (id, data) => api.put(`/vehicle-defects/${id}`, data),
  delete: (id) => api.delete(`/vehicle-defects/${id}`)
};

