/* © 2026 Eden Jewelry. All rights reserved. */
// Pure cart functions (no React), so they are easy to test.
export const MAX_QTY = 10;

const clamp = (n) => Math.max(1, Math.min(MAX_QTY, Math.round(Number(n) || 1)));

export const lineKey = (productId, size) => `${productId}:${size ?? ''}`;

// state = array of lines: { key, productId, code, name, price, image, stone, color, size, quantity }
export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { item } = action;
      const key = lineKey(item.productId, item.size);
      const existing = state.find((l) => l.key === key);
      if (existing) {
        return state.map((l) => (l.key === key ? { ...l, quantity: clamp(l.quantity + item.quantity) } : l));
      }
      return [...state, { ...item, key, quantity: clamp(item.quantity) }];
    }
    case 'setQty':
      return state.map((l) => (l.key === action.key ? { ...l, quantity: clamp(action.quantity) } : l));
    case 'remove':
      return state.filter((l) => l.key !== action.key);
    case 'clear':
      return [];
    default:
      return state;
  }
}

export const cartCount = (lines) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartTotal = (lines) => Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;

// What the API expects in POST /api/orders
export const toOrderItems = (lines) =>
  lines.map((l) => ({ productId: l.productId, quantity: l.quantity, size: l.size ?? null }));
