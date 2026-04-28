import { request } from './client.js';

// --- Produtos ---
export const ProdutosAPI = {
  getAll: () => request('/produtos'),
  getById: (id) => request(`/produtos/${id}`),
  create: (body) => request('/produtos', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/produtos/${id}`, { method: 'DELETE' }),
};
