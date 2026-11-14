import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { validate, validId } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { OrderInput, OrderStatusInput } from '../validation/schemas.js';
import { buildOrderLines } from '../utils/pricing.js';

// Mounted behind requireAuth.
const router = Router();

// Which status can follow which (the order-request flow).
const NEXT = {
  requested: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// POST /api/orders -> 201 (customer sends an order request)
router.post('/', validate(OrderInput), async (req, res) => {
  const { items, contact } = req.body;
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await Product.find({ _id: mongoose.trusted({ $in: ids }) });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const { lines, total } = buildOrderLines(items, byId);

  const order = await Order.create({
    user: req.userId, // from the token, never from the body
    items: lines,
    total,
    contact,
  });
  res.status(201).json(order);
});

// GET /api/orders/mine -> only my orders
router.get('/mine', async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ items: orders });
});

// PATCH /api/orders/:id/cancel -> owner can cancel while it is still "requested"
router.patch('/:id/cancel', validId(), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) return res.status(404).json({ error: 'Order not found' }); // someone else's -> 404
  if (order.status !== 'requested') {
    return res.status(400).json({ error: 'This order is already being prepared and cannot be cancelled here' });
  }
  order.status = 'cancelled';
  order.history.push({ status: 'cancelled' });
  await order.save();
  res.json(order);
});

// ---------- admin only ----------

// GET /api/orders -> every order with the customer's name and email
router.get('/', requireAdmin, async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email phone')
    .lean();
  res.json({ items: orders });
});

// PATCH /api/orders/:id/status { status }
router.patch('/:id/status', requireAdmin, validId(), validate(OrderStatusInput), async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { status } = req.body;
  if (status === order.status) return res.json(order);
  if (!NEXT[order.status].includes(status)) {
    return res.status(400).json({ error: `Cannot go from "${order.status}" to "${status}"` });
  }
  order.status = status;
  order.history.push({ status });
  await order.save();
  await order.populate('user', 'name email phone');
  res.json(order);
});

export default router;
