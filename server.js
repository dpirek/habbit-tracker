const http = require('http');
const {
  notFound,
  serverStatic,
  serverIndex,
  isStaticRequest,
} = require('./utils/response');
const { handleApiRequest } = require('./api');
const { initDb, DB_PATH } = require('./db');
const { getUserFromRequest } = require('./utils/auth');
const PORT = Number(process.env.PORT || 8006);

initDb();

const server = http.createServer((req, res) => {
  const authUser = getUserFromRequest(req);
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (isStaticRequest(req)) return serverStatic(req, res);
  if (url.pathname.startsWith('/api/')) return handleApiRequest(req, res);
  if (req.method === 'GET') return serverIndex(res);

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`SQLite DB: ${DB_PATH}`);
});
