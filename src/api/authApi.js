// Mock Auth Service
// In a real app, these would be axios calls to the backend

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
    login: async (email, password) => {
        await delay(800); // Simulate network delay
        
        // Mock validation
        if (password === 'error') {
            throw new Error('Invalid credentials');
        }

        const mockUser = {
            id: '1',
            name: 'Demo User',
            email: email,
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        // Persist to localStorage (simulating what the context/browser would do with a real response)
        // Note: In a real app, the Context handles storage, but for this mock service to be stateful 
        // across reloads if needed, we might check storage. 
        // However, the Context calls this, so we just return the data.
        
        return {
            user: mockUser,
            token: mockToken
        };
    },

    register: async (name, email, password) => {
        await delay(1000);
        
        const mockUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        return {
            user: mockUser,
            token: mockToken
        };
    },

    logout: async () => {
        await delay(200);
        // Backend logout logic if any (e.g., invalidating token)
    }
};
