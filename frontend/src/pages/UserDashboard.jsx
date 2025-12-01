import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, MapPin, Car, CreditCard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDashboard = () => {
  const { user, openAuth } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        openAuth && openAuth('login');
        setBookings([]);
        return;
      }
      const res = await axios.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data || []);

      // scroll & highlight last booking once
      const lastBookingId = localStorage.getItem('lastBookingId');
      if (lastBookingId) {
        setTimeout(() => {
          const el = document.querySelector(`[data-booking-id="${lastBookingId}"]`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // optional visual highlight — remove the key after showing once
            // localStorage.removeItem('lastBookingId');
          }
        }, 200);
      }
    } catch (err) {
      console.error(err);
      toast?.error(err.response?.data?.detail || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // optional: poll every 15s to update payment status
    const interval = setInterval(fetchBookings, 15000);
    return () => clearInterval(interval);
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

  const wantsPayment = (payment_status) => {
    // treat these states as requiring checkout
    return ['payment_pending', 'pending', 'payment_failed'].includes(payment_status);
  };

  const handleCheckout = (bookingId) => {
    navigate(`/checkout/${bookingId}`);
  };

  const handleDelete = async (bookingId) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast?.success(res.data?.message || 'Booking deleted');
      // refresh
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast?.error(err.response?.data?.detail || 'Failed to delete booking');
    }
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
            {bookings.map((booking, idx) => {
              const highlightId = localStorage.getItem('lastBookingId');
              const highlight = highlightId === booking.id;

              const isPaid = booking.payment_status === 'paid' || booking.payment_status === 'mock_paid';
              const needsPayment = wantsPayment(booking.payment_status);

              return (
                <Card
                  key={booking.id}
                  className={`border-none shadow-lg hover:shadow-xl transition-shadow ${highlight ? 'ring-2 ring-blue-200' : ''}`}
                  data-booking-id={booking.id}
                  data-testid={`booking-card-${idx}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <CardTitle className="text-2xl mb-2" data-testid={`booking-car-name-${idx}`}>{booking.car_name}</CardTitle>
                        <Badge className={getStatusColor(booking.status)} data-testid={`booking-status-${idx}`}>
                          {booking.status?.toUpperCase()}
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

                    <div className="mt-6 pt-6 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        <span className={`text-green-600 font-semibold`}>Payment: {booking.payment_status}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {needsPayment && (
                          <button
                            onClick={() => handleCheckout(booking.id)}
                            className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:opacity-95"
                            data-testid={`checkout-btn-${idx}`}
                          >
                            Checkout / Pay
                          </button>
                        )}

                        {/* allow delete only when not paid (and user is owner) */}
                        {!isPaid && (
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="inline-flex items-center px-3 py-2 rounded-md bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                            data-testid={`delete-btn-${idx}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </button>
                        )}

                        {/* if already paid, show status */}
                        {isPaid && (
                          <div className="text-sm text-green-700 font-semibold">Payment: {booking.payment_status}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
