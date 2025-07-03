import express from 'express';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// ✅ Get logged-in user's own products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.userId }).populate('owner', 'username');
    res.json(Array.isArray(products) ? products : []);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get all products (for browsing/admin)
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find().populate('owner', 'username');
    res.json(Array.isArray(products) ? products : []);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Create new product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required.' });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      image,
      owner: req.user.userId
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (String(product.owner) !== String(req.user.userId) && req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
