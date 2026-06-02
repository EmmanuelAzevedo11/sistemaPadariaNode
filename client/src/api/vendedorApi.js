import { request } from './client.js';

// --- Vendedor ---
export const VendedorAPI = {
  getAll: () => request('/vendedor'),
  getById: (id) => request(`/vendedor/${id}`),
  create: (body) => request('/vendedor', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/vendedor/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/vendedor/${id}`, { method: 'DELETE' }),
};
