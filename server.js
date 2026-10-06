const path = require('node:path');
const express = require('express');
const api = require('./server/api');
const { PORT } = require('./server/config');
const { stopJobs } = require('./server/downloader');

const app = express();
const DIST = path.join(__dirname, 'dist');

if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  next();
});
app.use('/api', api);
app.use(express.static(DIST, {
  index: false,
  fallthrough: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));
app.get(['/result', '/result.html', '/'], (_req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(DIST, 'index.html'), (error) => error && next(error));
});
app.use((_req, res) => res.status(404).json({ error: 'Tidak ditemukan.' }));
app.use((error, _req, res, _next) => {
  console.error(`[http] ${error.message}`);
  if (res.headersSent) return res.destroy();
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Terjadi kesalahan pada server.' });
});

const server = app.listen(PORT, '0.0.0.0', () => console.log(`Tiko berjalan di http://0.0.0.0:${PORT}`));

function shutdown(signal) {
  console.info(`[server] ${signal} received; shutting down`);
  stopJobs();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
