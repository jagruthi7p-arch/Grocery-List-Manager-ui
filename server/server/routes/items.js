// /api/items — grocery items in a list (CRUD + real-time)
const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { broadcast } = require('../utils/sse');
const { recomputeListCompletion } = require('../utils/listCompletion');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET /api/items/list/:listId
router.get('/list/:listId', async (req, res) => {
  try {
    const items = await Item.find({ listId: req.params.listId }).sort('category');
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/items
router.post('/', async (req, res) => {
  try {
    const { listId, name, category, quantity } = req.body;
    const item = await Item.create({ listId, name, category, quantity });
    broadcast({ type: 'item:created', item });
    res.json(item);
    recomputeListCompletion(listId).catch(()=>{});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/items/:id
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    const item = await Item.findByIdAndUpdate(req.params.id, updates, { new: true });
    broadcast({ type: 'item:updated', item });
    res.json(item);
    if (item) recomputeListCompletion(item.listId).catch(()=>{});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    broadcast({ type: 'item:deleted', itemId: req.params.id, listId: item?.listId });
    res.json({ ok: true });
    if (item) recomputeListCompletion(item.listId).catch(()=>{});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
