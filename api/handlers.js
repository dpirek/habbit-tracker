const { getDb } = require('../db');
const { respondJson } = require('../utils/response');
const { login, logout, getUserFromRequest } = require('../utils/auth');

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (_) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function ok(res, data, statusCode = 200) {
  return respondJson(res, { data, error: '', statusCode }, statusCode);
}

function fail(res, statusCode, error) {
  return respondJson(res, { data: null, error, statusCode }, statusCode);
}

function toInt(value, name) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) throw new Error(`${name} must be a positive integer`);
  return num;
}

function listUsers(_, res) {
  const rows = getDb().prepare('SELECT * FROM users ORDER BY id DESC').all();
  return ok(res, rows);
}

async function createUser(req, res) {
  const body = await parseJsonBody(req);
  const { username, email, password_hash } = body;
  if (!username || !email || !password_hash) return fail(res, 400, 'username, email, and password_hash are required');

  const db = getDb();
  const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, password_hash);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  return ok(res, user, 201);
}

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
    session: null
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

function listCategories(_, res) {
  const rows = getDb().prepare('SELECT * FROM habit_categories ORDER BY id DESC').all();
  return ok(res, rows);
}

function listHabitTemplates(_, res) {
  const rows = getDb().prepare('SELECT * FROM habit_templates ORDER BY title ASC').all();
  return ok(res, rows);
}

async function createCategory(req, res) {
  const body = await parseJsonBody(req);
  if (!body.name) return fail(res, 400, 'name is required');

  const db = getDb();
  const result = db.prepare('INSERT INTO habit_categories (name, color) VALUES (?, ?)').run(body.name, body.color || null);
  const row = db.prepare('SELECT * FROM habit_categories WHERE id = ?').get(result.lastInsertRowid);
  return ok(res, row, 201);
}

function listHabits(_, res, __, query) {
  const db = getDb();
  if (query.user_id) {
    const userId = toInt(query.user_id, 'user_id');
    return ok(res, db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY id DESC').all(userId));
  }
  return ok(res, db.prepare('SELECT * FROM habits ORDER BY id DESC').all());
}

async function createHabit(req, res) {
  const body = await parseJsonBody(req);
  const required = ['user_id', 'title', 'frequency'];
  for (const field of required) {
    if (!body[field]) return fail(res, 400, `${field} is required`);
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO habits (
      user_id, category_id, title, description, frequency, target_count, unit, is_active, start_date, end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    toInt(body.user_id, 'user_id'),
    body.category_id ? toInt(body.category_id, 'category_id') : null,
    body.title,
    body.description || null,
    body.frequency,
    body.target_count || 1,
    body.unit || null,
    body.is_active === false ? 0 : 1,
    body.start_date || null,
    body.end_date || null
  );

  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
  return ok(res, habit, 201);
}

function getHabit(_, res, params) {
  const habitId = toInt(params.id, 'id');
  const habit = getDb().prepare('SELECT * FROM habits WHERE id = ?').get(habitId);
  if (!habit) return fail(res, 404, 'Habit not found');
  return ok(res, habit);
}

async function updateHabit(req, res, params) {
  const habitId = toInt(params.id, 'id');
  const body = await parseJsonBody(req);
  const db = getDb();

  const existing = db.prepare('SELECT * FROM habits WHERE id = ?').get(habitId);
  if (!existing) return fail(res, 404, 'Habit not found');

  db.prepare(`
    UPDATE habits
    SET category_id = ?, title = ?, description = ?, frequency = ?, target_count = ?, unit = ?, is_active = ?, start_date = ?, end_date = ?
    WHERE id = ?
  `).run(
    body.category_id ? toInt(body.category_id, 'category_id') : null,
    body.title || existing.title,
    body.description ?? existing.description,
    body.frequency || existing.frequency,
    body.target_count ?? existing.target_count,
    body.unit ?? existing.unit,
    body.is_active === false ? 0 : 1,
    body.start_date ?? existing.start_date,
    body.end_date ?? existing.end_date,
    habitId
  );

  return ok(res, db.prepare('SELECT * FROM habits WHERE id = ?').get(habitId));
}

function deleteHabit(_, res, params) {
  const habitId = toInt(params.id, 'id');
  const db = getDb();
  const result = db.prepare('DELETE FROM habits WHERE id = ?').run(habitId);
  if (!result.changes) return fail(res, 404, 'Habit not found');
  return ok(res, { deleted: true });
}

function listEntries(_, res, params) {
  const habitId = toInt(params.id, 'id');
  const rows = getDb().prepare('SELECT * FROM habit_entries WHERE habit_id = ? ORDER BY entry_date DESC').all(habitId);
  return ok(res, rows);
}

async function createEntry(req, res, params) {
  const habitId = toInt(params.id, 'id');
  const body = await parseJsonBody(req);
  if (!body.entry_date) return fail(res, 400, 'entry_date is required');

  const db = getDb();
  const result = db.prepare('INSERT INTO habit_entries (habit_id, entry_date, value, notes) VALUES (?, ?, ?, ?)').run(
    habitId,
    body.entry_date,
    body.value || 1,
    body.notes || null
  );

  return ok(res, db.prepare('SELECT * FROM habit_entries WHERE id = ?').get(result.lastInsertRowid), 201);
}

async function updateEntry(req, res, params) {
  const entryId = toInt(params.id, 'id');
  const body = await parseJsonBody(req);
  const db = getDb();
  const existing = db.prepare('SELECT * FROM habit_entries WHERE id = ?').get(entryId);
  if (!existing) return fail(res, 404, 'Entry not found');

  db.prepare('UPDATE habit_entries SET entry_date = ?, value = ?, notes = ? WHERE id = ?').run(
    body.entry_date || existing.entry_date,
    body.value ?? existing.value,
    body.notes ?? existing.notes,
    entryId
  );

  return ok(res, db.prepare('SELECT * FROM habit_entries WHERE id = ?').get(entryId));
}

function deleteEntry(_, res, params) {
  const entryId = toInt(params.id, 'id');
  const result = getDb().prepare('DELETE FROM habit_entries WHERE id = ?').run(entryId);
  if (!result.changes) return fail(res, 404, 'Entry not found');
  return ok(res, { deleted: true });
}

function getOpenApi(_, res) {
  const spec = require('../doc/openapi.json');
  return ok(res, spec);
}

module.exports = {
  listUsers,
  createUser,
  signIn,
  signOut,
  getAuthUser,
  listCategories,
  listHabitTemplates,
  createCategory,
  listHabits,
  createHabit,
  getHabit,
  updateHabit,
  deleteHabit,
  listEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  getOpenApi,
  fail,
};
