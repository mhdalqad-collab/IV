const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const authLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });

const isEmail = (s) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
const isPassword = (s) => typeof s === 'string' && s.length >= 8 && s.length <= 128;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', authLimiter, async (req, res) => {
  const pool = req.app.get('pool');
  const { email, password } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: 'invalid_email' });
  if (!isPassword(password)) return res.status(400).json({ error: 'password_min_8' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hash]
    );
    const user = rows[0];
    return res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email } });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'email_taken' });
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const pool = req.app.get('pool');
  const { email, password } = req.body || {};
  console.log('[login] attempt:', email, '| pw length:', password?.length);
  if (!isEmail(email) || !isPassword(password)) {
    console.log('[login] validation failed — email valid:', isEmail(email), '| pw valid:', isPassword(password));
    return res.status(400).json({ error: 'invalid_credentials' });
  }
  try {
    const { rows } = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [email]);
    if (!rows.length) { console.log('[login] no user found for:', email); return res.status(401).json({ error: 'invalid_credentials' }); }
    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) { console.log('[login] bcrypt mismatch for:', email); return res.status(401).json({ error: 'invalid_credentials' }); }
    const user = rows[0];
    return res.json({ token: signToken(user), user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: 'no_token' });
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    return res.json({ user: { id: payload.sub, email: payload.email } });
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
});

module.exports = router;
