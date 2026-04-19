const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats — overview numbers
router.get('/stats', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  try {
    const listings = await pool.query(
      'SELECT count(*) as total, count(*) FILTER (WHERE is_active) as active FROM listings WHERE user_id = $1',
      [userId]
    );
    const bookings = await pool.query(
      `SELECT count(*) as total,
              count(*) FILTER (WHERE status = 'pending') as pending,
              count(*) FILTER (WHERE status = 'confirmed') as confirmed,
              COALESCE(SUM(total_price) FILTER (WHERE status IN ('confirmed','completed')), 0) as revenue
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE l.user_id = $1`,
      [userId]
    );
    const rating = await pool.query(
      `SELECT COALESCE(AVG(r.rating), 0) as avg_rating, count(r.id) as review_count
       FROM reviews r JOIN listings l ON l.id = r.listing_id
       WHERE l.user_id = $1`,
      [userId]
    );

    return res.json({
      listings: {
        total: parseInt(listings.rows[0].total),
        active: parseInt(listings.rows[0].active),
      },
      bookings: {
        total: parseInt(bookings.rows[0].total),
        pending: parseInt(bookings.rows[0].pending),
        confirmed: parseInt(bookings.rows[0].confirmed),
      },
      revenue: parseFloat(bookings.rows[0].revenue),
      avg_rating: parseFloat(parseFloat(rating.rows[0].avg_rating).toFixed(1)),
      review_count: parseInt(rating.rows[0].review_count),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/dashboard/listings — owner's listings with booking counts
router.get('/listings', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  try {
    const { rows } = await pool.query(
      `SELECT l.*,
              (SELECT count(*) FROM bookings b WHERE b.listing_id = l.id AND b.status != 'cancelled') as booking_count
       FROM listings l WHERE l.user_id = $1 ORDER BY l.created_at DESC`,
      [userId]
    );
    return res.json({ listings: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/dashboard/reservations — incoming bookings for owner's listings
router.get('/reservations', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  try {
    const { rows } = await pool.query(
      `SELECT b.*, l.title as listing_title, l.city, u.email as renter_email
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       JOIN users u ON u.id = b.user_id
       WHERE l.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return res.json({ reservations: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/dashboard/earnings — monthly breakdown
router.get('/earnings', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const userId = req.user.sub;
  try {
    const { rows } = await pool.query(
      `SELECT
         to_char(b.created_at, 'YYYY-MM') as month,
         count(*) as bookings,
         SUM(b.total_price) as revenue
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE l.user_id = $1 AND b.status IN ('confirmed','completed')
       GROUP BY to_char(b.created_at, 'YYYY-MM')
       ORDER BY month DESC
       LIMIT 12`,
      [userId]
    );
    return res.json({ earnings: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
