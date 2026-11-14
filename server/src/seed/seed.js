// npm run seed
// - adds or updates the products in rings.js (matched by code)
// - removes products whose code is not in rings.js
// - creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env
// Safe to run again: orders and customers are never deleted.
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { checkEnv } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { rings } from './rings.js';

async function seedProducts() {
  for (const ring of rings) {
    const existing = await Product.findOne({ code: ring.code });
    if (!existing) {
      await Product.create(ring);
      continue;
    }
    // Keep media that was already uploaded if the seed file has none.
    const update = { ...ring };
    if (!ring.images.length) delete update.images;
    if (!ring.videos.length) delete update.videos;
    await Product.updateOne({ code: ring.code }, update, { runValidators: true });
  }
  const removed = await Product.deleteMany({ code: { $nin: rings.map((r) => r.code) } });
  if (removed.deletedCount) console.log(`Removed ${removed.deletedCount} old product(s)`);
  console.log(`Products ready: ${rings.length}`);
}

async function seedAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('No ADMIN_EMAIL / ADMIN_PASSWORD in .env: admin not created');
    return;
  }
  if (ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters');

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email },
    { name: ADMIN_NAME || 'Eden Owner', email, passwordHash, role: 'admin' },
    { upsert: true, new: true, runValidators: true }
  );
  console.log(`Admin ready: ${email}`);
}

try {
  checkEnv();
  await connectDB();
  await seedProducts();
  await seedAdmin();
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
