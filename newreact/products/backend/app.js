import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import todosRouter from './routes/todos.js';
import chatRouter from './routes/chat.js';
import productsRouter from './routes/products.js';
import paymentsRouter from './routes/payments.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/todos', todosRouter);
app.use('/api/payments', paymentsRouter);



// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error.' });
});

// ✅ MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
