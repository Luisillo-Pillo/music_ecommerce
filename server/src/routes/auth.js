const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, profileImage } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }
    const count = await User.countDocuments();
    const role = count === 0 ? 'admin' : 'user';
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      profileImage: profileImage || '',
      role,
    });
    const token = signToken(user._id);
    res.status(201).json({ token, user: userResponse(user) });
  } catch (e) {
    res.status(500).json({ message: 'Error al registrar', error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const token = signToken(user._id);
    const plain = user.toObject();
    delete plain.password;
    res.json({ token, user: userResponse(plain) });
  } catch (e) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: e.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
    addresses: user.addresses,
    paymentMethods: user.paymentMethods,
  });
});

router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, profileImage, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (name !== undefined) user.name = name;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (email !== undefined && email !== user.email) {
      const taken = await User.findOne({ email, _id: { $ne: user._id } });
      if (taken) {
        return res.status(409).json({ message: 'El correo ya está en uso' });
      }
      user.email = email;
    }
    await user.save();
    res.json(
      userResponse({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      })
    );
  } catch (e) {
    res.status(500).json({ message: 'Error al actualizar perfil', error: e.message });
  }
});

module.exports = router;
