const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — create booking
router.post('/', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  const { listing_id, start_date, end_date, size_sqm, notes } = req.body || {};

  if (!listing_id) return res.status(400).json({ error: 'invalid_listing' });
  if (!start_date || !end_date) return res.status(400).json({ error: 'invalid_dates' });
  if (!size_sqm || size_sqm <= 0) return res.status(400).json({ error: 'invalid_size' });

  try {
    const listing = await pool.query('SELECT id, price_sqm, user_id, is_active FROM listings WHERE id = $1', [listing_id]);
    if (!listing.rows.length || !listing.rows[0].is_active) return res.status(404).json({ error: 'listing_not_found' });
    if (listing.rows[0].user_id === userId) return res.status(400).json({ error: 'cannot_book_own' });

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start) || isNaN(end) || end <= start) return res.status(400).json({ error: 'invalid_dates' });

    const months = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30)));
    const total_price = (listing.rows[0].price_sqm * size_sqm * months).toFixed(2);

    const { rows } = await pool.query(
      `INSERT INTO bookings (listing_id, user_id, start_date, end_date, size_sqm, total_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [listing_id, userId, start_date, end_date, size_sqm, total_price, notes || '']
    );
    return res.status(201).json({ booking: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/bookings — list user's bookings
router.get('/', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  try {
    const { rows } = await pool.query(
      `SELECT b.*, l.title as listing_title, l.city, l.type, l.images
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return res.json({ bookings: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/bookings/:id — booking detail
router.get('/:id', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  try {
    const { rows } = await pool.query(
      `SELECT b.*, l.title as listing_title, l.city, l.type, l.address, l.price_sqm, l.images
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE b.id = $1 AND (b.user_id = $2 OR l.user_id = $2)`,
      [id, userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    return res.json({ booking: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  try {
    const { rows } = await pool.query(
      `SELECT b.*, l.user_id as owner_id FROM bookings b JOIN listings l ON l.id = b.listing_id WHERE b.id = $1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    if (rows[0].user_id !== userId && rows[0].owner_id !== userId) return res.status(403).json({ error: 'forbidden' });
    if (rows[0].status === 'cancelled') return res.status(400).json({ error: 'already_cancelled' });

    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.json({ booking: result.rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// PATCH /api/bookings/:id/confirm — listing owner confirms
router.patch('/:id/confirm', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });
  try {
    const { rows } = await pool.query(
      `SELECT b.*, l.user_id as owner_id FROM bookings b JOIN listings l ON l.id = b.listing_id WHERE b.id = $1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    if (rows[0].owner_id !== userId) return res.status(403).json({ error: 'forbidden' });
    if (rows[0].status !== 'pending') return res.status(400).json({ error: 'not_pending' });

    const result = await pool.query(
      `UPDATE bookings SET status = 'confirmed', updated_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.json({ booking: result.rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
