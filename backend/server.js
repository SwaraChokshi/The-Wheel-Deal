// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || ''); // set in .env

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME
})
.then(() => console.log('✓ MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  created_at: { type: Date, default: Date.now }
});

const carSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price_per_day: { type: Number, required: true },
  image_url: { type: String, required: true },
  location: { type: String, required: true },
  seats: { type: Number, required: true },
  transmission: { type: String, required: true },
  fuel_type: { type: String, required: true },
  availability: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

// booking defaults to pending/payment_pending so checkout is required
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

const User = mongoose.model('User', userSchema);
const Car = mongoose.model('Car', carSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Helpers
const generateId = () => require('crypto').randomUUID();
const generateToken = (userId, role) => jwt.sign({ sub: userId, role }, process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production', { expiresIn: '7d' });

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production');
    const user = await User.findOne({ id: decoded.sub }).select('-password');
    if (!user) return res.status(401).json({ detail: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ detail: 'Admin access required' });
  next();
};

// Multer for uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----------------- API Routes ------------------

// Auth: register
app.post('/api/auth/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('username').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ detail: 'Invalid input data', errors: errors.array() });

    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ detail: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();
    const newUser = new User({ id: userId, username, email, password: hashedPassword, role: 'user' });
    await newUser.save();

    const token = generateToken(userId, 'user');
    res.json({ token, user: { id: userId, username, email, role: 'user' } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ detail: 'Registration failed' });
  }
});

// Auth: login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ detail: 'Invalid credentials' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ detail: 'Invalid credentials' });

    if (user.role === 'admin') return res.status(403).json({ detail: 'Admin users should use admin login' });

    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Login failed' });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ detail: 'Invalid credentials' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ detail: 'Invalid credentials' });
    if (user.role !== 'admin') return res.status(403).json({ detail: 'Not an admin user' });

    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ detail: 'Admin login failed' });
  }
});

app.post('/api/admin/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ detail: 'username, email and password are required' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ detail: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();
    const newAdmin = new User({ id: userId, username, email, password: hashedPassword, role: 'admin' });
    await newAdmin.save();

    const responseUser = newAdmin.toObject();
    delete responseUser._id; delete responseUser.__v; delete responseUser.password;
    res.json({ message: 'Admin created', user: responseUser });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ detail: 'Failed to create admin' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role });
});

// Cars
app.get('/api/cars', async (req, res) => {
  try {
    const { location } = req.query;
    const query = { availability: true };
    if (location) query.location = location;
    const cars = await Car.find(query).select('-_id -__v');
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ detail: 'Failed to fetch cars' });
  }
});

app.get('/api/cars/:carId', async (req, res) => {
  try {
    const car = await Car.findOne({ id: req.params.carId }).select('-_id -__v');
    if (!car) return res.status(404).json({ detail: 'Car not found' });
    res.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ detail: 'Failed to fetch car' });
  }
});

app.post('/api/cars', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, brand, model, year, price_per_day, image_url, location, seats, transmission, fuel_type } = req.body;
    const newCar = new Car({ id: generateId(), name, brand, model, year, price_per_day, image_url, location, seats, transmission, fuel_type, availability: true });
    await newCar.save();
    const carResponse = newCar.toObject(); delete carResponse._id; delete carResponse.__v;
    res.json(carResponse);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ detail: 'Failed to create car' });
  }
});

app.put('/api/cars/:carId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await Car.updateOne({ id: req.params.carId }, { $set: req.body });
    if (result.matchedCount === 0) return res.status(404).json({ detail: 'Car not found' });
    res.json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ detail: 'Failed to update car' });
  }
});

app.delete('/api/cars/:carId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await Car.deleteOne({ id: req.params.carId });
    if (result.deletedCount === 0) return res.status(404).json({ detail: 'Car not found' });
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ detail: 'Failed to delete car' });
  }
});

// ============================================
// BOOKINGS ROUTES - ORDER IS CRITICAL!
// ============================================

