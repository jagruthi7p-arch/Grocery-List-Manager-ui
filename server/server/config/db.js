// Database layer: MongoDB connection (Mongoose)
const mongoose = require('mongoose');
const dns      = require('dns');

const MONGO_URI = process.env.MONGODB_URI ||
  'mongodb+srv://GROCERYMANAGER1:Kr1yNj5314AQYiqQ@cluster0.ncbvlk8.mongodb.net/groceryListManager?appName=Cluster0';

// Atlas uses DNS SRV records (mongodb+srv://...). Some ISPs / corporate / public Wi-Fi
// DNS servers refuse SRV queries, which causes `querySrv ECONNREFUSED`. Falling back to
// Google + Cloudflare DNS for this process avoids the issue without changing system settings.
if (MONGO_URI.startsWith('mongodb+srv://')) {
  try { dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]); } catch (_) {}
}

function connectDB() {
  return mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected:', MONGO_URI))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      if (/ECONNREFUSED|ENOTFOUND|querySrv|ETIMEOUT/i.test(err.message)) {
        console.error(
          '\n  Your network seems to be blocking MongoDB Atlas DNS lookups.\n' +
          '  Try one of these:\n' +
          '   1. Switch to a different network (mobile hotspot is a quick test)\n' +
          '   2. Change your computer\'s DNS to 8.8.8.8 / 1.1.1.1\n' +
          '   3. Make sure outbound port 27017 is not blocked by a firewall\n'
        );
      }
    });
}

module.exports = { connectDB, MONGO_URI };
