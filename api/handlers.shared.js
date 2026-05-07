const { getDb } = require('../db');
const { respondJson } = require('../utils/response');

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

module.exports = {
  getDb,
  parseJsonBody,
  ok,
  fail,
  toInt,
};
