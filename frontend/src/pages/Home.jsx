import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Car, Clock, Shield, Zap, ArrowRight, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { user, openAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState([]);

  useEffect(() => {
    axios.get(`${API}/cars`)
      .then(res => setFeaturedCars(res.data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight" data-testid="hero-title">
              Your Journey Starts Here
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the freedom of the open road with our premium car rental service.
              Choose from our extensive fleet and drive with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/cars')}
                data-testid="browse-cars-btn"
              >
                Browse Cars <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => openAuth('register')}
                  data-testid="get-started-btn"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" data-testid="features-title">Why Choose The Wheel Deal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-card-1">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Car className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Wide Selection</h3>
                <p className="text-gray-600">Choose from hundreds of vehicles to match your style and needs</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-card-2">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold">24/7 Support</h3>
                <p className="text-gray-600">Round-the-clock customer service for your peace of mind</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-card-3">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Safe & Secure</h3>
                <p className="text-gray-600">All vehicles regularly maintained and fully insured</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-card-4">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold">Instant Booking</h3>
                <p className="text-gray-600">Book your car in minutes with our seamless process</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      {featuredCars.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" data-testid="featured-cars-title">Featured Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCars.map((car, idx) => (
                <Card 
                  key={car.id} 
                  className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/cars/${car.id}`)}
                  data-testid={`featured-car-${idx}`}
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                    {car.image_url ? (
                      <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car className="h-20 w-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                    <p className="text-gray-600 mb-4">{car.brand} {car.model} • {car.year}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">₹{car.price_per_day}/day</span>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-cyan-500"
                        data-testid={`view-car-btn-${idx}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full px-8"
                onClick={() => navigate('/cars')}
                data-testid="view-all-cars-btn"
              >
                View All Cars
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;