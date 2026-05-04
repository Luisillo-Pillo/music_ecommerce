require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDb } = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contact');

const app = express();

function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGINS || '';
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  return [...new Set([...defaults, ...list])];
}

app.use(
  cors({
    origin: parseCorsOrigins(),
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API en http://localhost:${port}`);
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
