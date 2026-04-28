const BASE_URL = 'http://localhost:3000';

/**
 * Generic fetch wrapper for JSON API calls.
 * @param {string} endpoint - API path (e.g. '/produtos')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} parsed JSON response
 */
export async function request(endpoint, options = {}) {
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
