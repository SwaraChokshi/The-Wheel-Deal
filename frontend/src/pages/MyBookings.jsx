// src/pages/MyBookings.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyBookings() {
  const { user, openAuth } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        openAuth('login');
        return;
      }
      const res = await axios.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <h2 className="text-2xl font-semibold mb-2">No bookings yet</h2>
        <p className="text-gray-600">Browse cars and make your first booking.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

        <div className="space-y-8">
          {bookings.map((b) => {
            const isPaid = b.payment_status === 'paid' || b.payment_status === 'mock_paid';
            const needsPayment = !isPaid && (b.payment_status === 'pending' || b.payment_status === 'payment_pending' || b.payment_status === 'payment_pending');
            return (
              <Card key={b.id} className="p-6">
                <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{b.car_name}</h3>
                        <div className="mt-2">
                          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {isPaid ? 'CONFIRMED' : (b.payment_status || 'PENDING')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total Price</div>
                        <div className="text-2xl font-bold text-blue-600">₹{b.total_price}</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-3 rounded">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pickup Date</p>
                          <p className="font-semibold">{new Date(b.pickup_date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-3 rounded">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Return Date</p>
                          <p className="font-semibold">{new Date(b.return_date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-3 rounded">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pickup Location</p>
                          <p className="font-semibold">{b.pickup_location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-col items-end justify-between">
                    <div className="w-full md:w-auto flex flex-col gap-3">
                      {needsPayment ? (
                        <>
                          <Button
                            onClick={() => navigate(`/checkout/${b.id}`)}
                            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                          >
                            Checkout / Pay
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={() => {
                              // optional: let user re-initiate checkout by navigating
                              navigate(`/checkout/${b.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </>
                      ) : (
                        <div className="text-sm text-green-700 font-semibold">Payment: {b.payment_status}</div>
                      )}
                    </div>

                    <div className="text-xs text-gray-400 mt-4">Booking ID: {b.id}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
