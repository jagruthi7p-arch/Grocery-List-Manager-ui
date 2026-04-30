// JWT auth middleware — verifies Bearer token from Authorization header
const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET  || 'dev-only-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(user) {
  return jwt.sign({ id: String(user._id), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET, JWT_EXPIRES };
