# Habit Tracker

Minimal Node.js habit tracker backend with a SQLite database, REST APIs, and OpenAPI documentation.

## Project Structure

- `doc/schema.sql`: source schema (MySQL-style)
- `db/schema.sqlite.sql`: SQLite-compatible schema used by the app
- `db/habit-tracker.sqlite`: generated SQLite database file
- `api/`: API routing and handlers
- `doc/openapi.json`: OpenAPI 3.0 spec
- `server.js`: HTTP server entrypoint

## Requirements

- Node.js `v25+` (uses built-in `node:sqlite`)

## Run

```bash
node server.js
```

Default server URL:

- `http://localhost:8006`

Set a custom port:

```bash
PORT=8010 node server.js
```

## Database

The SQLite database is initialized automatically on startup.

- DB file: `db/habit-tracker.sqlite`
- Schema applied from: `db/schema.sqlite.sql`

## API Endpoints

- `GET /api/health`
- `GET /api/openapi`
- `GET /api/users`
- `POST /api/users`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/habits`
- `POST /api/habits`
- `GET /api/habits/:id`
- `PATCH /api/habits/:id`
- `DELETE /api/habits/:id`
- `GET /api/habits/:id/entries`
- `POST /api/habits/:id/entries`
- `PATCH /api/entries/:id`
- `DELETE /api/entries/:id`

## OpenAPI

OpenAPI spec file:

- `doc/openapi.json`

Runtime endpoint:

- `GET /api/openapi`

## Notes

- CORS is enabled for all origins.
- Responses follow this shape:

```json
{
  "data": {},
  "error": "",
  "statusCode": 200
}
```
