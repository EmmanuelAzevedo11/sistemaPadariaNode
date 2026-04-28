import { request } from './client.js';

// --- Categorias ---
export const CategoriasAPI = {
  getAll: () => request('/categorias'),
  getById: (id) => request(`/categorias/${id}`),
  create: (body) => request('/categorias', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
};
