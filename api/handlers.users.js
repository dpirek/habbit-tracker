const { getDb, parseJsonBody, ok, fail } = require('./handlers.shared');

function listUsers(_, res) {
  const rows = getDb().prepare('SELECT * FROM users ORDER BY id DESC').all();
  return ok(res, rows);
}

async function createUser(req, res) {
  const body = await parseJsonBody(req);
  const { username, email, password_hash } = body;
  if (!username || !email || !password_hash) {
    return fail(res, 400, 'username, email, and password_hash are required');
  }

  const db = getDb();
  const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, password_hash);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  return ok(res, user, 201);
}

module.exports = {
  listUsers,
  createUser,
};
