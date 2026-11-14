// Back-end tests: Jest + Supertest.
// They run WITHOUT a database: every request here is answered by
// validation, auth or security middleware before Mongo is touched.
import request from 'supertest';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-tests-123456';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

const { createApp } = await import('../src/app.js');
const { buildOrderLines } = await import('../src/utils/pricing.js');

const app = createApp();

describe('health and security headers', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'eden-api' });
  });

  test('helmet sets secure headers and hides X-Powered-By', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('unknown route returns JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe('input validation', () => {
  test('signup with a bad email is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice', email: 'not-an-email', password: 'longpassword' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  test('signup with a short password is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice', email: 'alice@test.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 characters/);
  });

  test('a filter sent as an array instead of a string is rejected with 400', async () => {
    const res = await request(app).get('/api/products?stone=emerald&stone=diamond');
    expect(res.status).toBe(400);
  });

  test('a bad product id is rejected with 400', async () => {
    const res = await request(app).get('/api/products/not-a-real-id');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid id');
  });

  test('invalid JSON body returns 400, not a crash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
  });
});

describe('authentication on protected routes', () => {
  test('no token -> 401', async () => {
    const res = await request(app).get('/api/orders/mine');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Missing token');
  });

  test('forged token -> 401', async () => {
    const fake = jwt.sign({ sub: '64b000000000000000000000' }, 'wrong-secret');
    const res = await request(app).get('/api/favorites').set('Authorization', `Bearer ${fake}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  test('creating a product without a token -> 401', async () => {
    const res = await request(app).post('/api/products').send({ code: 'R99', name: 'Test', price: 10 });
    expect(res.status).toBe(401);
  });

  test('token without "Bearer " prefix -> 401', async () => {
    const token = jwt.sign({ sub: '64b000000000000000000000' }, process.env.JWT_SECRET);
    const res = await request(app).get('/api/orders/mine').set('Authorization', token);
    expect(res.status).toBe(401);
  });
});

describe('order pricing (server decides the price)', () => {
  const ring = {
    _id: 'a1',
    code: 'R01',
    name: 'Cedar Emerald Solitaire',
    type: 'ring',
    price: 95,
    sizes: [6, 7, 8],
    inStock: true,
    images: [],
  };
  const products = new Map([['a1', ring]]);

  test('uses the database price and merges the same piece + size', () => {
    const { lines, total } = buildOrderLines(
      [
        { productId: 'a1', quantity: 1, size: 7 },
        { productId: 'a1', quantity: 2, size: 7 },
      ],
      products
    );
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
    expect(total).toBe(285);
  });

  test('a ring without a size is refused', () => {
    expect(() => buildOrderLines([{ productId: 'a1', quantity: 1 }], products)).toThrow(/ring size/);
  });

  test('a sold-out piece is refused', () => {
    const soldOut = new Map([['a1', { ...ring, inStock: false }]]);
    expect(() => buildOrderLines([{ productId: 'a1', quantity: 1, size: 7 }], soldOut)).toThrow(/sold out/);
  });
});

describe('market data (free third-party API, mocked)', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  test('GET /api/market returns gold and silver in USD, then answers from cache', async () => {
    const { resetMarketCache } = await import('../src/utils/market.js');
    resetMarketCache();
    global.fetch = jest.fn(async (url) => ({
      ok: true,
      json: async () => ({ price: String(url).includes('XAU') ? 3110.35 : 62.2 }),
    }));
    const res = await request(app).get('/api/market');
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe('USD');
    expect(res.body.gold.perOunce).toBe(3110.35);
    expect(res.body.gold.perGram).toBe(100);
    expect(res.body.silver.perOunce).toBe(62.2);

    const calls = global.fetch.mock.calls.length;
    await request(app).get('/api/market');
    expect(global.fetch.mock.calls.length).toBe(calls); // cached
  });

  test('returns 503 when the APIs are down and nothing is cached', async () => {
    const { resetMarketCache } = await import('../src/utils/market.js');
    resetMarketCache();
    global.fetch = jest.fn(async () => {
      throw new Error('network down');
    });
    const res = await request(app).get('/api/market');
    expect(res.status).toBe(503);
  });
});

describe('photo upload (ImageKit)', () => {
  test('upload without a token -> 401', async () => {
    const res = await request(app).post('/api/uploads?code=R01');
    expect(res.status).toBe(401);
  });

  test('upload status without a token -> 401', async () => {
    const res = await request(app).get('/api/uploads/status');
    expect(res.status).toBe(401);
  });
});
