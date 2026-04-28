import { request } from './client.js';

// --- Vendas ---
export const VendasAPI = {
  getAll: () => request('/venda'),
  getById: (id) => request(`/venda/${id}`),
  create: (body) => {
    console.log('Sending Venda:', body);
    return request('/venda', { method: 'POST', body: JSON.stringify(body) });
  },
  update: (id, body) => request(`/venda/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/venda/${id}`, { method: 'DELETE' }),
};
