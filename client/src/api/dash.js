import { request } from './client.js';

// --- Dashboard de Métricas ---
export const DashboardAPI = {
    getSummary: (inicio = '', fim = '') => {
        let url = '/dashboard/summary';

        if (inicio || fim) {
            url += `?inicio=${inicio}&fim=${fim}`;
        }

        return request(url, { method: 'GET' });
    }
};