const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  user_email: { type: String, required: true },
  user_name: { type: String, required: true },
  car_id: { type: String, required: true },
  car_name: { type: String, required: true },
  pickup_date: { type: String, required: true },
  return_date: { type: String, required: true },
  pickup_location: { type: String, required: true },
  total_price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  payment_status: { type: String, enum: ['pending','payment_pending','paid','failed','refunded','mock_paid'], default: 'pending' },
  payment_intent_id: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);