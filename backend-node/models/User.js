const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, default: 'admin' },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, default: null },
    refreshTokenExpiry: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, collection: 'users' }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
