import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Car, Users, Fuel, Settings, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CarDetail = () => {
  const { carId } = useParams();
  const { user, openAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/cars/${carId}`)
      .then(res => setCar(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Car not found');
        navigate('/cars');
      })
      .finally(() => setLoading(false));
  }, [carId, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      openAuth('login');
      return;
    }

    setBookingLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/bookings`,
        {
          car_id: carId,
          pickup_date: booking.pickupDate,
          return_date: booking.returnDate,
          pickup_location: booking.pickupLocation
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Booking confirmed! Check your dashboard.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="car-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/cars')} 
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cars
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Car Details */}
          <div>
            <Card className="overflow-hidden border-none shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" data-testid="car-image" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Car className="h-32 w-32 text-gray-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2" data-testid="car-name">{car.name}</h1>
                  <p className="text-xl text-gray-600">{car.brand} {car.model} • {car.year}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Seats</p>
                      <p className="font-semibold" data-testid="car-seats">{car.seats} People</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-100 p-3 rounded-lg">
                      <Settings className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transmission</p>
                      <p className="font-semibold" data-testid="car-transmission">{car.transmission}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Fuel className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fuel Type</p>
                      <p className="font-semibold" data-testid="car-fuel">{car.fuel_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-100 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold" data-testid="car-location">{car.location}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Price per day</p>
                  <p className="text-4xl font-bold text-blue-600" data-testid="car-price">₹{car.price_per_day}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="border-none shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Book This Car</h2>
                <form onSubmit={handleBooking} className="space-y-6" data-testid="booking-form">
                  <div>
                    <Label htmlFor="pickupDate">Pickup Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="pickupDate"
                        type="date"
                        value={booking.pickupDate}
                        onChange={(e) => setBooking({ ...booking, pickupDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="pl-10"
                        data-testid="pickup-date-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="returnDate">Return Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="returnDate"
                        type="date"
                        value={booking.returnDate}
                        onChange={(e) => setBooking({ ...booking, returnDate: e.target.value })}
                        min={booking.pickupDate || new Date().toISOString().split('T')[0]}
                        required
                        className="pl-10"
                        data-testid="return-date-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pickupLocation">Pickup Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="pickupLocation"
                        type="text"
                        placeholder="Enter pickup location"
                        value={booking.pickupLocation}
                        onChange={(e) => setBooking({ ...booking, pickupLocation: e.target.value })}
                        required
                        className="pl-10"
                        data-testid="pickup-location-input"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Price per day:</span>
                      <span className="font-semibold">₹{car.price_per_day}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="text-green-600 font-semibold">Mock Payment</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-lg py-6 rounded-xl"
                    disabled={bookingLoading}
                    data-testid="confirm-booking-btn"
                  >
                    {bookingLoading ? 'Processing...' : user ? 'Confirm Booking' : 'Login to Book'}
                  </Button>

                  {!user && (
                    <p className="text-sm text-center text-gray-600">
                      Need an account?{' '}
                      <button 
                        type="button" 
                        onClick={() => openAuth('register')} 
                        className="text-blue-600 hover:underline"
                        data-testid="signup-link"
                      >
                        Sign up here
                      </button>
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;