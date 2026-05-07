const http = require('http');

const DEFAULT_API_PROXY_TARGET = 'http://localhost:8003';

function proxyApiRequest(req, res, target = DEFAULT_API_PROXY_TARGET) {
  const targetUrl = new URL(req.url, target);
  const headers = { ...req.headers };
  delete headers.host;

  const proxyReq = http.request(
    targetUrl,
    {
      method: req.method,
      headers
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Bad Gateway',
      message: error.message || 'API proxy request failed.'
    }));
  });

  req.pipe(proxyReq);
}

module.exports = {
  proxyApiRequest,
  DEFAULT_API_PROXY_TARGET
};
