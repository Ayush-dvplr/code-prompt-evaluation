// server/src/db/connectDB.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-mern';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // these options are now default in mongoose 8, but keep for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

export default connectDB;
