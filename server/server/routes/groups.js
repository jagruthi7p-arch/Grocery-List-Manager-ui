// /api/groups — household groups
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { generateInviteCode } = require('../utils/inviteCode');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// POST /api/groups — create
router.post('/', async (req, res) => {
  try {
    const { groupName, userId } = req.body;
    const inviteCode = await generateInviteCode();
    const group = await Group.create({ groupName, inviteCode, createdBy: userId, members: [userId] });
    const populated = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');
    res.json(populated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/groups/user/:userId — list groups for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const groups = await Group.find({ members: req.params.userId })
      .populate('members', 'name email')
      .populate('createdBy', 'name email');
    // Backfill invite codes / createdBy for any old groups
    for (const g of groups) {
      let dirty = false;
      if (!g.inviteCode) { g.inviteCode = await generateInviteCode(); dirty = true; }
      if (!g.createdBy && g.members.length > 0) { g.createdBy = g.members[0]._id; dirty = true; }
      if (dirty) await g.save();
    }
    res.json(groups);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/groups/:codeOrId/join — join via code or id
router.post('/:codeOrId/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const key = (req.params.codeOrId || '').trim();
    let group = await Group.findOne({ inviteCode: key.toUpperCase() });
    if (!group && /^[a-fA-F0-9]{24}$/.test(key)) group = await Group.findById(key);
    if (!group) return res.status(404).json({ error: 'No group found with that code' });
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    res.json(group);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
