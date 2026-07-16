const mongoose = require('mongoose');

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_CONNECTION_STRING;
    const dbName = process.env.MONGODB_DATABASE_NAME || 'influencer_db';
    cached.promise = mongoose.connect(uri, { dbName }).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
