const BASE_URL = 'http://localhost:3000';

/**
 * Generic fetch wrapper for JSON API calls.
 * @param {string} endpoint - API path (e.g. '/produtos')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} parsed JSON response
 */
export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  // 1. Busca o token que o login salvou no navegador
  const token = localStorage.getItem('@padaria:token');

  // 2. Monta os headers base
  const headers = {
    'Content-Type': 'application/json'
  };

  // 3. Se o token existir, coloca ele no cabeçalho de Autorização
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 4. Junta tudo garantindo que os headers do "options" não apaguem o token
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}