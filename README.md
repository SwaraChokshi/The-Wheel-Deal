# The Wheel Deal

A MERN Stack Car Rental Web Application

**The Wheel Deal** is a full-stack car rental platform built using the MERN stack with Tailwind CSS. It provides secure authentication, car exploration, booking functionality with availability checks, and an admin panel to manage cars and bookings.

## Key Features

- Secure JWT-based authentication for signup and login
- Supports roles: Guest, User, and Admin
- Users can browse cars with details, search, and filter options
- Booking system with date selection and availability validation
- Admins can add, update, and delete cars and view all bookings
- Responsive UI built using React and Tailwind CSS
- Backend powered by Node.js, Express, and MongoDB

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT

## Folder Structure
```
The-Wheel-Deal/
│
├── frontend/                 # React + Tailwind Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                 # Node.js + Express Backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
│
└── README.md
```

## Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/SwaraChokshi/The-Wheel-Deal.git
cd The-Wheel-Deal
```

### Backend Setup
```bash
cd server
npm install
node server.js
```

### Frontend Setup
```bash
cd ../client
npm install
npm start
```

The application will run at: **http://localhost:3000**

## Future Enhancements

- Image upload system
- Email notifications for bookings




