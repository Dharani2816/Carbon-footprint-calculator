const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { syncDatabase } = require('./models');
const authRoutes = require('./routes/authRoutes');
const footprintRoutes = require('./routes/footprintRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const aiController = require('./controllers/aiController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log('REQ', req.method, req.originalUrl);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/footprints', footprintRoutes);
app.use('/api/ai', aiRoutes);
// Explicit mount to avoid any router registration edge cases
app.post('/api/ai/insights', authMiddleware, aiController.generateInsights);

console.log('Routes mounted? auth/footprints/ai');
console.log('Router after mount exists?', !!app._router);
console.log('App keys', Object.keys(app));

app.get('/', (req, res) => {
    res.send('Carbon Footprint API is running. Please use the frontend application to access the calculator.');
});

syncDatabase().then(() => {
    const listRoutes = () => {
        const routes = [];
        const stack = app?._router?.stack || app?.router?.stack || [];
        stack.forEach((middleware) => {
            if (middleware.route) {
                const path = middleware.route.path;
                const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
                routes.push(`${methods} ${path}`);
            } else if (middleware.name === 'router') {
                const prefix = middleware.regexp?.toString();
                middleware.handle.stack.forEach((handler) => {
                    const route = handler.route;
                    if (route) {
                        const methods = Object.keys(route.methods).join(',').toUpperCase();
                        routes.push(`${methods} ${prefix} ${route.path}`);
                    }
                });
            }
        });
        console.log('Registered routes:', routes);
    };

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        listRoutes();
    });
}).catch((err) => {
    console.error('❌ Failed to start server:', err.message || err);
    process.exit(1);
});
