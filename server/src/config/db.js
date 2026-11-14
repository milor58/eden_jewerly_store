/* © 2026 Eden Jewelry. All rights reserved. */
import mongoose from 'mongoose';

// Backstop against NoSQL injection: objects like { $ne: 'x' } coming from
// requests are wrapped in $eq. Our own operators use mongoose.trusted().
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
