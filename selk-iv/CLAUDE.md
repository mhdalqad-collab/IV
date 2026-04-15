# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Selk is a B2B marketplace for storage space (warehouses, containers, garages, etc.) — think Booking.com for industrial storage. The project is split into two separate directories on the same VPS:

- **`/root/selk-iv`** — Frontend: static HTML/CSS/JS served by nginx
- **`/root/selk-api`** — Backend: Node.js/Express REST API with PostgreSQL

Domain: `selk.om` (HTTPS via nginx, Cloudflare in front)

## Architecture

```
Browser ──HTTPS──> nginx (selk.om :443)
                    ├── /            → static files from /root/selk-iv
                    └── /api/*       → reverse proxy → Node API on 127.0.0.1:3001
                                                            │
                                                            └── pg → PostgreSQL on 127.0.0.1:5432
```

- nginx config: `/etc/nginx/sites-enabled/selk.om`
- systemd service: `/etc/systemd/system/selk-api.service`
- Database: `selk` database, `selk_app` role, localhost-only

## Backend (`/root/selk-api`)

### Running / Restarting

```bash
systemctl restart selk-api      # restart after code changes
systemctl status selk-api       # check if running
journalctl -u selk-api -f       # tail logs
```

### Environment Variables (`.env`)

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — HMAC key for JWT signing
- `PORT` — API listen port (default 3001)

### API Routes

| Prefix | File | Auth | Purpose |
|--------|------|------|---------|
| `/api/auth` | `routes/auth.js` | Rate-limited (10/min) | Signup, login, token verify |
| `/api/listings` | `routes/listings.js` | Public reads, JWT writes | CRUD + search with filters |
| `/api/bookings` | `routes/bookings.js` | JWT required | Create, list, cancel, confirm |
| `/api/dashboard` | `routes/dashboard.js` | JWT required | Owner stats, earnings, reservations |

Auth middleware in `middleware/auth.js` — extracts `req.user` from Bearer token with `{ sub, email }` payload.

The `pool` (pg Pool instance) is shared via `app.set('pool', pool)` / `req.app.get('pool')`.

### Database Schema (`schema.sql`)

4 tables: `users`, `listings`, `bookings`, `reviews`. Key details:
- `users.email` uses `CITEXT` (case-insensitive)
- `listings.type` is constrained to: `warehouse`, `container`, `climate`, `basement`, `garage`, `outdoor`
- `listings.amenities` and `listings.images` are `TEXT[]` arrays
- `bookings.status` flow: `pending` → `confirmed` or `cancelled` (or `completed`)
- Soft-delete on listings via `is_active` boolean

### Testing API

```bash
# Health check
curl http://127.0.0.1:3001/api/health

# Search listings
curl "http://127.0.0.1:3001/api/listings?city=Muscat&type=warehouse&sort=price_asc&limit=5"

# Auth flow
curl -X POST http://127.0.0.1:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"hunter22!"}'

# Authenticated request (replace TOKEN)
curl http://127.0.0.1:3001/api/dashboard/stats -H "Authorization: Bearer TOKEN"
```

### Database Access

```bash
sudo -u postgres psql -d selk                    # connect
sudo -u postgres psql -d selk -f schema.sql      # run migrations
sudo -u postgres psql -d selk -f seed.sql         # insert seed data
```

After adding new tables, grant permissions:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO selk_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO selk_app;
```

## Frontend (`/root/selk-iv`)

No build system — plain HTML/CSS/JS. Changes are live immediately after saving (nginx serves files from disk).

### JS Module Architecture

All JS uses IIFE pattern. Load order matters:

1. `api.js` — `window.selkApi` fetch wrapper, auto-injects JWT Bearer token from localStorage
2. `auth.js` — Login/signup form handlers (only on login.html/signup.html)
3. `listings.js` — Renders listing cards on index.html, search.html, listing.html
4. `booking.js` — Booking form on booking.html
5. `dashboard.js` — Dashboard data on dashboard.html
6. `app.js` — Shared UI: sparklines, calendars, carousels, steppers, range sliders

### Pages

| Page | Data Source | Auth Required |
|------|------------|---------------|
| `index.html` | `GET /api/listings?limit=6&sort=rating` | No |
| `search.html` | `GET /api/listings?...filters` | No |
| `listing.html?id=X` | `GET /api/listings/:id` | No |
| `booking.html?listing=X` | `POST /api/bookings` | Yes (redirects to login) |
| `dashboard.html` | `/api/dashboard/*` | Yes (redirects to login) |

### Cloudflare Caching

Cloudflare sits in front of nginx. After editing frontend files, users may see stale versions. Options:
- Hard refresh: Ctrl+Shift+R
- Bypass for testing: `curl -sk --resolve selk.om:443:127.0.0.1 https://selk.om/path`
- Purge cache from Cloudflare dashboard

## nginx

```bash
nginx -t && systemctl reload nginx    # test + reload after config changes
```

The `/api/` location block proxies to the Node API. Static files use `try_files`.
