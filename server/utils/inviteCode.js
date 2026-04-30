// Friendly 6-char invite codes (no 0/O/1/I/L to avoid confusion)
const Group = require('../models/Group');

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

async function generateInviteCode() {
  for (let attempt = 0; attempt < 8; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const exists = await Group.findOne({ inviteCode: code });
    if (!exists) return code;
  }
  throw new Error('Could not generate invite code');
}

module.exports = { generateInviteCode };
