import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { clientOrigins } from './config/env.js';
import { requireAuth } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import favoritesRouter from './routes/favorites.js';
import ordersRouter from './routes/orders.js';
import marketRouter from './routes/market.js';
import uploadsRouter from './routes/uploads.js';

// The app is built here and started in index.js, so tests can import it
// without opening a port or a database connection.
export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // Render / Vercel sit behind a proxy
  app.use(helmet()); // secure headers, removes X-Powered-By
  app.use(cors({ origin: clientOrigins() })); // only our front end, before routes
  app.use(express.json({ limit: '10kb' })); // cap body size

  const apiLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false });
  const loginLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Try again in 15 minutes.' },
  });
  const signupLimiter = rateLimit({
    windowMs: 60 * 60_000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many accounts created. Try again later.' },
  });

  app.use('/api', apiLimiter);
  app.use('/api/auth/login', loginLimiter);
  app.use('/api/auth/signup', signupLimiter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'eden-api' });
  });

  // Public
  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter); // GET public, writes check admin inside
  app.use('/api/market', marketRouter); // gold + silver price (free third-party API)

  // Locked: a token is required for everything below
  app.use('/api/favorites', requireAuth, favoritesRouter);
  app.use('/api/orders', requireAuth, ordersRouter);
  app.use('/api/uploads', requireAuth, uploadsRouter); // admin photo upload -> ImageKit

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export default createApp;
