import api from './api';

export const preInspectionRecommendationService = {
  getAll: (page = 1, limit = 10, search = '') => api.get(`/pre-inspection-recommendations?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getById: (id) => api.get(`/pre-inspection-recommendations/${id}`),
  create: (data) => api.post('/pre-inspection-recommendations', data),
  update: (id, data) => api.put(`/pre-inspection-recommendations/${id}`, data),
  delete: (id) => api.delete(`/pre-inspection-recommendations/${id}`)
};

