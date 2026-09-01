const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/retreat_booking_db';
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Remote Connection Failed]: ${error.message}`);
    try {
      console.log('[MongoDB]: Attempting fallback connection to local MongoDB instance (127.0.0.1:27017)...');
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/retreat_booking_db');
      console.log(`[MongoDB Connected Local Fallback]: ${conn.connection.host}`);
    } catch (localError) {
      console.error(`[MongoDB Fatal Error]: ${localError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
