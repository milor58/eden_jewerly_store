# Security (Session 21 lab)

Each hole from the Session 21 checklist, how to try it, and where it is fixed.
Run each attack against your own API and paste the real responses in the **Result** column
(before = without the fix, after = now).

| Hole | Try this | Fix in the code | Result |
|---|---|---|---|
| IDOR | Bob cancels Alice's order: `PATCH /api/orders/ALICE_ORDER_ID/cancel` with Bob's token | Every query filters by `user: req.userId` → 404 (`routes/orders.js`) | |
| Mass assignment | Sign up with `"role":"admin"`, or send `"user":"someone"` in an order | zod schemas drop unknown keys; role and owner come from the server (`validation/schemas.js`, `routes/auth.js`, `routes/orders.js`) | |
| Price tampering | Send `"price": 1` inside an order item | Prices are read from the database in `utils/pricing.js` | |
| Injection | `GET /api/products?stone=a&stone=b` (array) or `?stone[$ne]=x` | zod accepts strings only → 400 for the array; `stone[$ne]` is read as an unknown plain key and dropped; `mongoose.set('sanitizeFilter', true)` as backstop; search text is regex-escaped (`config/db.js`, `routes/products.js`) | |
| XSS | Ring name `<img src=x onerror=alert(1)>` | React renders text, never `dangerouslySetInnerHTML`; media links must be `https://` or `/path`; helmet CSP on the API | |
| Brute force | 20 wrong logins in a row | `loginLimiter`: 5 failed tries / 15 min → 429 (`app.js`) | |
| Headers | `curl -I http://localhost:5000/api/health` | `helmet()` first in `app.js`; `X-Powered-By` removed | |
| Secrets | `git log -p \| grep SECRET` | `.env` git-ignored, `.env.example` has no real values, server refuses to start without `MONGODB_URI` / `JWT_SECRET` (`config/env.js`) | |
| Admin pages | Customer token on `POST /api/products` | `requireAdmin` reads the role from the database → 403 | |
| Big bodies | Send a 1 MB JSON body | `express.json({ limit: '10kb' })` → 413 | |

## Other choices

- Passwords: bcrypt with 12 rounds, stored as `passwordHash` with `select: false`.
- Login answers one message for both wrong email and wrong password.
- JWT signed with a long random secret, expires after `JWT_EXPIRES_IN` (default 1 day).
- CORS only allows the origins in `CLIENT_ORIGIN`.
- Uploads: admin only (role checked in the database), photos only (jpg/png/webp/avif), max 10 MB, kept in memory and sent to ImageKit (never written to the server disk). The ImageKit private key stays in `server/.env` / Render, never in the client.
- Production hides internal error messages (`Server error`).
- If a secret is ever pushed to GitHub: change it (rotate), deleting the commit is not enough.
