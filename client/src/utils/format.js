/* © 2026 Eden Jewelry. All rights reserved. */
export const formatPrice = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

// "none" stone reads better as "Plain band"
export const stoneLabel = (stone) => (!stone || stone === 'none' ? 'Plain band' : capitalize(stone));

export const STATUS_STEPS = ['requested', 'confirmed', 'shipped', 'delivered'];