// 1. PUBLIC availability endpoint MUST come FIRST (no auth required)
// This MUST be before other /api/bookings routes to avoid authentication errors
app.get('/api/bookings/availability', async (req, res) => {
  try {
    const { pickup, return: returnDate } = req.query;

    // base filter: exclude cancelled
    const baseFilter = { status: { $ne: 'cancelled' } };

    if (!pickup || !returnDate) {
      // no date range: return all minimal bookings
      const bookings = await Booking.find(baseFilter)
        .select('car_id pickup_date return_date status -_id')
        .lean();
      console.log(`[Availability] Returning all bookings: ${bookings.length} found`);
      return res.json(bookings);
    }

    // Normalize dates to YYYY-MM-DD for consistent comparison
    const reqPickup = pickup.split('T')[0];
    const reqReturn = returnDate.split('T')[0];

    // Get all bookings and filter in memory to handle date comparison properly
    const allBookings = await Booking.find(baseFilter)
      .select('car_id pickup_date return_date status -_id')
      .lean();

    // Filter bookings that overlap with requested date range
    const overlappingBookings = allBookings.filter(booking => {
      const bPickup = booking.pickup_date.split('T')[0];
      const bReturn = booking.return_date.split('T')[0];
      
      // Check overlap: NOT (one ends before the other starts)
      return !(reqReturn < bPickup || reqPickup > bReturn);
    });

    console.log(`[Availability] Date range: ${reqPickup} to ${reqReturn}`);
    console.log(`[Availability] Total bookings: ${allBookings.length}, Overlapping: ${overlappingBookings.length}`);
    
    return res.json(overlappingBookings);
  } catch (err) {
    console.error('Error fetching availability bookings', err);
    res.status(500).json({ detail: 'Failed to fetch availability bookings' });
  }
});

// 2. Create booking (authenticated)
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { car_id, pickup_date, return_date, pickup_location } = req.body;

    const car = await Car.findOne({ id: car_id });
    if (!car) return res.status(404).json({ detail: 'Car not found' });

    if (!car.availability) return res.status(400).json({ detail: 'Car not available' });

    // Check overlapping bookings
    const reqPickup = new Date(pickup_date);
    const reqReturn = new Date(return_date);
    const existingBookings = await Booking.find({ car_id: car_id });
    for (const b of existingBookings) {
      if (b.status === 'cancelled') continue;
      const bPickup = new Date(b.pickup_date);
      const bReturn = new Date(b.return_date);
      const noOverlap = reqReturn < bPickup || reqPickup > bReturn;
      if (!noOverlap) return res.status(400).json({ detail: 'Car already booked for selected dates' });
    }

    // Calculate total price
    const pickup = new Date(pickup_date);
    const returnDate = new Date(return_date);
    const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24)) + 1;
    const total_price = days * car.price_per_day;

    // create booking as pending/payment_pending so checkout is required
    const newBooking = new Booking({
      id: generateId(),
      user_id: req.user.id,
      user_email: req.user.email,
      user_name: req.user.username,
      car_id,
      car_name: car.name,
      pickup_date,
      return_date,
      pickup_location,
      total_price,
      status: 'pending',
      payment_status: 'payment_pending'
    });

    await newBooking.save();
    const bookingResponse = newBooking.toObject(); delete bookingResponse._id; delete bookingResponse.__v;
    res.json(bookingResponse);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ detail: 'Failed to create booking' });
  }
});

// 3. Delete booking (authenticated)
app.delete('/api/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ id: req.params.bookingId });
    if (!booking) return res.status(404).json({ detail: 'Booking not found' });

    if (booking.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ detail: 'Not allowed' });

    if (booking.payment_status === 'paid' && req.user.role !== 'admin') return res.status(400).json({ detail: 'Cannot delete a paid booking' });

    await Booking.deleteOne({ id: req.params.bookingId });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Error deleting booking', err);
    res.status(500).json({ detail: 'Failed to delete booking' });
  }
});

