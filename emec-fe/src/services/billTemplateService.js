import api from './api';

export const billTemplateService = {
  getByType: (type) => api.get(`/bill-templates/${type}`),
  create: (data) => api.post('/bill-templates', data),
  update: (id, data) => api.put(`/bill-templates/${id}`, data)
};

