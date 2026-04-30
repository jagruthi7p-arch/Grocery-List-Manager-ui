// Group collection — shared household / group of users (spec §11)
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName:  { type: String, required: true },
  inviteCode: { type: String, unique: true, sparse: true, index: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:  { type: Date, default: Date.now },
  members:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Group', groupSchema);
