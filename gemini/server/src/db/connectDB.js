// src/db/connectDB.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/todo-mern';
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // autoIndex will be true by default; we can set false in production for performance.
  };

  let attempts = 0;
  const maxRetries = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  while (attempts < maxRetries) {
    try {
      await mongoose.connect(mongoURI, options);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      attempts += 1;
      console.warn(`MongoDB connection attempt ${attempts} failed. Retrying in ${attempts * 2}s...`);
      await delay(attempts * 2000);
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
};

module.exports = connectDB;
