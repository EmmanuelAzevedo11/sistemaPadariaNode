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
  finalizarEstoque: (vendaId) => {
    // Pega o token que você salvou no login
    const token = localStorage.getItem('@padaria:token');

    return request(`/venda/${vendaId}/finalizar-estoque`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 👇 ENVIA A CHAVE DE ACESSO QUE O AUTHMIDDLEWARE DO BACKEND EXIGE
        'Authorization': `Bearer ${token}`
      }
    });
  },

};
