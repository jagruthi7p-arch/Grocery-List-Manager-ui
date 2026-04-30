// /api/admin — admin panel endpoints
const express = require('express');
const router = express.Router();
const User  = require('../models/User');
const Group = require('../models/Group');
const List  = require('../models/List');
const Item  = require('../models/Item');
const { requireAdmin, ADMIN_PASSWORD } = require('../middleware/adminAuth');

// POST /api/admin/login (public)
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  res.json({ ok: true });
});

// All routes below require admin password header
router.use(requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [users, groups, lists, items, completedLists] = await Promise.all([
      User.countDocuments(), Group.countDocuments(), List.countDocuments(),
      Item.countDocuments(), List.countDocuments({ completedAt: { $ne: null } })
    ]);
    res.json({ users, groups, lists, items, completedLists });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort('-_id');
    const groupsByUser = await Group.aggregate([
      { $unwind: '$members' },
      { $group: { _id: '$members', count: { $sum: 1 } } }
    ]);
    const counts = Object.fromEntries(groupsByUser.map(g => [String(g._id), g.count]));
    res.json(users.map(u => ({ ...u.toObject(), groupCount: counts[String(u._id)] || 0 })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort('-_id');
    const listCounts = await List.aggregate([
      { $group: { _id: '$groupId', count: { $sum: 1 } } }
    ]);
    const counts = Object.fromEntries(listCounts.map(g => [String(g._id), g.count]));
    res.json(groups.map(g => ({ ...g.toObject(), listCount: counts[String(g._id)] || 0 })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/lists', async (req, res) => {
  try {
    const lists = await List.find({})
      .populate('createdBy', 'name email')
      .populate('groupId', 'groupName')
      .sort('-createdAt');
    const itemCounts = await Item.aggregate([
      { $group: { _id: '$listId', total: { $sum: 1 }, done: { $sum: { $cond: ['$isPurchased', 1, 0] } } } }
    ]);
    const counts = Object.fromEntries(itemCounts.map(g => [String(g._id), g]));
    res.json(lists.map(l => {
      const c = counts[String(l._id)] || { total: 0, done: 0 };
      return { ...l.toObject(), itemTotal: c.total, itemDone: c.done };
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    const groups = await Group.find({ members: id });
    for (const g of groups) {
      g.members = g.members.filter(m => String(m) !== id);
      if (g.members.length === 0) {
        const lists = await List.find({ groupId: g._id });
        for (const l of lists) await Item.deleteMany({ listId: l._id });
        await List.deleteMany({ groupId: g._id });
        await Group.findByIdAndDelete(g._id);
      } else {
        await g.save();
      }
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/groups/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const lists = await List.find({ groupId: id });
    for (const l of lists) await Item.deleteMany({ listId: l._id });
    await List.deleteMany({ groupId: id });
    await Group.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/lists/:id', async (req, res) => {
  try {
    await Item.deleteMany({ listId: req.params.id });
    await List.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
