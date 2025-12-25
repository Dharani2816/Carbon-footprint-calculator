// Mock Footprint Service

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to get data from localStorage (simulating database)
const getDb = () => {
    const data = localStorage.getItem('mock_db_footprints');
    return data ? JSON.parse(data) : [];
};

const saveDb = (data) => {
    localStorage.setItem('mock_db_footprints', JSON.stringify(data));
};

export const footprintApi = {
    saveFootprint: async (footprintData) => {
        await delay(600);
        
        const newRecord = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            ...footprintData
        };

        const db = getDb();
        db.push(newRecord);
        saveDb(db);

        return newRecord;
    },

    getHistory: async () => {
        await delay(500);
        const db = getDb();
        
        // If DB is empty, return some initial mock data for demo purposes
        if (db.length === 0) {
            const initialMockData = [
                {
                    id: 1,
                    date: '2024-10-15',
                    total: 4200,
                    breakdown: { electricity: 1200, transport: 1500, diet: 1000, lifestyle: 500 }
                },
                {
                    id: 2,
                    date: '2024-11-20',
                    total: 3800,
                    breakdown: { electricity: 1100, transport: 1200, diet: 1000, lifestyle: 500 }
                },
                {
                    id: 3,
                    date: '2024-12-25',
                    total: 4500,
                    breakdown: { electricity: 1300, transport: 1600, diet: 1100, lifestyle: 500 }
                }
            ];
            saveDb(initialMockData);
            return initialMockData;
        }

        return db;
    },

    getLatestFootprint: async () => {
        await delay(300);
        const db = getDb();
        return db.length > 0 ? db[db.length - 1] : null;
    }
};
