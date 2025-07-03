import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { useCart } from '../context/CartContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function YourPaymentPage() {
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const totalAmount = cart.reduce((sum, item) => sum + parseInt(item.price || 0), 0) * 100; // convert to cents

  useEffect(() => {
    if (!cart.length) {
      setError('Your cart is empty.');
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/payments/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalAmount,
        currency: 'ils',
        cartItems: cart
      })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.clientSecret) throw new Error('No clientSecret returned');
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to initialize payment.');
        setLoading(false);
      });
  }, [API_URL, cart, totalAmount]);

  if (loading) return <p>Loading checkout...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem' }}>
      <h2>Checkout</h2>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
