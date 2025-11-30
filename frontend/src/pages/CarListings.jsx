import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Car, Users, Fuel, Settings, MapPin } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CarListings = () => {
  const [cars, setCars] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async (location = '') => {
    setLoading(true);
    try {
      const url = location ? `${API}/cars?location=${location}` : `${API}/cars`;
      const response = await axios.get(url);
      setCars(response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCars(searchLocation);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="car-listings-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="listings-title">Available Vehicles</h1>
          <p className="text-lg text-gray-600">Find your perfect ride from our extensive collection</p>
        </div>

        {/* Search */}
        <div className="mb-12 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-4" data-testid="search-form">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
                data-testid="location-search-input"
              />
            </div>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-cyan-500"
              data-testid="search-btn"
            >
              Search
            </Button>
            {searchLocation && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setSearchLocation('');
                  fetchCars();
                }}
                data-testid="clear-search-btn"
              >
                Clear
              </Button>
            )}
          </form>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20" data-testid="no-cars-message">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No cars available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car, idx) => (
              <Card 
                key={car.id} 
                className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/cars/${car.id}`)}
                data-testid={`car-card-${idx}`}
              >
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                  {car.image_url ? (
                    <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-20 w-20 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                    {car.availability ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-red-600">Booked</span>
                    )}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2" data-testid={`car-name-${idx}`}>{car.name}</h3>
                  <p className="text-gray-600 mb-4">{car.brand} {car.model} • {car.year}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{car.seats}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-4 w-4" />
                      <span>{car.fuel_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-4 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{car.location}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600" data-testid={`car-price-${idx}`}>₹{car.price_per_day}/day</span>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-cyan-500"
                      data-testid={`book-now-btn-${idx}`}
                    >
                      Book Now
                    </Button>
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

export default CarListings;