import 'dotenv/config';
import { checkEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 5000;

try {
  checkEnv(); // crash early with a clear message if .env is missing
  await connectDB(); // connect first, then listen
  const app = createApp();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}
