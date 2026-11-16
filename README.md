# Eden Jewelry Store

A full-stack online showroom for a small silver workshop near Tyre, south Lebanon.
The workshop has no showroom and is far from the city, so customers browse every ring
in photos and video, choose a stone and size, and send an **order request**. The owner
manages the rings and the requests from a private dashboard.
- Live site: `https://YOUR-SITE.vercel.app` (fill in after deployment)
- Live API: `https://YOUR-API.onrender.com/api/health` (fill in after deployment)

---

## Features

**Customers**
- Animated home page: a blacksmith melts silver, pours it, hammers a ring and sets the stone as you scroll (GSAP ScrollTrigger + Lenis smooth scroll)
- Collection of 20 rings with search, filters (stone, colour, price), sorting and pages
- Ring page with a photo + video gallery, size picker, size guide and WhatsApp button
- Cart saved in the browser
- Sign up / log in (bcrypt + JWT)
- Order request with phone and address, then **status tracking**: requested → confirmed → shipped → delivered
- Cancel a request while it is still "requested"
- Save favourite rings

**Workshop owner (admin)**
- Add, edit, delete rings; mark sold out or featured
- Ring photos uploaded from the **admin dashboard** to **ImageKit** (free); delete a photo or choose the cover; resized automatically for fast loading
- See every order request with the customer's contact and move it through the status flow

**Beyond CRUD**
- Order-request workflow with allowed status transitions and history dates
- Server-side pricing (the browser never decides the price)
- Third-party APIs: **ImageKit** (photo upload and hosting) and **gold-api.com** (live gold and silver prices in USD, no key)
- Cart → **Download as PDF** (items, sizes, quantities, prices, total) and **Send on WhatsApp**
- Round WhatsApp chat button on every page
- Beyond CRUD: order-request workflow with allowed status transitions and server-side pricing

---

## Tech stack

| Part | Tools |
|---|---|
| Front end | React 19, Vite, React Router, GSAP + ScrollTrigger, Lenis |
| Back end | Node.js, Express 5, RESTful JSON API |
| Database | MongoDB Atlas + Mongoose |
| Auth | bcrypt (12 rounds), JSON Web Tokens, `requireAuth` + `requireAdmin` middleware |
| Validation | zod (every body and query) |
| Security | helmet, CORS allow-list, rate limiting, body size limit, `sanitizeFilter` |
| Third-party API | gold-api.com (gold + silver, backup xaus.com), called from `server/src/utils/market.js`, cached 30 min |
| PDF | pdf-lib in the browser (cart summary) |
| Photos | ImageKit upload API, called from `server/src/config/imagekit.js` (multer, memory only, admin only, 10 MB max) |
| Tests | Jest + Supertest (back end), Vitest + React Testing Library (front end) |
| Deployment | Vercel (front end), Render (API), MongoDB Atlas (database) |

---

## Architecture

```
eden-jewelry-store/
├─ client/                 React app (Vite, port 5173)
│  └─ src/
│     ├─ api/client.js     apiFetch: base URL, token header, errors, 401 -> logout
│     ├─ auth/             AuthContext (token, user, login, signup, favourites)
│     ├─ cart/             CartContext + pure cart logic
│     ├─ components/       Navbar, ProductCard, MediaGallery, StatusTimeline...
│     │  └─ forge/         ForgeScene (SVG) + ForgeHero (GSAP scroll story)
│     ├─ pages/            Home, Shop, Product, Cart, Login, Signup, Account, admin/
│     ├─ lib/smooth.js     Lenis smooth scroll synced with ScrollTrigger
│     └─ tests/            Vitest tests
└─ server/                 Express API (port 5000)
   ├─ src/
   │  ├─ index.js          loads .env, checks secrets, connects DB, starts server
   │  ├─ app.js            middleware order + routes (imported by tests)
   │  ├─ models/           User, Product, Order (Mongoose)
   │  ├─ routes/           auth, products, favorites, orders, uploads, market
   │  ├─ middleware/       requireAuth, requireAdmin, validate, errors
   │  ├─ validation/       zod schemas
   │  ├─ utils/            JWT helpers, server-side pricing
   │  └─ seed/             20 rings + admin account
   └─ tests/               Jest + Supertest tests
```

One request end to end: `ProductPage` → `apiFetch('/api/orders')` → `requireAuth` →
`validate(OrderInput)` → `buildOrderLines` (prices from the DB) → `Order.create` → MongoDB.

### Database

- **users**: name, email (unique), phone, passwordHash, role (`customer`/`admin`), favorites → products
- **products**: code (R01…), name, type, stone, color, price, description, images[], videos[], sizes[], inStock, featured
- **orders**: user → users, items[] (product, name, price at order time, quantity, size), total, status, history[], contact {phone, address, note}

All routes are documented in [API.md](API.md). Security work is in [SECURITY.md](SECURITY.md).

---

## Setup (local)

Requirements: Node.js 20+, a free MongoDB Atlas cluster.

```powershell
# 1. install everything (root, server and client)
npm install

# 2. create the server secrets file
Copy-Item server\.env.example server\.env
#    open server/.env and fill MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. add the 20 rings and the admin account
npm run seed

# 4. start API (5000) + website (5173)
npm run dev
```

Open http://localhost:5173. Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`
to see the **Dashboard**. Sign up with another email to test as a customer.

The front end talks to `http://localhost:5000` by default. To change it, copy
`client/.env.example` to `client/.env.development`.

### Tests

```powershell
npm test            # runs both
npm test --prefix server
npm test --prefix client
```

The back-end tests do not need a database.

---

## Adding the ring photos

1. Create a free account on **imagekit.io** → Dashboard → **Developer options** → copy the **Private key**.
2. Put it in `server/.env` → `IMAGEKIT_PRIVATE_KEY=private_...` (and in Render for the live site). Restart `npm run dev`.
3. Log in as admin → **Dashboard → Rings → Edit** → **Upload photos** → choose one or more photos → **Save changes**.
   - The first photo is the cover; click *Cover* on another photo to change it, ✕ to remove it.
   - Photos are saved on ImageKit in `eden/R01`, `eden/R02` …, and the link is stored in MongoDB.

Without the key the Upload button is off, but you can still paste a photo link.
Removing a photo from a ring does not delete the file on ImageKit (delete it there if needed).

---

## Deployment

1. **MongoDB Atlas** → Network Access → allow `0.0.0.0/0` (Render has changing IPs).
2. **Render** (API) → New Web Service → this repo
   - Root directory: `server` · Build: `npm install` · Start: `npm start`
   - Environment: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET` (32+ random chars), `CLIENT_ORIGIN=https://YOUR-SITE.vercel.app`, `IMAGEKIT_PRIVATE_KEY`
   - Check `https://YOUR-API.onrender.com/api/health`
3. **Vercel** (front end) → New Project → this repo
   - Root directory: `client` · Framework: Vite
   - Environment: `VITE_API_URL=https://YOUR-API.onrender.com` (no trailing slash), `VITE_WHATSAPP_NUMBER` (WhatsApp buttons)
4. Put the Vercel URL in Render's `CLIENT_ORIGIN` (no trailing slash) and redeploy.
5. Run the seed once against the Atlas database from your computer: `npm run seed`.

Note: Render's free plan sleeps after inactivity, so the first request can take ~1 minute.

---

## What I would build next

Arabic / English switch, email notification when an order status changes, custom order
with a reference photo, and online payment.


## Copyright

© 2026 Eden Jewelry. All rights reserved. See [LICENSE](LICENSE).
