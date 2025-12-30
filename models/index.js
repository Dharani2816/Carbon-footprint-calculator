const sequelize = require('../config/db');
const User = require('./User');
const CarbonFootprint = require('./CarbonFootprint');

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        await sequelize.sync({ alter: true }); // Automatically updates schema if changed
        console.log('Models synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, User, CarbonFootprint, syncDatabase };
