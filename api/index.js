const { notFoundJson, respondJson } = require('../utils/response');
const { matchApiRoute } = require('./routes');

function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const startedAt = Date.now();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!res.__apiLogAttached) {
    res.__apiLogAttached = true;
    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      console.log(`[api] ${req.method} ${url.pathname} -> ${res.statusCode} (${durationMs}ms)`);
    });
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const matched = matchApiRoute(req);
  if (!matched) return notFoundJson(res);

  Promise.resolve(matched.handler(req, res, matched.params || {}, matched.queryParams || {}, url)).catch((error) => {
    console.error('[api] unhandled route error:', error);
    if (!res.headersSent) {
      respondJson(res, {
        data: null,
        error: error.message || 'Internal Server Error',
        statusCode: 500,
      }, 500);
    } else if (!res.writableEnded) {
      res.end();
    }
  });
}

module.exports = {
  handleApiRequest,
};
