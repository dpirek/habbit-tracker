const { parseJsonBody, getDb, ok, fail } = require('./handlers.shared');
const { login, logout, getUserFromRequest } = require('../utils/auth');

async function signIn(req, res) {
  const body = await parseJsonBody(req);
  const identifier = String(body.username || body.email || '').trim();
  const passwordHash = String(body.password_hash || '').trim();
  if (!identifier || !passwordHash) return fail(res, 400, 'username/email and password_hash are required');

  const db = getDb();
  const user = identifier.includes('@')
    ? db.prepare('SELECT * FROM users WHERE email = ?').get(identifier)
    : db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(identifier, identifier);

  if (!user || String(user.password_hash) !== passwordHash) return fail(res, 401, 'Invalid credentials');

  login(res, user.username, 'user');
  return ok(res, {
    user: { id: user.id, username: user.username, email: user.email, role: 'user' },
    session: null,
  });
}

function signOut(_, res) {
  logout(res);
  return ok(res, { signedOut: true });
}

function getAuthUser(req, res) {
  const authUser = getUserFromRequest(req);
  if (!authUser) return fail(res, 401, 'Unauthorized');
  return ok(res, authUser);
}

module.exports = {
  signIn,
  signOut,
  getAuthUser,
};
