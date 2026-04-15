const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  const m = (req.headers.authorization || '').match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: 'no_token' });
  try {
    req.user = jwt.verify(m[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = { requireAuth };
