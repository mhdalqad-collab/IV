const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_TYPES = ['warehouse', 'container', 'climate', 'basement', 'garage', 'outdoor'];
const SORT_MAP = {
  price_asc: 'price_sqm ASC',
  price_desc: 'price_sqm DESC',
  size_asc: 'size_sqm ASC',
  size_desc: 'size_sqm DESC',
  rating: 'rating DESC',
  newest: 'created_at DESC',
};

// GET /api/listings — search with filters + pagination
router.get('/', async (req, res) => {
  const pool = req.app.get('pool');
  const { city, type, min_price, max_price, min_size, max_size, amenities, sort, page = 1, limit = 20 } = req.query;

  const conditions = ['is_active = true'];
  const params = [];
  let idx = 1;

  if (city) { conditions.push(`city ILIKE $${idx}`); params.push(`%${city}%`); idx++; }
  if (type && VALID_TYPES.includes(type)) { conditions.push(`type = $${idx}`); params.push(type); idx++; }
  if (min_price) { conditions.push(`price_sqm >= $${idx}`); params.push(Number(min_price)); idx++; }
  if (max_price) { conditions.push(`price_sqm <= $${idx}`); params.push(Number(max_price)); idx++; }
  if (min_size) { conditions.push(`size_sqm >= $${idx}`); params.push(Number(min_size)); idx++; }
  if (max_size) { conditions.push(`size_sqm <= $${idx}`); params.push(Number(max_size)); idx++; }
  if (amenities) {
    const arr = amenities.split(',').map(s => s.trim()).filter(Boolean);
    if (arr.length) { conditions.push(`amenities @> $${idx}`); params.push(arr); idx++; }
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const order = SORT_MAP[sort] || 'created_at DESC';
  const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const pg = Math.max(parseInt(page) || 1, 1);
  const offset = (pg - 1) * lim;

  try {
    const countQ = await pool.query(`SELECT count(*) FROM listings ${where}`, params);
    const total = parseInt(countQ.rows[0].count);

    const dataQ = await pool.query(
      `SELECT id, user_id, title, description, type, city, country, address, lat, lng,
              size_sqm, price_sqm, currency, amenities, images, rating, review_count,
              free_cancel, insurance, created_at
       FROM listings ${where}
       ORDER BY ${order}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, lim, offset]
    );

    return res.json({
      listings: dataQ.rows,
      total,
      page: pg,
      pages: Math.ceil(total / lim),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/listings/:id — single listing
router.get('/:id', async (req, res) => {
  const pool = req.app.get('pool');
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.email as owner_email
       FROM listings l JOIN users u ON u.id = l.user_id
       WHERE l.id = $1 AND l.is_active = true`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    const listing = rows[0];
    delete listing.password;
    return res.json({ listing });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/listings — create listing
router.post('/', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  const { title, description, type, city, country, address, lat, lng, size_sqm, price_sqm, currency, amenities, images, free_cancel, insurance } = req.body || {};

  if (!title || typeof title !== 'string' || title.length > 200) return res.status(400).json({ error: 'invalid_title' });
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'invalid_type' });
  if (!city) return res.status(400).json({ error: 'invalid_city' });
  if (!size_sqm || size_sqm <= 0) return res.status(400).json({ error: 'invalid_size' });
  if (!price_sqm || price_sqm <= 0) return res.status(400).json({ error: 'invalid_price' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO listings (user_id, title, description, type, city, country, address, lat, lng, size_sqm, price_sqm, currency, amenities, images, free_cancel, insurance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [userId, title, description || '', type, city, country || 'OM', address || '', lat || null, lng || null, size_sqm, price_sqm, currency || 'EUR', amenities || [], images || [], free_cancel || false, insurance || false]
    );
    return res.status(201).json({ listing: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// PUT /api/listings/:id — update listing (owner only)
router.put('/:id', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });

  try {
    const check = await pool.query('SELECT user_id FROM listings WHERE id = $1', [id]);
    if (!check.rows.length) return res.status(404).json({ error: 'not_found' });
    if (check.rows[0].user_id !== userId) return res.status(403).json({ error: 'forbidden' });

    const fields = ['title', 'description', 'type', 'city', 'country', 'address', 'lat', 'lng', 'size_sqm', 'price_sqm', 'currency', 'amenities', 'images', 'free_cancel', 'insurance'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        if (f === 'type' && !VALID_TYPES.includes(req.body[f])) return res.status(400).json({ error: 'invalid_type' });
        updates.push(`${f} = $${idx}`);
        params.push(req.body[f]);
        idx++;
      }
    }
    if (!updates.length) return res.status(400).json({ error: 'no_fields' });

    updates.push(`updated_at = now()`);
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE listings SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return res.json({ listing: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// DELETE /api/listings/:id — soft delete (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });

  try {
    const check = await pool.query('SELECT user_id FROM listings WHERE id = $1', [id]);
    if (!check.rows.length) return res.status(404).json({ error: 'not_found' });
    if (check.rows[0].user_id !== userId) return res.status(403).json({ error: 'forbidden' });

    await pool.query('UPDATE listings SET is_active = false, updated_at = now() WHERE id = $1', [id]);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/listings/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  const pool = req.app.get('pool');
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.email as reviewer
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.listing_id = $1 ORDER BY r.created_at DESC`,
      [id]
    );
    return res.json({ reviews: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
