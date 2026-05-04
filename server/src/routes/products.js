const express = require('express');
const Product = require('../models/Product');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, brand, featured, search, page = '1', limit = '24' } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) || 1 });
  } catch (e) {
    res.status(500).json({ message: 'Error al listar productos', error: e.message });
  }
});

router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
});

router.get('/meta/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands.sort());
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch {
    res.status(400).json({ message: 'ID inválido' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (e) {
    res.status(400).json({ message: 'No se pudo crear el producto', error: e.message });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (e) {
    res.status(400).json({ message: 'No se pudo actualizar', error: e.message });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Eliminado' });
  } catch {
    res.status(400).json({ message: 'ID inválido' });
  }
});

module.exports = router;
