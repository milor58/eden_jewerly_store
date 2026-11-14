// Fail fast: crash at startup if a required secret is missing (Session 21).
const REQUIRED = ['MONGODB_URI', 'JWT_SECRET'];

export function checkEnv() {
  for (const key of REQUIRED) {
    if (!process.env[key]) {
      throw new Error(`Missing env var: ${key}. Copy server/.env.example to server/.env and fill it in.`);
    }
  }
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET is too short for production (use 32+ random characters).');
  }
}

export function clientOrigins() {
  return (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}
