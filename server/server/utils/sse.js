// Real-time sync via Server-Sent Events (spec §10 — Real-time)
let clients = [];

function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const id = Date.now() + Math.random();
  clients.push({ id, res });
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  const ping = setInterval(() => { try { res.write(`: ping\n\n`); } catch {} }, 15000);

  req.on('close', () => {
    clearInterval(ping);
    clients = clients.filter(c => c.id !== id);
  });
}

function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach(c => { try { c.res.write(payload); } catch {} });
}

module.exports = { handler, broadcast };
