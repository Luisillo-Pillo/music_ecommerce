const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function generateOrderNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PED-${t}-${r}`;
}

router.use(requireAuth);

router.get('/mine', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product')
      .lean();
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener pedidos', error: e.message });
  }
});

router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, shippingAddress, paymentSummary, saveAddressToProfile, savePaymentToProfile } =
      req.body;
    if (!shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Datos de pedido incompletos' });
    }
    const lines = [];
    let total = 0;
    for (const row of items) {
      const pid = row.productId || row.product;
      const qty = parseInt(row.quantity, 10);
      if (!pid || !Number.isFinite(qty) || qty < 1) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Ítems inválidos' });
      }
      const product = await Product.findById(pid).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Producto no encontrado: ${pid}` });
      }
      if (product.stock < qty) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Stock insuficiente para ${product.name}`,
        });
      }
      product.stock -= qty;
      await product.save({ session });
      const lineTotal = product.price * qty;
      total += lineTotal;
      lines.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
      });
    }
    const orderNumber = generateOrderNumber();
    const order = await Order.create(
      [
        {
          orderNumber,
          user: req.user._id,
          items: lines,
          total,
          shippingAddress: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zip,
            country: shippingAddress.country || 'México',
          },
          paymentSummary: paymentSummary || { label: 'No especificado', type: 'mock' },
        },
      ],
      { session }
    );
    await User.findByIdAndUpdate(req.user._id, { cart: [] }).session(session);

    if (saveAddressToProfile) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            addresses: {
              label: 'Envío',
              street: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zip: shippingAddress.zip,
              country: shippingAddress.country || 'México',
            },
          },
        },
        { session }
      );
    }
    if (savePaymentToProfile && paymentSummary) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            paymentMethods: {
              label: paymentSummary.label || 'Guardado',
              type: paymentSummary.type || 'tarjeta',
              last4: paymentSummary.last4 || '****',
              brand: paymentSummary.brand || 'Genérico',
            },
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    const created = order[0].toObject();
    res.status(201).json(created);
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Error al crear el pedido', error: e.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
