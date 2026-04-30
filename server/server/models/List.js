// Shopping list collection (spec §11)
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  groupId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  name:        { type: String, default: 'Shopping List' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:   { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
});

module.exports = mongoose.model('List', listSchema);
