import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Car as CarIcon, Calendar, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showCarModal, setShowCarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [carForm, setCarForm] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price_per_day: '',
    location: '',
    seats: 5,
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    image_url: ''
  });

  useEffect(() => {
    fetchCars();
    fetchBookings();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${API}/cars`);
      setCars(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setCarForm({ ...carForm, image_url: response.data.url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/cars`, carForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Car added successfully');
      setShowCarModal(false);
      setCarForm({
        name: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        price_per_day: '',
        location: '',
        seats: 5,
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        image_url: ''
      });
      setImageFile(null);
      fetchCars();
    } catch (error) {
      toast.error('Failed to add car');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Car deleted successfully');
      fetchCars();
    } catch (error) {
      toast.error('Failed to delete car');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/bookings/${bookingId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Booking status updated');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-12" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="admin-title">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your car rental inventory and bookings</p>
        </div>

        <Tabs defaultValue="cars" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="cars" data-testid="cars-tab">Cars Management</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="bookings-tab">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="cars">
            <div className="mb-6">
              <Button 
                onClick={() => setShowCarModal(true)} 
                className="bg-gradient-to-r from-blue-600 to-cyan-500"
                data-testid="add-car-btn"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Car
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, idx) => (
                <Card key={car.id} className="border-none shadow-lg" data-testid={`admin-car-card-${idx}`}>
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                    {car.image_url ? (
                      <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <CarIcon className="h-20 w-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2" data-testid={`admin-car-name-${idx}`}>{car.name}</h3>
                    <p className="text-gray-600 mb-4">{car.brand} {car.model}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-blue-600" data-testid={`admin-car-price-${idx}`}>₹{car.price_per_day}/day</span>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCar(car.id)}
                        data-testid={`delete-car-btn-${idx}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <Card className="border-none shadow-lg">
                  <CardContent className="py-20 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600" data-testid="no-bookings-admin">No bookings yet</p>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking, idx) => (
                  <Card key={booking.id} className="border-none shadow-lg" data-testid={`admin-booking-card-${idx}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle data-testid={`admin-booking-car-${idx}`}>{booking.car_name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1" data-testid={`admin-booking-user-${idx}`}>
                            Booked by: {booking.user_name} ({booking.user_email})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600" data-testid={`admin-booking-price-${idx}`}>₹{booking.total_price}</p>
                          <Badge className={`mt-2 ${getStatusColor(booking.status)}`} data-testid={`admin-booking-status-${idx}`}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Pickup</p>
                          <p className="font-semibold">{new Date(booking.pickup_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Return</p>
                          <p className="font-semibold">{new Date(booking.return_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold">{booking.pickup_location}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select 
                          defaultValue={booking.status}
                          onValueChange={(value) => handleUpdateBookingStatus(booking.id, value)}
                        >
                          <SelectTrigger className="w-[200px]" data-testid={`status-select-${idx}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Car Modal */}
        {showCarModal && (
          <Dialog open={showCarModal} onOpenChange={setShowCarModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="add-car-modal">
              <DialogHeader>
                <DialogTitle>Add New Car</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Car Name</Label>
                    <Input
                      id="name"
                      value={carForm.name}
                      onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                      required
                      data-testid="car-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={carForm.brand}
                      onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                      required
                      data-testid="car-brand-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={carForm.model}
                      onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                      required
                      data-testid="car-model-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={carForm.year}
                      onChange={(e) => setCarForm({ ...carForm, year: parseInt(e.target.value) })}
                      required
                      data-testid="car-year-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price per Day (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={carForm.price_per_day}
                      onChange={(e) => setCarForm({ ...carForm, price_per_day: parseFloat(e.target.value) })}
                      required
                      data-testid="car-price-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={carForm.location}
                      onChange={(e) => setCarForm({ ...carForm, location: e.target.value })}
                      required
                      data-testid="car-location-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seats">Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      value={carForm.seats}
                      onChange={(e) => setCarForm({ ...carForm, seats: parseInt(e.target.value) })}
                      required
                      data-testid="car-seats-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select 
                      value={carForm.transmission}
                      onValueChange={(value) => setCarForm({ ...carForm, transmission: value })}
                    >
                      <SelectTrigger data-testid="car-transmission-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fuel">Fuel Type</Label>
                    <Select 
                      value={carForm.fuel_type}
                      onValueChange={(value) => setCarForm({ ...carForm, fuel_type: value })}
                    >
                      <SelectTrigger data-testid="car-fuel-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="image">Car Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      data-testid="car-image-input"
                    />
                  </div>
                </div>
                {carForm.image_url && (
                  <div className="mt-4">
                    <img src={carForm.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                  disabled={loading}
                  data-testid="submit-car-btn"
                >
                  {loading ? 'Adding Car...' : 'Add Car'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;