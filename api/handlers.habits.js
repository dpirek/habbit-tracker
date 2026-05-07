const { getDb, parseJsonBody, ok, fail, toInt } = require('./handlers.shared');

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

module.exports = {
  listHabits,
  createHabit,
  getHabit,
  updateHabit,
  deleteHabit,
};
