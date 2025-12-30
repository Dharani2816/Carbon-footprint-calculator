const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { syncDatabase } = require('./models');
const authRoutes = require('./routes/authRoutes');
const footprintRoutes = require('./routes/footprintRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/footprints', footprintRoutes);

// Database Sync and Server Start
syncDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
