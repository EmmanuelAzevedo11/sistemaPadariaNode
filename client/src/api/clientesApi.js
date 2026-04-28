import { request } from './client.js';

// --- Clientes ---
export const ClientesAPI = {
  getAll: () => request('/clientes'),
  getById: (id) => request(`/clientes/${id}`),
  create: (body) => request('/clientes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/clientes/${id}`, { method: 'DELETE' }),
};
