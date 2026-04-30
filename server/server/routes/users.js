// /api/users — auth, profile, password change (JWT-secured)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { signToken, requireAuth } = require('../middleware/auth');

// POST /api/users/register — issues JWT
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already used' });
    const user = await User.create({ name, email, password });
    const token = signToken(user);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/users/login — issues JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/users/me — return current user from JWT
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.id, '-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/users — list (no passwords) — JWT required
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/users/:id/password — change own password (JWT required)
router.put('/:id/password', requireAuth, async (req, res) => {
    if (req.auth.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/users/:id — update profile (JWT required)
router.put('/:id', requireAuth, async (req, res) => {
    if (req.auth.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { name, email } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim())  updates.name  = name.trim();
    if (typeof email === 'string' && email.trim()) updates.email = email.trim().toLowerCase();
    if (updates.email) {
      const clash = await User.findOne({ email: updates.email, _id: { $ne: req.params.id } });
      if (clash) return res.status(400).json({ error: 'Email already used' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
