const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const CarbonFootprint = sequelize.define('CarbonFootprint', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  electricity_emission: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  transport_emission: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  diet_emission: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  lifestyle_emission: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  total_emission: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  // foreign key user_id will be added via association
}, {
  tableName: 'carbon_footprints',
});

// Define relationships
User.hasMany(CarbonFootprint, { foreignKey: 'user_id' });
CarbonFootprint.belongsTo(User, { foreignKey: 'user_id' });

module.exports = CarbonFootprint;
