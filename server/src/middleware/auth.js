/* © 2026 Eden Jewelry. All rights reserved. */
import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

// Authentication: who are you? -> 401 if no token or a bad one.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Authorization: are you allowed? -> 403 if not an admin.
// The role is read from the database, not trusted from the token.
export async function requireAdmin(req, res, next) {
  const user = await User.findById(req.userId).select('role');
  if (!user) return res.status(401).json({ error: 'Account not found' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  next();
}
