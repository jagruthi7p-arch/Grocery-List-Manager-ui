// Auto-toggle a list's completedAt based on its items
const List = require('../models/List');
const Item = require('../models/Item');
const { broadcast } = require('./sse');

async function recomputeListCompletion(listId) {
  const items = await Item.find({ listId });
  const total = items.length;
  const done  = items.filter(i => i.isPurchased).length;
  const list  = await List.findById(listId);
  if (!list) return null;
  const shouldBeComplete = total > 0 && done === total;
  let changed = false;
  if (shouldBeComplete && !list.completedAt) { list.completedAt = new Date(); changed = true; }
  if (!shouldBeComplete && list.completedAt) { list.completedAt = null; changed = true; }
  if (changed) {
    await list.save();
    const populated = await List.findById(list._id).populate('createdBy', 'name email');
    broadcast({ type: 'list:updated', list: populated });
  }
}

module.exports = { recomputeListCompletion };
