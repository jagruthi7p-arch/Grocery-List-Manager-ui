// Admin-only middleware (header X-Admin-Password)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAdmin(req, res, next) {
  const pwd = req.headers['x-admin-password'];
  if (pwd !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Admin password required' });
  next();
}

module.exports = { requireAdmin, ADMIN_PASSWORD };
