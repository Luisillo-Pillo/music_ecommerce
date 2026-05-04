const express = require('express');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Error al listar usuarios', error: e.message });
  }
});

router.patch('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (String(user._id) === String(req.user._id) && role === 'user') {
      return res.status(400).json({ message: 'No puedes quitarte el rol de administrador a ti mismo' });
    }
    user.role = role;
    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    });
  } catch (e) {
    res.status(500).json({ message: 'Error al actualizar rol', error: e.message });
  }
});

module.exports = router;
