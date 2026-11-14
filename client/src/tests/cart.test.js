/* © 2026 Eden Jewelry. All rights reserved. */
import { describe, expect, test } from 'vitest';
import { cartReducer, cartCount, cartTotal, toOrderItems } from '../cart/cartLogic.js';
import { validateSignup } from '../pages/SignupPage.jsx';

const item = { productId: 'a1', name: 'Tyre Halo', price: 160, size: 7, quantity: 1 };

describe('cart logic', () => {
  test('adding the same ring and size twice merges the line', () => {
    let state = cartReducer([], { type: 'add', item });
    state = cartReducer(state, { type: 'add', item: { ...item, quantity: 2 } });
    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(3);
    expect(cartCount(state)).toBe(3);
    expect(cartTotal(state)).toBe(480);
  });

  test('a different size is a separate line', () => {
    let state = cartReducer([], { type: 'add', item });
    state = cartReducer(state, { type: 'add', item: { ...item, size: 8 } });
    expect(state).toHaveLength(2);
  });

  test('quantity is kept between 1 and 10', () => {
    let state = cartReducer([], { type: 'add', item });
    state = cartReducer(state, { type: 'setQty', key: state[0].key, quantity: 99 });
    expect(state[0].quantity).toBe(10);
    state = cartReducer(state, { type: 'setQty', key: state[0].key, quantity: 0 });
    expect(state[0].quantity).toBe(1);
  });

  test('remove and clear', () => {
    let state = cartReducer([], { type: 'add', item });
    expect(cartReducer(state, { type: 'remove', key: state[0].key })).toEqual([]);
    expect(cartReducer(state, { type: 'clear' })).toEqual([]);
  });

  test('order items only send id, quantity and size (never the price)', () => {
    const state = cartReducer([], { type: 'add', item });
    expect(toOrderItems(state)).toEqual([{ productId: 'a1', quantity: 1, size: 7 }]);
  });
});

describe('signup validation', () => {
  test('flags a short password and mismatched confirmation', () => {
    const errors = validateSignup({ name: 'Al', email: 'al@test.com', phone: '', password: '123', confirm: '1234' });
    expect(errors.password).toMatch(/8 characters/);
    expect(errors.confirm).toMatch(/do not match/);
  });

  test('accepts a valid form', () => {
    const errors = validateSignup({
      name: 'Alice',
      email: 'alice@test.com',
      phone: '+961 70 123 456',
      password: 'longpassword',
      confirm: 'longpassword',
    });
    expect(errors).toEqual({});
  });
});
