// Backend entry point — wires the three-tier MERN architecture
//   Frontend  -> ../client/index.html (served as static)
//   Backend   -> Express routes mounted under /api/*
//   Database  -> MongoDB Atlas (Mongoose) via ./config/db
//   Real-time -> Server-Sent Events at /api/events
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { connectDB } = require('./config/db');
const sse = require('./utils/sse');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------- Frontend (built by Vite) ----------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const hasBuild   = require('fs').existsSync(path.join(clientDist, 'index.html'));
if (!hasBuild) {
  console.warn('\n[!] client/dist not found. Run `npm run build` to build the React app.\n');
}
app.use(express.static(clientDist));

// ---------- Database layer ----------
connectDB();

// ---------- Real-time channel ----------
app.get('/api/events', sse.handler);

// ---------- API routes (Backend layer) ----------
app.use('/api/users',  require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/lists',  require('./routes/lists'));
app.use('/api/items',  require('./routes/items'));
app.use('/api/admin',  require('./routes/admin'));

// ---------- Project-architecture endpoint (powers the in-app "Architecture" page) ----------
app.get('/api/architecture', (req, res) => {
  res.json(require('./architecture.json'));
});

// SPA fallback — any non-API request returns the React app
app.get(/^(?!\/api\/).*/, (req, res, next) => {
  if (!require('fs').existsSync(path.join(clientDist, 'index.html'))) {
    return res.status(503).type('html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Build needed</title>
      <style>body{font-family:system-ui;padding:48px;max-width:640px;margin:auto;color:#1A1A1A;background:#F7F3EC}
      code{background:#EFE9DC;padding:2px 8px;border-radius:6px}h1{color:#1F3D2C}</style></head>
      <body><h1>Frontend not built yet</h1><p>The React app needs to be built once before it can be served.</p>
      <p>Stop this server (<code>Ctrl + C</code>), then run:</p>
      <p><code>npm run build</code></p><p>Then start it again with <code>npm start</code>.</p></body></html>`);
  }
  res.sendFile(path.join(clientDist, 'index.html'), err => err && next());
});

app.listen(PORT, () => {
  console.log(`Grocery List Manager running at http://localhost:${PORT}`);
});
