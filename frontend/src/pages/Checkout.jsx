// src/pages/Checkout.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ clientSecret, booking, bookingId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const card = elements.getElement(CardElement);

    try {
      const res = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: booking.user_name || 'Customer'
          }
        }
      });

      if (res.error) {
        toast.error(res.error.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      const pi = res.paymentIntent;
      if (pi.status === 'succeeded' || pi.status === 'requires_capture') {
        toast.success('Payment successful!');
        setProcessing(false);
        // Give webhook a moment to update DB, then go to dashboard
        setTimeout(() => { window.location.href = '/dashboard'; }, 800);
      } else {
        toast.error('Payment not completed: ' + pi.status);
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Payment error occurred');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 680 }}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Card details</label>
        <div className="p-3 border rounded">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded mb-4">
        <div className="flex justify-between">
          <div>Booking ID</div>
          <div className="font-medium">{bookingId}</div>
        </div>
        <div className="flex justify-between mt-2">
          <div>Total</div>
          <div className="font-semibold">₹{(booking.total_price).toLocaleString()}</div>
        </div>
      </div>

      <Button type="submit" disabled={processing || !stripe}>
        {processing ? 'Processing…' : 'Pay Now'}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const found = res.data;
        setBooking(found);

        // Create payment intent on server
        const piRes = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-payment-intent`, {
          bookingId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setClientSecret(piRes.data.clientSecret);
      } catch (err) {
        console.error('Checkout init error', err);
        toast.error(err.response?.data?.detail || 'Failed to initialize payment');
        navigate('/cars');
      }
    })();
  }, [bookingId, navigate]);

  // DEV: call mock-pay endpoint to mark booking paid locally
  const markMockPaid = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in');
        return;
      }

      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}/mock-pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data?.message || 'Marked as paid (mock)');
      // Navigate back to dashboard so the booking list refreshes
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      console.error('Failed to mark as paid', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to mark as paid';
      toast.error(detail);
    }
  };

  if (!booking || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Preparing payment…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold mb-2">Booking summary</h2>
            <p className="text-sm text-gray-600 mb-4">{booking.car_name} • {booking.pickup_location}</p>
            <div className="mb-2">Pickup: {booking.pickup_date}</div>
            <div className="mb-4">Return: {booking.return_date}</div>
            <div className="text-lg font-bold">Total: ₹{booking.total_price}</div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm clientSecret={clientSecret} booking={booking} bookingId={bookingId} />
            </Elements>

            <div className="mt-6 border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">Development shortcuts</div>
              <div className="flex gap-3">
                <button
                  onClick={markMockPaid}
                  className="inline-flex items-center px-4 py-2 rounded bg-green-600 text-white"
                >
                  Mark Payment as Completed (Mock)
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 rounded border"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
