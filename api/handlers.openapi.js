const { ok } = require('./handlers.shared');

function getOpenApi(_, res) {
  const spec = require('../doc/openapi.json');
  return ok(res, spec);
}

module.exports = {
  getOpenApi,
};
