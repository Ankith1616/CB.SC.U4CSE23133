const mongoose = require('mongoose');
const { Log } = require('../middleware/logging');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    Log('backend', 'info', 'db', `MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    Log('backend', 'fatal', 'db', `Critical database connection failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
