const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../services/tokenService');
const { authenticate } = require('../lib/authMiddleware');

const router = express.Router();

function toAuthResponse(user, accessToken, refreshToken) {
  return {
    accessToken,
    refreshToken,
    userId: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'El correo ya está registrado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const refreshTokenExpiry = new Date(Date.now() + (Number(process.env.JWT_REFRESH_EXPIRATION_DAYS || 7)) * 86400000);

  const user = await User.create({
    email: normalizedEmail,
    fullName: (fullName || '').trim(),
    passwordHash,
    role: 'admin',
    refreshToken: generateRefreshToken(),
    refreshTokenExpiry,
  });

  const accessToken = generateAccessToken(user);

  res.json({ message: 'Registro exitoso.', data: toAuthResponse(user, accessToken, user.refreshToken) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = (email || '').toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }
  if (!user.isActive) {
    return res.status(401).json({ message: 'Cuenta desactivada.' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + (Number(process.env.JWT_REFRESH_EXPIRATION_DAYS || 7)) * 86400000);
  await user.save();

  res.json({ message: 'Login exitoso.', data: toAuthResponse(user, accessToken, refreshToken) });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};

  const user = await User.findOne({
    refreshToken,
    refreshTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return res.status(401).json({ message: 'Refresh token inválido o expirado.' });
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken();
  user.refreshToken = newRefreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + (Number(process.env.JWT_REFRESH_EXPIRATION_DAYS || 7)) * 86400000);
  await user.save();

  res.json({ message: 'Token renovado.', data: toAuthResponse(user, accessToken, newRefreshToken) });
});

router.post('/logout', authenticate, async (req, res) => {
  await User.updateOne(
    { _id: req.user.id },
    { $set: { refreshToken: null, refreshTokenExpiry: null } }
  );
  res.json({ message: 'Sesión cerrada.' });
});

router.get('/me', authenticate, (req, res) => {
  res.json({
    userId: req.user.id,
    email: req.user.email,
    fullName: req.user.fullName,
    role: req.user.role,
  });
});

module.exports = router;
