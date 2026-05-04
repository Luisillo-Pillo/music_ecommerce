const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

async function populateCart(userId) {
  const user = await User.findById(userId).populate('cart.product');
  return user;
}

router.get('/', async (req, res) => {
  try {
    const user = await populateCart(req.user._id);
    const items = (user.cart || []).map((line) => ({
      product: line.product,
      quantity: line.quantity,
    }));
    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener el carrito', error: e.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items debe ser un arreglo' });
    }
    const normalized = [];
    for (const row of items) {
      const pid = row.productId || row.product;
      const qty = parseInt(row.quantity, 10);
      if (!pid || !Number.isFinite(qty) || qty < 1) continue;
      const product = await Product.findById(pid);
      if (!product) continue;
      normalized.push({ product: product._id, quantity: qty });
    }
    await User.findByIdAndUpdate(req.user._id, { cart: normalized });
    const user = await populateCart(req.user._id);
    res.json({
      items: (user.cart || []).map((line) => ({
        product: line.product,
        quantity: line.quantity,
      })),
    });
  } catch (e) {
    res.status(500).json({ message: 'Error al guardar el carrito', error: e.message });
  }
});

router.post('/merge', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items debe ser un arreglo' });
    }
    const user = await User.findById(req.user._id);
    const map = new Map();
    for (const line of user.cart || []) {
      map.set(String(line.product), line.quantity);
    }
    for (const row of items) {
      const pid = String(row.productId || row.product || '');
      const qty = parseInt(row.quantity, 10);
      if (!pid || !Number.isFinite(qty) || qty < 1) continue;
      const product = await Product.findById(pid);
      if (!product) continue;
      const prev = map.get(pid) || 0;
      map.set(pid, prev + qty);
    }
    const merged = [];
    for (const [productId, quantity] of map) {
      merged.push({ product: productId, quantity });
    }
    user.cart = merged;
    await user.save();
    const populated = await populateCart(req.user._id);
    res.json({
      items: (populated.cart || []).map((line) => ({
        product: line.product,
        quantity: line.quantity,
      })),
    });
  } catch (e) {
    res.status(500).json({ message: 'Error al fusionar carrito', error: e.message });
  }
});

module.exports = router;
