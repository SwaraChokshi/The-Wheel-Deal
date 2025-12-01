// src/pages/CarListings.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Car, Users, Fuel, Settings, MapPin } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// Inclusive overlap check (same day counts as overlap).
// Compare dates only (ignoring time) to avoid timezone issues
const rangesOverlap = (reqPickup, reqReturn, bPickup, bReturn) => {
  if (!reqPickup || !reqReturn || !bPickup || !bReturn) return false;
  
  // Extract just the date part (YYYY-MM-DD) for comparison
  const normalize = (dateStr) => dateStr.split('T')[0];
  
  const rStart = normalize(reqPickup);
  const rEnd = normalize(reqReturn);
  const bStart = normalize(bPickup);
  const bEnd = normalize(bReturn);

  // Check if ranges overlap: NOT (one ends before the other starts)
  return !(rEnd < bStart || rStart > bEnd);
};

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

const CarListings = () => {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]); // bookings used for availability checks
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // staged filter values (what the user edits)
  const [pendingPickup, setPendingPickup] = useState('');
  const [pendingReturn, setPendingReturn] = useState('');
  const [pendingFuel, setPendingFuel] = useState('');
  const [pendingTransmission, setPendingTransmission] = useState('');
  const [pendingSeats, setPendingSeats] = useState('');

  // applied filters (take effect when user clicks Apply)
  const [applied, setApplied] = useState({
    pickup: '',
    return: '',
    fuel: '',
    transmission: '',
    seats: ''
  });

  // load cars initially
  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/cars`);
        setCars(res.data || []);
      } catch (err) {
        console.error('Error loading cars', err);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    loadCars();
  }, []);

  // When applied.pickup & applied.return change (user clicked Apply), fetch availability bookings for that range.
  // If no dates applied, fetch all non-cancelled bookings so UI can still show DB availability badges.
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        if (applied.pickup && applied.return) {
          console.log('Fetching bookings for date range:', applied.pickup, 'to', applied.return);
          // ask server only for bookings overlapping the chosen range
          const res = await axios.get(`${API}/bookings/availability`, {
            params: { pickup: applied.pickup, return: applied.return }
          });
          console.log('Received overlapping bookings:', res.data);
          setBookings(res.data || []);
        } else {
          // fetch all availability bookings (minimal info)
          const res = await axios.get(`${API}/bookings/availability`);
          console.log('Received all bookings:', res.data);
          setBookings(res.data || []);
        }
      } catch (err) {
        // log and keep empty bookings array so UI remains functional
        console.warn('/bookings/availability failed', err?.response?.status, err?.message);
        setBookings([]);
      }
    };

    // only fetch if cars already loaded (not required but better)
    loadAvailability();
  }, [applied.pickup, applied.return]); // re-run whenever applied dates change

  // Derived lists for selects
  const fuelOptions = useMemo(() => uniq(cars.map(c => c.fuel_type)), [cars]);
  const transmissionOptions = useMemo(() => uniq(cars.map(c => c.transmission)), [cars]);
  const seatsOptions = useMemo(() => uniq(cars.map(c => c.seats)).sort((a, b) => a - b), [cars]);

  // isAvailable uses applied dates and the bookings array returned from server
  const isAvailable = (car) => {
    // if no date range applied -> fallback to DB flag
    if (!applied.pickup || !applied.return) {
      return !!car.availability;
    }

    // find any booking (from server result) for this car that overlaps
    const carBookings = bookings.filter(b => b.car_id === car.id && b.status !== 'cancelled');
    
    console.log(`Checking availability for car ${car.id} (${car.name}):`, {
      requestedRange: { pickup: applied.pickup, return: applied.return },
      carBookings: carBookings.length,
      bookings: carBookings
    });

    for (const b of carBookings) {
      const overlaps = rangesOverlap(applied.pickup, applied.return, b.pickup_date, b.return_date);
      console.log(`  Booking ${b.pickup_date} to ${b.return_date}: overlaps = ${overlaps}`);
      if (overlaps) {
        return false;
      }
    }
    return true;
  };

  // Apply filters to cars (fuel/transmission/seats and date availability)
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (applied.fuel && car.fuel_type !== applied.fuel) return false;
      if (applied.transmission && car.transmission !== applied.transmission) return false;
      if (applied.seats && String(car.seats) !== String(applied.seats)) return false;

      // if dates are applied, hide cars that are booked (server returned overlapping bookings)
      if (applied.pickup && applied.return) {
        if (!isAvailable(car)) return false;
      }

      return true;
    });
  }, [cars, applied, bookings]);

  // Handlers
  const handleApply = () => {
    // require both dates or none
    if ((pendingPickup && !pendingReturn) || (!pendingPickup && pendingReturn)) {
      alert('Please select both pickup and return dates or clear both.');
      return;
    }

    setApplied({
      pickup: pendingPickup,
      return: pendingReturn,
      fuel: pendingFuel,
      transmission: pendingTransmission,
      seats: pendingSeats
    });

    // scroll to results
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  const handleReset = () => {
    setPendingPickup('');
    setPendingReturn('');
    setPendingFuel('');
    setPendingTransmission('');
    setPendingSeats('');
    setApplied({
      pickup: '',
      return: '',
      fuel: '',
      transmission: '',
      seats: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="car-listings-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Available Vehicles</h1>
          <p className="text-gray-600">Filter by fuel, transmission, seats & date availability</p>
        </div>

        {/* Date Inputs */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600">Pickup Date</label>
            <Input
              type="date"
              value={pendingPickup}
              onChange={(e) => setPendingPickup(e.target.value)}
              data-testid="pickup-date-input"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Return Date</label>
            <Input
              type="date"
              value={pendingReturn}
              onChange={(e) => setPendingReturn(e.target.value)}
              min={pendingPickup || undefined}
              data-testid="return-date-input"
            />
          </div>

          <div className="flex items-end gap-3">
            <Button
              onClick={handleApply}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2"
              data-testid="apply-filters-btn"
            >
              Apply Filters
            </Button>

            <Button
              variant="outline"
              onClick={() => { setPendingPickup(''); setPendingReturn(''); }}
              data-testid="clear-dates-btn"
            >
              Clear Dates
            </Button>

            <Button
              variant="ghost"
              onClick={handleReset}
              className="ml-auto text-sm"
              data-testid="reset-filters-btn"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Filter selects (staged) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="text-sm text-gray-600">Fuel</label>
            <select
              value={pendingFuel}
              onChange={(e) => setPendingFuel(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              data-testid="pending-fuel-select"
            >
              <option value="">Any</option>
              {fuelOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Transmission</label>
            <select
              value={pendingTransmission}
              onChange={(e) => setPendingTransmission(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              data-testid="pending-transmission-select"
            >
              <option value="">Any</option>
              {transmissionOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Seats</label>
            <select
              value={pendingSeats}
              onChange={(e) => setPendingSeats(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              data-testid="pending-seats-select"
            >
              <option value="">Any</option>
              {seatsOptions.map(s => <option key={s} value={String(s)}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto" />
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20">
            <Car className="h-16 w-16 text-gray-400 mx-auto" />
            <p className="text-xl text-gray-600 mt-4">No cars match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car, idx) => {
              const available = isAvailable(car);

              return (
                <Card
                  key={car.id}
                  className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
                  onClick={() => navigate(`/cars/${car.id}`)}
                  data-testid={`car-card-${idx}`}
                >
                  <div className="aspect-video bg-gray-200 relative">
                    {car.image_url ? (
                      <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car className="h-20 w-20 text-gray-400" />
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                      {available ? (
                        <span className="text-green-600">Available</span>
                      ) : (
                        <span className="text-red-600">Booked</span>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-1">{car.name}</h3>
                    <p className="text-gray-600">{car.brand} {car.model} • {car.year}</p>

                    <div className="grid grid-cols-3 gap-2 mt-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Users className="h-4" />{car.seats}</span>
                      <span className="flex items-center gap-1"><Settings className="h-4" />{car.transmission}</span>
                      <span className="flex items-center gap-1"><Fuel className="h-4" />{car.fuel_type}</span>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-1 mb-4">
                      <MapPin className="h-4" />
                      {car.location}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">₹{car.price_per_day}/day</span>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-cyan-500"
                        onClick={(e) => { e.stopPropagation(); navigate(`/cars/${car.id}`); }}
                        data-testid={`book-now-btn-${idx}`}
                      >
                        Book Now
                      </Button>
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

export default CarListings;