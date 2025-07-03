import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function CartPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { cart, removeFromCart, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const total = cart.reduce((sum, p) => sum + parseInt(p.price || 0), 0);

  useEffect(() => {
    if (total === 0) {
      setLoading(false);
      return;
    }

    // ✅ Call backend to create payment intent
    fetch(`${API_URL}/api/payments/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total*100,
        currency: 'ils'
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('❌ Failed to create payment intent');
        return res.json();
      })
      .then(data => {
        if (!data.clientSecret) throw new Error('❌ No clientSecret returned');
        setClientSecret(data.clientSecret);
        setError('');
      })
      .catch(err => {
        console.error('❌ Payment intent error:', err);
        setError('❌ Failed to initialize payment. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [API_URL, total]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🛒 My Cart</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && !error && <p>Loading payment details...</p>}

      {cart.length === 0 && !loading && <p>Your cart is empty.</p>}

      {cart.length > 0 && (
        <div>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {cart.map((item, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.5rem'
              }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginRight: '10px'
                  }}
                />
                <strong>{item.name}</strong> - ₪{item.price}
                <button
                  onClick={() => removeFromCart(item)}
                  style={{
                    marginLeft: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <h3>Total: ₪{total}</h3>

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clearCart={clearCart} />
            </Elements>
          )}
        </div>
      )}
    </div>
  );
}

function CheckoutForm({ clearCart }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const result = await stripe.confirmCardPayment(elements._clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    setProcessing(false);

    if (result.error) {
      setError(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      setSuccess('✅ Payment successful!');
      clearCart();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      border: '1px solid #ccc',
      padding: '1rem',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <CardElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: processing ? 'not-allowed' : 'pointer'
        }}
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}
