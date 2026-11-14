import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

// Describe the shape once (Session 21). Unknown keys are dropped,
// so nobody can send "role": "admin" or "userId": "someone-else".

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const email = z.string().trim().toLowerCase().email('Enter a valid email').max(120);
const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s()-]{5,19}$/, 'Enter a valid phone number');

// ---------- auth ----------
export const SignupInput = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
  phone: phone.optional().or(z.literal('')).default(''),
});

export const LoginInput = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(72),
});

// ---------- products ----------
const mediaUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => /^https:\/\/[^\s<>"']+$/.test(v) || /^\/[\w\-./]+$/.test(v),
    'Media must be an https:// link or a path like /rings/R01/1.jpg'
  );

const lowerWord = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z][a-z\s-]{0,29}$/, 'Use letters only (max 30)');

export const ProductInput = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{2,12}$/, 'Code: 2-12 letters/numbers, like R21'),
  name: z.string().trim().min(2, 'Name is required').max(100),
  type: z.enum(['ring', 'chain', 'pendant']).default('ring'),
  stone: lowerWord.default('none'),
  color: lowerWord.default('silver'),
  price: z.coerce.number().min(0, 'Price must be 0 or more').max(100000),
  description: z.string().trim().max(2000).default(''),
  images: z.array(mediaUrl).max(12).default([]),
  videos: z.array(mediaUrl).max(4).default([]),
  sizes: z.array(z.number().min(3).max(15)).max(20).default([5, 6, 7, 8, 9, 10, 11, 12]),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
});

// PATCH: every field optional, only the fields sent are changed.
export const ProductUpdate = ProductInput.partial();

export const ProductQuery = z.object({
  q: z.string().trim().max(60).optional(),
  type: z.enum(['ring', 'chain', 'pendant']).optional(),
  stone: lowerWord.optional(),
  color: lowerWord.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.enum(['true', 'false']).optional(),
  sort: z.enum(['new', 'price-asc', 'price-desc', 'name']).default('new'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// ---------- orders ----------
export const OrderInput = z.object({
  items: z
    .array(
      z.object({
        productId: objectId,
        quantity: z.number().int().min(1).max(10),
        size: z.number().min(3).max(15).nullable().optional(),
      })
    )
    .min(1, 'Your cart is empty')
    .max(20, 'Too many items in one order'),
  contact: z.object({
    phone,
    address: z.string().trim().min(5, 'Enter your delivery address').max(300),
    note: z.string().trim().max(500).default(''),
  }),
});

export const OrderStatusInput = z.object({
  status: z.enum(ORDER_STATUSES),
});

export { objectId };
