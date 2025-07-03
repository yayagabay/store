import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is missing in .env');
  throw new Error('❌ STRIPE_SECRET_KEY is missing in .env');
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required.' });
    }

    console.log('✅ Creating PaymentIntent with amount:', amount, 'currency:', currency);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card']
    });

    console.log('✅ PaymentIntent created with ID:', paymentIntent.id);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ Error creating PaymentIntent:', error.message);
    res.status(500).json({ error: 'Failed to create payment intent. Check server logs.' });
  }
});

export default router;
