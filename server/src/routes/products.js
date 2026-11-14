import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { validate, validId } from '../middleware/validate.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ProductInput, ProductUpdate, ProductQuery } from '../validation/schemas.js';

const router = Router();
const { trusted } = mongoose;

const SORTS = {
  new: { createdAt: -1, code: 1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  name: { name: 1 },
};

// Escape regex characters so a search like "(((((" can't break or slow the query.
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/products?q=&type=&stone=&color=&minPrice=&maxPrice=&featured=&sort=&page=&limit=
router.get('/', validate(ProductQuery, 'query'), async (req, res) => {
  const { q, type, stone, color, minPrice, maxPrice, featured, sort, page, limit } = req.validQuery;

  const filter = {};
  if (type) filter.type = type;
  if (stone) filter.stone = stone;
  if (color) filter.color = color;
  if (featured) filter.featured = featured === 'true';
  if (minPrice !== undefined || maxPrice !== undefined) {
    const range = {};
    if (minPrice !== undefined) range.$gte = minPrice;
    if (maxPrice !== undefined) range.$lte = maxPrice;
    filter.price = trusted(range);
  }
  if (q) {
    const rx = trusted({ $regex: escapeRegex(q), $options: 'i' });
    filter.$or = [{ name: rx }, { description: rx }, { stone: rx }, { code: rx }];
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

// GET /api/products/filters -> values for the shop filter menus
router.get('/filters', async (req, res) => {
  const [stones, colors, range] = await Promise.all([
    Product.distinct('stone'),
    Product.distinct('color'),
    Product.aggregate([{ $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
  ]);
  res.json({
    stones: stones.sort(),
    colors: colors.sort(),
    minPrice: range[0]?.min ?? 0,
    maxPrice: range[0]?.max ?? 0,
  });
});

// GET /api/products/:id
router.get('/:id', validId(), async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).json({ error: 'Piece not found' });
  res.json(product);
});

// ---------- admin only ----------

// POST /api/products -> 201
router.post('/', requireAuth, requireAdmin, validate(ProductInput), async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// PATCH /api/products/:id -> 200 (only the fields sent change)
router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  validId(),
  validate(ProductUpdate),
  async (req, res) => {
    const changes = Object.fromEntries(
      Object.entries(req.body).filter(([, v]) => v !== undefined)
    );
    const product = await Product.findByIdAndUpdate(req.params.id, changes, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Piece not found' });
    res.json(product);
  }
);

// DELETE /api/products/:id -> 204
router.delete('/:id', requireAuth, requireAdmin, validId(), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Piece not found' });
  res.status(204).end();
});

export default router;
