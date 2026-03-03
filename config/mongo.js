const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB || 'carbonapp';

const connectMongo = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI not configured');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB });
  console.log('✅ Mongo connected');
  return mongoose.connection;
};

module.exports = { connectMongo };