# Eden Jewelry API

Base URL (local): `http://localhost:5000`

- Bodies are JSON (`Content-Type: application/json`), max 10 kB.
- Errors are always JSON: `{ "error": "message" }` (validation errors also have `"field"`).
- Private routes need the header `Authorization: Bearer <token>` (from signup or login).

| Status | Meaning |
|---|---|
| 200 / 201 / 204 | OK / created / deleted (no body) |
| 400 | Bad input or bad id |
| 401 | No token, bad token, or wrong email/password |
| 403 | Logged in but not an admin |
| 404 | Not found (also for someone else's order) |
| 409 | Email or product code already used |
| 429 | Too many requests (login: 5 failed tries per 15 min) |

## Routes

### Health
| Method | Route | Access |
|---|---|---|
| GET | `/api/health` | public |

### Auth
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/api/auth/signup` | public | `{ name, email, password (8+), phone? }` → 201 `{ token, user }` |
| POST | `/api/auth/login` | public | `{ email, password }` → 200 `{ token, user }` |
| GET | `/api/auth/me` | logged in | → `{ user }` |

### Products (rings)
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/api/products` | public | query: `q, type, stone, color, minPrice, maxPrice, featured, sort (new, price-asc, price-desc, name), page, limit (max 50)` → `{ items, total, page, pages }` |
| GET | `/api/products/filters` | public | → `{ stones, colors, minPrice, maxPrice }` |
| GET | `/api/products/:id` | public | 400 bad id, 404 missing |
| POST | `/api/products` | admin | `{ code, name, price, type?, stone?, color?, description?, images?, videos?, sizes?, inStock?, featured? }` → 201 |
| PATCH | `/api/products/:id` | admin | any of the fields above → 200 |
| DELETE | `/api/products/:id` | admin | → 204 |

### Favourites
| Method | Route | Access |
|---|---|---|
| GET | `/api/favorites` | logged in → `{ items: [products] }` |
| POST | `/api/favorites/:productId` | logged in → 201 `{ favorites: [ids] }` |
| DELETE | `/api/favorites/:productId` | logged in → `{ favorites: [ids] }` |

### Orders (order requests)
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/orders` | logged in | `{ items: [{ productId, quantity (1-10), size }], contact: { phone, address, note? } }` → 201. Prices come from the database. Rings need a size. |
| GET | `/api/orders/mine` | logged in | only your orders |
| PATCH | `/api/orders/:id/cancel` | owner | only while `requested` |
| GET | `/api/orders` | admin | every order + customer name/email/phone |
| PATCH | `/api/orders/:id/status` | admin | `{ status }`. Allowed: requested→confirmed/cancelled, confirmed→shipped/cancelled, shipped→delivered |

### Uploads (ImageKit)
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/api/uploads/status` | admin | `{ enabled }` (false without `IMAGEKIT_PRIVATE_KEY`) |
| POST | `/api/uploads?code=R01` | admin | multipart field `photo` (jpg, png, webp, avif, max 10 MB) → 201 `{ url }`. Stored in ImageKit folder `eden/R01`. 503 if the key is missing |

Then save the link on the ring with `PATCH /api/products/:id` → `{ "images": [ ... ] }`.

### Market (free third-party API)
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/api/market` | public | `{ currency: "USD", gold: { perOunce, perGram }, silver: { perOunce, perGram }, updatedAt, stale }`. Cached 30 min. 503 if the source is down and nothing is cached |

## curl examples

On Windows PowerShell type `curl.exe` (not `curl`). Replace `TOKEN` and ids with real values.

```bash
# health
curl -i http://localhost:5000/api/health

# gold + silver price (USD)
curl -i http://localhost:5000/api/market

# sign up
curl -i -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Alice\",\"email\":\"alice@test.com\",\"password\":\"alicepass123\"}"

# log in (copy the token from the answer)
curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"alice@test.com\",\"password\":\"alicepass123\"}"

# list emerald rings, cheapest first
curl -i "http://localhost:5000/api/products?stone=emerald&sort=price-asc"

# one ring
curl -i http://localhost:5000/api/products/PRODUCT_ID

# save a favourite
curl -i -X POST http://localhost:5000/api/favorites/PRODUCT_ID -H "Authorization: Bearer TOKEN"

# send an order request
curl -i -X POST http://localhost:5000/api/orders -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"items\":[{\"productId\":\"PRODUCT_ID\",\"quantity\":1,\"size\":7}],\"contact\":{\"phone\":\"+961 70 123 456\",\"address\":\"Tyre, main street\"}}"

# my orders
curl -i http://localhost:5000/api/orders/mine -H "Authorization: Bearer TOKEN"

# admin: create a ring
curl -i -X POST http://localhost:5000/api/products -H "Authorization: Bearer ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"code\":\"R21\",\"name\":\"New Ring\",\"price\":80,\"stone\":\"emerald\"}"

# admin: upload a photo for R01
curl -i -X POST "http://localhost:5000/api/uploads?code=R01" -H "Authorization: Bearer ADMIN_TOKEN" -F "photo=@ring.jpg"

# admin: confirm an order
curl -i -X PATCH http://localhost:5000/api/orders/ORDER_ID/status -H "Authorization: Bearer ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"status\":\"confirmed\"}"
```
