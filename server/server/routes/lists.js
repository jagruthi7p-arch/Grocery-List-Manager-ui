// /api/lists — shopping lists belonging to a group
const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Item = require('../models/Item');
const { broadcast } = require('../utils/sse');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// POST /api/lists — create
router.post('/', async (req, res) => {
  try {
    const { groupId, name, userId } = req.body;
    const list = await List.create({ groupId, name, createdBy: userId });
    const populated = await List.findById(list._id).populate('createdBy', 'name email');
    broadcast({ type: 'list:created', list: populated });
    res.json(populated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/lists/group/:groupId — lists for a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const lists = await List.find({ groupId: req.params.groupId })
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.json(lists);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/lists/:listId — rename / mark complete
router.put('/:listId', async (req, res) => {
  try {
    const { name, completedAt } = req.body;
    const updates = {};
    if (typeof name === 'string') updates.name = name;
    if (completedAt === null || completedAt instanceof Date || typeof completedAt === 'string') {
      updates.completedAt = completedAt ? new Date(completedAt) : null;
    }
    const list = await List.findByIdAndUpdate(req.params.listId, updates, { new: true })
      .populate('createdBy', 'name email');
    broadcast({ type: 'list:updated', list });
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/lists/:listId — also wipes its items
router.delete('/:listId', async (req, res) => {
  try {
    await List.findByIdAndDelete(req.params.listId);
    await Item.deleteMany({ listId: req.params.listId });
    broadcast({ type: 'list:deleted', listId: req.params.listId });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