// 4. Mock-pay endpoint (authenticated) - DEV ONLY
app.post('/api/bookings/:bookingId/mock-pay', authenticateToken, async (req, res) => {
  try {
    // optional: disable in production automatically
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ detail: 'Mock-pay disabled in production' });
    }

    const bookingId = req.params.bookingId;
    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) return res.status(404).json({ detail: 'Booking not found' });

    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Not allowed' });
    }

    if (booking.payment_status === 'paid' || booking.payment_status === 'mock_paid') {
      return res.status(400).json({ detail: 'Booking already marked paid' });
    }

    booking.payment_status = 'mock_paid';
    booking.status = 'confirmed';
    booking.payment_intent_id = `mock:${Date.now()}`;
    await booking.save();

    res.json({ message: 'Booking marked as paid (mock)', bookingId: booking.id });
  } catch (err) {
    console.error('Mock-pay error:', err);
    res.status(500).json({ detail: 'Failed to mark booking as paid (mock)' });
  }
});

// 5. Get current user's bookings (authenticated)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id }).select('-_id -__v');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ detail: 'Failed to fetch bookings' });
  }
});

// 6. Get booking by id (authenticated)
app.get('/api/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ id: req.params.bookingId }).select('-_id -__v');
    if (!booking) return res.status(404).json({ detail: 'Booking not found' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ detail: 'Not allowed' });
    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking by id', err);
    res.status(500).json({ detail: 'Failed to fetch booking' });
  }
});

// 7. Admin: get all bookings (authenticated + admin)
app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({}).select('-_id -__v');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ detail: 'Failed to fetch bookings' });
  }
});

// 8. Admin: update status (authenticated + admin)
app.put('/api/bookings/:bookingId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const result = await Booking.updateOne({ id: req.params.bookingId }, { $set: { status } });
    if (result.matchedCount === 0) return res.status(404).json({ detail: 'Booking not found' });
    res.json({ message: 'Booking status updated' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ detail: 'Failed to update booking' });
  }
});

// Image upload for admins
app.post('/api/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: 'No file uploaded' });
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;
    res.json({ url: dataUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ detail: 'Failed to upload image' });
  }
});

// ---------- Stripe Endpoints & Webhook ----------

// Create PaymentIntent for a booking (returns client secret)
app.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { bookingId, currency = 'inr', capture_method = 'automatic' } = req.body;
    if (!bookingId) return res.status(400).json({ detail: 'bookingId is required' });

    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) return res.status(404).json({ detail: 'Booking not found' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ detail: 'Not allowed' });

    const amountInPaise = Math.round(booking.total_price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency,
      capture_method,
      metadata: { bookingId: booking.id }
    });

    booking.payment_status = 'payment_pending';
    booking.payment_intent_id = paymentIntent.id;
    await booking.save();

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error('Error creating payment intent', err);
    res.status(500).json({ detail: 'Failed to create payment intent' });
  }
});

// Optional: capture payment endpoint (if using manual capture)
app.post('/capture-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, amount_to_capture } = req.body;
    if (!paymentIntentId) return res.status(400).json({ detail: 'paymentIntentId required' });

    const booking = await Booking.findOne({ payment_intent_id: paymentIntentId });
    if (booking && booking.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ detail: 'Not allowed' });

    const pi = await stripe.paymentIntents.capture(paymentIntentId, amount_to_capture ? { amount_to_capture } : {});
    if (booking) {
      booking.payment_status = 'paid';
      await booking.save();
    }
    res.json(pi);
  } catch (err) {
    console.error('Error capturing payment', err);
    res.status(500).json({ detail: err.message || 'Failed to capture payment' });
  }
});

// Stripe webhook (raw body)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (!webhookSecret) {
      event = JSON.parse(req.body.toString());
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId;
        if (bookingId) await Booking.updateOne({ id: bookingId }, { $set: { payment_status: 'paid' } });
        else await Booking.updateOne({ payment_intent_id: pi.id }, { $set: { payment_status: 'paid' } });
        console.log('PaymentIntent succeeded:', pi.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId;
        if (bookingId) await Booking.updateOne({ id: bookingId }, { $set: { payment_status: 'failed' } });
        else await Booking.updateOne({ payment_intent_id: pi.id }, { $set: { payment_status: 'failed' } });
        console.log('PaymentIntent failed:', pi.id);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const piId = charge.payment_intent;
        if (piId) await Booking.updateOne({ payment_intent_id: piId }, { $set: { payment_status: 'refunded' } });
        console.log('Charge refunded:', charge.id);
        break;
      }
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error handling webhook event:', err);
  }

  res.json({ received: true });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'The Wheel Deal API Server' });
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;