import api from './axios';

export const authApi = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    },

    logout: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
