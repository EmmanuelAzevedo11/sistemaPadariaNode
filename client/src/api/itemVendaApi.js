import { request } from './client.js';

// --- Item Venda ---
export const ItemVendaAPI = {
  getByVenda: (vendaId) => request(`/itemVenda/${vendaId}`),
  create: (body) => request('/itemVenda', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => request(`/itemVenda/${id}`, { method: 'DELETE' }),
};
