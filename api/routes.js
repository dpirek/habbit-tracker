const { route } = require('../utils/router');
const {
  listUsers,
  createUser,
  listCategories,
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
} = require('./handlers');

const apiRoutes = route();

apiRoutes.add('/api/health', 'GET', (_, res) => res.end('ok'));

apiRoutes.add('/api/openapi', 'GET', getOpenApi);

apiRoutes.add('/api/users', 'GET', listUsers);
apiRoutes.add('/api/users', 'POST', createUser);

apiRoutes.add('/api/categories', 'GET', listCategories);
apiRoutes.add('/api/categories', 'POST', createCategory);

apiRoutes.add('/api/habits', 'GET', listHabits);
apiRoutes.add('/api/habits', 'POST', createHabit);
apiRoutes.add('/api/habits/:id', 'GET', getHabit);
apiRoutes.add('/api/habits/:id', 'PATCH', updateHabit);
apiRoutes.add('/api/habits/:id', 'DELETE', deleteHabit);

apiRoutes.add('/api/habits/:id/entries', 'GET', listEntries);
apiRoutes.add('/api/habits/:id/entries', 'POST', createEntry);
apiRoutes.add('/api/entries/:id', 'PATCH', updateEntry);
apiRoutes.add('/api/entries/:id', 'DELETE', deleteEntry);

function matchApiRoute(req) {
  return apiRoutes.match(req.url, req.method);
}

module.exports = {
  matchApiRoute,
};
