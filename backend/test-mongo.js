const mongoose = require('mongoose');
require('dotenv').config();

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'car_rental_db';

console.log('Testing MongoDB connection...');
console.log(`URL: ${mongoUrl}`);
console.log(`Database: ${dbName}`);

mongoose.connect(mongoUrl, {
  dbName: dbName
})
.then(() => {
  console.log('✓ MongoDB Connected successfully');
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});