const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_DIR = __dirname;
const DB_PATH = path.join(DB_DIR, 'habit-tracker.sqlite');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sqlite.sql');

let db;

function initDb() {
  if (db) return db;

  fs.mkdirSync(DB_DIR, { recursive: true });

  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');

  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schemaSql);

  return db;
}

function getDb() {
  return initDb();
}

module.exports = {
  DB_PATH,
  initDb,
  getDb,
};
