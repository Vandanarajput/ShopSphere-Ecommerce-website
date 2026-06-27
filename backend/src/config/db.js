const mongoose = require('mongoose');

let cached = global.__shopsphereMongoose;
if (!cached) {
  cached = global.__shopsphereMongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
