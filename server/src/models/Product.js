/* © 2026 Eden Jewelry. All rights reserved. */
import mongoose from 'mongoose';

export const DEFAULT_RING_SIZES = [5, 6, 7, 8, 9, 10, 11, 12];

const productSchema = new mongoose.Schema(
  {
    // Short code like R01. Used by the seed and the bulk media upload.
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, enum: ['ring', 'chain', 'pendant'], default: 'ring' },
    stone: { type: String, default: 'none', lowercase: true, trim: true },
    color: { type: String, default: 'silver', lowercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    // https:// links or paths served by the client (/rings/R01/1.jpg)
    images: [{ type: String, trim: true }],
    videos: [{ type: String, trim: true }],
    sizes: { type: [Number], default: () => [...DEFAULT_RING_SIZES] },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ type: 1, stone: 1, color: 1, price: 1 });

export default mongoose.model('Product', productSchema);
