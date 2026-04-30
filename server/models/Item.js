// Grocery item collection (spec §11)
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  listId:      { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  name:        { type: String, required: true },
  category:    { type: String, default: 'Other' },
  quantity:    { type: String, default: '1' },
  isPurchased: { type: Boolean, default: false },
  updatedAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
