# The Wheel Deal
A MERN Stack Car Rental Web Application

The Wheel Deal is a full-stack car rental platform built using the MERN stack with Tailwind CSS and EJS templates. It provides secure authentication, car exploration, booking functionality with availability checks, Stripe payment integration, and an admin panel to manage cars and bookings.

## Key Features
* Secure JWT-based authentication for signup and login (supports both header and cookie-based auth)
* Supports roles: Guest, User, and Admin
* Users can browse cars with details, search, and filter options
* Booking system with date selection and real-time availability validation
* Integrated Stripe payment gateway for secure transactions
* Mock payment option for development/testing
* Server-side rendered user dashboard using EJS
* Admin panel to add, update, and delete cars and manage all bookings
* Responsive UI built using React and Tailwind CSS
* RESTful API with comprehensive endpoints

## Tech Stack
* **Frontend**: React, Tailwind CSS
* **Backend**: Node.js, Express.js, MongoDB, EJS (for server-side rendering)
* **Authentication**: JWT (JSON Web Tokens)
* **Payment Gateway**: Stripe
* **Database**: MongoDB with Mongoose ODM
* **Additional Libraries**: bcryptjs, multer, express-validator

## Folder Structure
```
The-Wheel-Deal/
│
├── frontend/                 # React + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── backend/                  # Node.js + Express Backend
│   ├── views/                # EJS templates
│   │   ├── partials/
│   │   │   └── navbar.ejs
│   │   └── userDashboard.ejs
│   ├── public/               # Static assets
│   ├── server.js             # Main server file
│   ├── package.json
│   └── .env                  # Environment variables
│
└── README.md
```

## Installation & Setup

### Prerequisites
* Node.js (v14 or higher)
* MongoDB (local or MongoDB Atlas)
* Stripe Account (for payment integration)

### Clone the Repository
```bash
git clone https://github.com/SwaraChokshi/The-Wheel-Deal.git
cd The-Wheel-Deal
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=8001
MONGO_URL=your_mongodb_connection_string
DB_NAME=wheel_deal
JWT_SECRET_KEY=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CORS_ORIGINS=http://localhost:3000
NODE_ENV=development
```

4. Start the backend server:
```bash
node server.js
```

Backend will run at: `http://localhost:8001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run at: `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/admin-login` | Admin login | No |
| POST | `/api/admin/register` | Create admin account | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Car Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cars` | Get all available cars (supports location filter) | No |
| GET | `/api/cars/:carId` | Get car details by ID | No |
| POST | `/api/cars` | Create new car listing | Yes (Admin) |
| PUT | `/api/cars/:carId` | Update car details | Yes (Admin) |
| DELETE | `/api/cars/:carId` | Delete car listing | Yes (Admin) |

### Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookings/availability` | Check car availability for date range | No |
| POST | `/api/bookings` | Create new booking | Yes |
| GET | `/api/bookings` | Get current user's bookings | Yes |
| GET | `/api/bookings/:bookingId` | Get booking details by ID | Yes |
| DELETE | `/api/bookings/:bookingId` | Delete/cancel booking | Yes |
| POST | `/api/bookings/:bookingId/mock-pay` | Mock payment (dev only) | Yes |
| PUT | `/api/bookings/:bookingId/status` | Update booking status | Yes (Admin) |
| GET | `/api/admin/bookings` | Get all bookings | Yes (Admin) |

### Payment Endpoints (Stripe)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create-payment-intent` | Create Stripe payment intent | Yes |
| POST | `/capture-payment` | Capture payment (manual capture) | Yes |

### Additional Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload` | Upload car image (base64) | Yes (Admin) |
| GET | `/test-dashboard` | Test user dashboard (dev only) | No |
| GET | `/` | API health check | No |

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Backend server port | 8001 |
| MONGO_URL | MongoDB connection string | mongodb://localhost:27017 |
| DB_NAME | Database name | wheel_deal |
| JWT_SECRET_KEY | Secret key for JWT tokens | your_secret_key_here |
| STRIPE_SECRET_KEY | Stripe API secret key | sk_test_... |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | whsec_... |
| CORS_ORIGINS | Allowed CORS origins | http://localhost:3000 |
| NODE_ENV | Environment mode | development/production |





## Third-Party Libraries & Tools

### Backend Dependencies
* **express** - Web framework for Node.js
* **mongoose** - MongoDB object modeling
* **bcryptjs** - Password hashing
* **jsonwebtoken** - JWT authentication
* **cors** - Cross-origin resource sharing
* **dotenv** - Environment variable management
* **stripe** - Payment processing
* **multer** - File upload handling
* **express-validator** - Request validation
* **ejs** - Template engine for server-side rendering

### Frontend Dependencies
* **react** - UI library
* **react-router-dom** - Client-side routing
* **tailwindcss** - Utility-first CSS framework
* **axios** - HTTP client


## Future Enhancements
* Email notifications for booking confirmations
* User reviews and ratings
* Real-time chat support
* Mobile app version

