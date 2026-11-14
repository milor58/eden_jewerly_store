import { HttpError } from './httpError.js';

// Builds the order lines from the DATABASE prices, never from prices sent by
// the browser. Pure function, so it is easy to unit test.
//   items:    [{ productId, quantity, size }]  (already validated by zod)
//   products: Map of productId -> product document
export function buildOrderLines(items, products) {
  const merged = new Map();
  for (const item of items) {
    const key = `${item.productId}:${item.size ?? ''}`;
    const prev = merged.get(key);
    merged.set(key, { ...item, quantity: (prev?.quantity || 0) + item.quantity });
  }

  const lines = [];
  for (const item of merged.values()) {
    const product = products.get(item.productId);
    if (!product) throw new HttpError(400, 'One of the pieces in your cart no longer exists');
    if (!product.inStock) throw new HttpError(400, `${product.name} is sold out`);
    if (item.quantity > 10) throw new HttpError(400, 'Maximum 10 of the same piece per order');

    let size = null;
    if (product.type === 'ring') {
      if (item.size == null) throw new HttpError(400, `Choose a ring size for ${product.name}`);
      if (product.sizes?.length && !product.sizes.includes(item.size)) {
        throw new HttpError(400, `Size ${item.size} is not available for ${product.name}`);
      }
      size = item.size;
    }

    lines.push({
      product: product._id,
      code: product.code,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      size,
      image: product.images?.[0] || '',
    });
  }

  const total = Math.round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100) / 100;
  return { lines, total };
}
