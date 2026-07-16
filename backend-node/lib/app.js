const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const authRoutes = require('../routes/auth');
const dealsRoutes = require('../routes/deals');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  connectDB().then(() => next()).catch(next);
});

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/deals', dealsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

module.exports = app;
