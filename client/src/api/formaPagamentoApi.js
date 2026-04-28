import { request } from './client.js';

// --- Forma de Pagamento ---
export const FormaPagamentoAPI = {
  getAll: () => request('/formaPagamento'),
  getById: (id) => request(`/formaPagamento/${id}`),
  create: (body) => request('/formaPagamento', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/formaPagamento/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/formaPagamento/${id}`, { method: 'DELETE' }),
};
