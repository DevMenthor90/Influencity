const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado.' });
  }

  const token = header.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithms: ['HS256'],
    });
    req.user = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.name,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}

module.exports = { authenticate };
