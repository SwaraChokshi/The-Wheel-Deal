import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, MapPin, Car, CreditCard } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setBookings(res.data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="user-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="dashboard-title">My Bookings</h1>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="py-20 text-center">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600" data-testid="no-bookings-message">No bookings yet</p>
              <p className="text-gray-500 mt-2">Start exploring our cars and make your first booking!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, idx) => (
              <Card key={booking.id} className="border-none shadow-lg hover:shadow-xl transition-shadow" data-testid={`booking-card-${idx}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2" data-testid={`booking-car-name-${idx}`}>{booking.car_name}</CardTitle>
                      <Badge className={getStatusColor(booking.status)} data-testid={`booking-status-${idx}`}>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Price</p>
                      <p className="text-3xl font-bold text-blue-600" data-testid={`booking-price-${idx}`}>₹{booking.total_price}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pickup Date</p>
                        <p className="font-semibold" data-testid={`booking-pickup-${idx}`}>
                          {new Date(booking.pickup_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-cyan-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Return Date</p>
                        <p className="font-semibold" data-testid={`booking-return-${idx}`}>
                          {new Date(booking.return_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pickup Location</p>
                        <p className="font-semibold" data-testid={`booking-location-${idx}`}>{booking.pickup_location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-semibold">Payment: {booking.payment_status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;