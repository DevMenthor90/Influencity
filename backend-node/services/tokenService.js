const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateAccessToken(user) {
  const secret = process.env.JWT_SECRET_KEY;
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.fullName,
      role: user.role,
      jti: crypto.randomUUID(),
    },
    secret,
    {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      expiresIn: `${process.env.JWT_ACCESS_EXPIRATION_MINUTES || 60}m`,
      algorithm: 'HS256',
    }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('base64');
}

module.exports = { generateAccessToken, generateRefreshToken };
