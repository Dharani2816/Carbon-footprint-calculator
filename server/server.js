const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { syncDatabase } = require('./models');
const authRoutes = require('./routes/authRoutes');
const footprintRoutes = require('./routes/footprintRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/footprints', footprintRoutes);

app.get('/', (req, res) => {
    res.send('Carbon Footprint API is running. Please use the frontend application to access the calculator.');
});

syncDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
