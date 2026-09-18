# log-ingestion-service

A backend service for ingesting, storing, querying, and analyzing application logs, built with **Fastify**, **TypeScript**, and **PostgreSQL**.

---

## ✨ Features

- **Batch log ingestion** — `POST /logs` accepts an array of log entries in a single request, validates each entry independently, and returns which ones were accepted and which were rejected (with a reason).
- **Flexible querying** — `GET /logs` supports filtering by service, level, time range, free-text search, and custom attributes, with cursor-based pagination for efficient paging through large result sets.
- **Aggregated statistics** — `GET /logs/stats` returns log counts broken down by level and by service.
- **Automatic retention** — a background job runs on startup and every hour to delete logs older than a configurable retention window.
- **Health check** — `GET /health` verifies the database connection.
- **Startup safety check** — the app refuses to accept traffic if the database migrations haven't been applied yet.

## 🛠 Tech Stack

| Category         | Technology                              |
|-------------------|------------------------------------------|
| Runtime            | Node.js 22, TypeScript                   |
| Web framework      | Fastify (`@fastify/sensible`, `fastify-plugin`) |
| Database           | PostgreSQL                               |
| ORM / Migrations   | Drizzle ORM, Drizzle Kit                 |
| Validation         | Zod                                      |
| Logging            | Pino (via Fastify)                       |
| Testing            | Vitest                                   |
| Load testing       | Autocannon                               |
| Containerization   | Docker, Docker Compose                   |
| CI                 | GitHub Actions                           |

## 📁 Project Structure

```
src/
├── app.ts                          # Builds the Fastify app and registers plugins/routes
├── server.ts                       # Entry point — starts the server and the retention job
├── config/
│   └── env.ts                      # Environment variable parsing & validation
├── db/
│   ├── client.ts                   # Drizzle/postgres database client
│   └── schema.ts                   # `logs` table definition and indexes
├── plugins/
│   └── database.ts                 # Verifies DB connectivity & migration readiness
├── types/
│   └── fastify.d.ts                # Fastify type augmentation (adds `app.db`)
└── modules/
    ├── health/
    │   └── health.route.ts         # GET /health
    └── logs/
        ├── logs.route.ts           # Registers /logs and /logs/stats routes
        ├── logs.schema.ts          # Zod schema for a single log entry / ingest request
        ├── logs.query.ts           # Query schema, validation, and cursor encoding/decoding
        ├── logs.controller.ts      # POST /logs and GET /logs handlers
        ├── logs.service.ts         # Validation + accept/reject logic for ingestion
        ├── logs.repository.ts      # Batched inserts & filtered queries
        ├── logs.stats.controller.ts
        ├── logs.stats.service.ts
        ├── logs.stats.repository.ts   # Aggregation queries (count / group by)
        ├── logs.retention.service.ts     # Periodic deletion of expired logs
        └── logs.retention.repository.ts  # Deletion query against the database

drizzle/                            # Drizzle-generated SQL migrations
scripts/
└── load-test.ts                    # Autocannon-based load test script
```

## ⚙️ Environment Variables

Validated in `src/config/env.ts` and loaded from a `.env` file:

| Variable              | Default       | Description                                                  |
|------------------------|---------------|-----------------------------------------------------------------|
| `DATABASE_URL`         | *(required)*  | PostgreSQL connection string                                    |
| `PORT`                 | `8080`        | Port the server listens on                                      |
| `NODE_ENV`              | `development` | `development`, `production`, or `test`                          |
| `MAX_LOG_BATCH_SIZE`    | `5000`        | Maximum number of log entries allowed per `POST /logs` request  |
| `RETENTION_DAYS`        | `30`          | Number of days logs are kept before automatic deletion          |

Example `.env` for local development with Docker Compose (these are local development defaults only — replace them for production):

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/logs
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=logs

PORT=8080
NODE_ENV=development

MAX_LOG_BATCH_SIZE=5000
RETENTION_DAYS=30
```

## 🚀 Getting Started

### Option A — Docker Compose (recommended)

```bash
docker compose up --build
```

This starts a PostgreSQL container (exposed locally on port `5433`) and the app container (on port `8080`). On startup, the app automatically runs `db:migrate` before starting the server (as defined in the `Dockerfile`).

### Option B — Run locally without Docker

Requires a running PostgreSQL instance and a `.env` file with `DATABASE_URL` set.

```bash
# Install dependencies
npm install

# Apply database migrations
npm run db:migrate

# Start in development mode (auto-reload)
npm run dev

# — or build and run the compiled output —
npm run build
npm start
```

## 📡 API Reference

### `POST /logs`

Ingest a batch of log entries.

**Request body:**

```json
{
  "logs": [
    {
      "timestamp": "2026-09-18T10:00:00.000Z",
      "level": "info",
      "service": "api",
      "message": "request handled",
      "attributes": { "path": "/users" }
    }
  ]
}
```

- Allowed `level` values: `debug`, `info`, `warn`, `error`.
- A log entry is rejected if its `timestamp` is more than 5 minutes in the future.
- The response includes `accepted` (number of entries inserted) and `rejected` (a list of errors, each with the entry's index and a reason).
- Returns `400` if no entries were accepted, `200` if at least one was.

### `GET /logs`

Query logs with filtering and cursor-based pagination.

| Query param        | Description                                                |
|----------------------|--------------------------------------------------------------|
| `service`             | Filter by service name                                        |
| `level`                | Filter by log level                                           |
| `since` / `until`       | Filter by timestamp range (ISO 8601)                          |
| `q`                    | Partial text search within the log message                    |
| `attr.<key>=<value>`   | Filter by a field inside `attributes` (e.g. `attr.path=/users`) |
| `limit`                | Page size, 1–100 (default `50`)                                |
| `cursor`               | `next_cursor` value from a previous response, for pagination   |

### `GET /logs/stats`

Returns aggregated counts — total, plus breakdowns `by_level` and `by_service`. Supports the same `service`, `level`, `since`, and `until` filters as `GET /logs`.

### `GET /health`

Checks database connectivity. Returns:

```json
{ "status": "ok", "database": "connected" }
```

## 🗄 Database & Migrations

The project uses Drizzle ORM. The table schema lives in `src/db/schema.ts`, and generated SQL migrations live in `drizzle/`.

```bash
# Generate a new migration after editing src/db/schema.ts
npm run db:generate

# Apply migrations to the database
npm run db:migrate
```

## ✅ Testing

```bash
npm test
```

Tests are written with Vitest and live alongside the code they test (`*.test.ts`) under `src/modules/logs/`.

To run the same checks as CI (build + tests):

```bash
npm run check
```

## 📈 Load Testing

```bash
npm run load-test
```

Runs an Autocannon-based script that sends concurrent `POST /logs` requests to `http://localhost:8080/logs` for 30 seconds. The server must be running locally on port `8080` first.

## 🔄 Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main` or `master`. It installs dependencies and runs `npm run check` (build + tests).
