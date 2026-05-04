const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    const doc = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ id: doc._id, message: 'Mensaje enviado correctamente' });
  } catch (e) {
    res.status(500).json({ message: 'No se pudo guardar el mensaje', error: e.message });
  }
});

router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.json(messages);
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
});

module.exports = router;
