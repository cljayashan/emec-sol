import api from './api';

export const vehicleModelService = {
  getAll: (page = 1, limit = 10, search = '', brandId = '') => {
    let url = `/vehicle-models?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (brandId) {
      url += `&brand_id=${encodeURIComponent(brandId)}`;
    }
    return api.get(url);
  },
  getById: (id) => api.get(`/vehicle-models/${id}`),
  create: (data) => api.post('/vehicle-models', data),
  update: (id, data) => api.put(`/vehicle-models/${id}`, data),
  delete: (id) => api.delete(`/vehicle-models/${id}`)
};

