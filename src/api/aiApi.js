import api from './axios';

export const aiApi = {
    getInsights: async ({ energy, transport, diet, total }) => {
        const response = await api.post('/ai/insights', { energy, transport, diet, total });
        return response.data;
    }
};
