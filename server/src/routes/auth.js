/* © 2026 Eden Jewelry. All rights reserved. */
import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { SignupInput, LoginInput } from '../validation/schemas.js';
import { signToken } from '../utils/token.js';

const router = Router();

// POST /api/auth/signup -> 201 { token, user }
router.post('/signup', validate(SignupInput), async (req, res) => {
  const { name, email, password, phone } = req.body;

  const exists = await User.exists({ email });
  if (exists) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  // role is NOT taken from the body: every signup is a customer.
  const user = await User.create({ name, email, phone, passwordHash });

  res.status(201).json({ token: signToken(user), user: user.toPublic() });
});

// POST /api/auth/login -> 200 { token, user }
router.post('/login', validate(LoginInput), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');

  // One generic message: never say whether the email or the password was wrong.
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  res.json({ token: signToken(user), user: user.toPublic() });
});

// GET /api/auth/me -> the logged-in user
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ error: 'Account not found' });
  res.json({ user: user.toPublic() });
});

export default router;
