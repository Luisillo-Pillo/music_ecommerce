const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Se requiere iniciar sesión' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o expirada' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, getToken };
