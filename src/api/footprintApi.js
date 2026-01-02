import api from './axios';

const mapToBackend = (data) => ({
    electricity_emission: data.breakdown.electricity,
    transport_emission: data.breakdown.transport,
    diet_emission: data.breakdown.diet,
    lifestyle_emission: data.breakdown.lifestyle,
    total_emission: data.total
});

const mapToFrontend = (data) => ({
    id: data.id,
    date: new Date(data.createdAt).toISOString().split('T')[0],
    total: data.total_emission,
    breakdown: {
        electricity: data.electricity_emission,
        transport: data.transport_emission,
        diet: data.diet_emission,
        lifestyle: data.lifestyle_emission
    }
});

export const footprintApi = {
    saveFootprint: async (footprintData) => {
        const payload = mapToBackend(footprintData);
        const response = await api.post('/footprints', payload);
        return mapToFrontend(response.data);
    },

    getHistory: async () => {
        const response = await api.get('/footprints/history');
        return response.data.map(mapToFrontend);
    },

    getLatestFootprint: async () => {
        try {
            const response = await api.get('/footprints/latest');
            return mapToFrontend(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw error;
        }
    }
};
