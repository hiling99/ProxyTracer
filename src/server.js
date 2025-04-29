const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');
const { createServer } = require('http');

const app = express();

// Receive event tracking posts
app.use(express.json());
app.post('/event-track', (req, res) => {
  console.log('📥 Event Received:', req.body);
  res.sendStatus(200);
});

// Middleware to intercept HTML responses
app.use(async (req, res, next) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    const proxyReq = require('http').request(
      {
        hostname: 'localhost',
        port: 5173,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      proxyRes => {

        var body = [];
        proxyRes.on('data', function (chunk) {
            body.push(chunk);
        });

        const injectedScript = `<script>${fs.readFileSync(
            path.join(__dirname, '../public/injected-script.js'),
            'utf8'
          )}</script>`;

        proxyRes.on('end', function () {
            body = Buffer.concat(body).toString();
            res.end(body.replace('</body>', `${injectedScript}</body>`));
        });
      }
    );

    proxyReq.on('error', err => {
      console.error('Proxy Request Error:', err);
      res.statusCode = 500;
      res.end('Proxy Request Error');
    });

    req.pipe(proxyReq);
  } else {
    next();
  }
});

// Proxy other requests normally (static assets, API calls, etc.)
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
}));

// Start proxy server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
