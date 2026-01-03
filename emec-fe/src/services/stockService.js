import api from './api';

export const stockService = {
  getAll: (page = 1, limit = 10, itemId = null) => {
    const params = new URLSearchParams({ page, limit });
    if (itemId) params.append('itemId', itemId);
    return api.get(`/stock?${params}`);
  },
  getBatchesByItemId: (itemId) => api.get(`/stock/batches/${itemId}`),
  adjust: (data) => api.post('/stock/adjust')
};

