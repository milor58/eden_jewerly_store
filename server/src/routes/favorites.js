/* © 2026 Eden Jewelry. All rights reserved. */
import { Router } from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { validId } from '../middleware/validate.js';

// Mounted behind requireAuth: every route uses req.userId from the token.
const router = Router();

// GET /api/favorites -> full product objects
router.get('/', async (req, res) => {
  const user = await User.findById(req.userId).populate('favorites');
  if (!user) return res.status(401).json({ error: 'Account not found' });
  res.json({ items: user.favorites.filter(Boolean) });
});

// POST /api/favorites/:productId -> { favorites: [ids] }
router.post('/:productId', validId('productId'), async (req, res) => {
  const exists = await Product.exists({ _id: req.params.productId });
  if (!exists) return res.status(404).json({ error: 'Piece not found' });

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $addToSet: { favorites: req.params.productId } },
    { new: true }
  );
  if (!user) return res.status(401).json({ error: 'Account not found' });
  res.status(201).json({ favorites: user.favorites.map(String) });
});

// DELETE /api/favorites/:productId -> { favorites: [ids] }
router.delete('/:productId', validId('productId'), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $pull: { favorites: req.params.productId } },
    { new: true }
  );
  if (!user) return res.status(401).json({ error: 'Account not found' });
  res.json({ favorites: user.favorites.map(String) });
});

export default router;
