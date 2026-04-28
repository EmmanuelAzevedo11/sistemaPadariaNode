import { request } from './client.js';

// --- Status ---
export const StatusAPI = {
  check: () => request('/status'),
};
