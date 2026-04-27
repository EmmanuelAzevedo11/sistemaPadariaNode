const BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// --- Produtos ---
export const ProdutosAPI = {
  getAll: () => request('/produtos'),
  getById: (id) => request(`/produtos/${id}`),
  create: (body) => request('/produtos', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/produtos/${id}`, { method: 'DELETE' }),
};

// --- Status ---
export const StatusAPI = {
  check: () => request('/status'),
};
