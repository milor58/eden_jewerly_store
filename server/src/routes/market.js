/* © 2026 Eden Jewelry. All rights reserved. */
import { Router } from 'express';
import { getMarket } from '../utils/market.js';

const router = Router();

// GET /api/market -> { currency, gold: { perOunce, perGram }, silver: { perOunce, perGram }, updatedAt, stale }
// Public, read-only, no database. Data comes from a free third-party API (gold-api.com).
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(await getMarket());
});

export default router;
