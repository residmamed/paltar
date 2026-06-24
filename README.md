# Paltar

Second-hand clothing marketplace built with Next.js, Prisma, and PostgreSQL.

## Local setup

1. Copy environment variables:

```bash
cp .env.example .env
```

Generate an auth secret:

```bash
openssl rand -base64 32
```

Paste the result into `AUTH_SECRET` in `.env`.

2. Start PostgreSQL and apply migrations:

```bash
npm run db:setup
```

This runs Docker Compose (`postgres:17` on port `5432`) and applies Prisma migrations.

Optional seed accounts:

```bash
npm run db:seed
```

By default this creates only the login accounts below. To also create the old
demo listing catalog, run `SEED_DEMO_LISTINGS=1 npm run db:seed`.

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Database commands

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start PostgreSQL via Docker Compose |
| `npm run db:down` | Stop PostgreSQL |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Load seed login accounts |
| `npm run db:studio` | Open Prisma Studio |

## Seed accounts

| Type | Email | Password |
|------|-------|----------|
| Individual | `user@paltar.az` | `user1234` |
| Business | `store@paltar.az` | `store1234` |
| Admin | `admin@paltar.az` | `admin1234` |

## Troubleshooting

If login or registration shows a database connection error, PostgreSQL is not running. Start it with:

```bash
npm run db:up
npm run db:migrate
```

Make sure Docker Desktop is installed and running before `npm run db:up`.



## Vahid Start Process

Need latest version of the Docker

Terminal run guide

```bash
# First-time setup, or after database/schema changes:
npm run db:setup

# Optional: load seed login accounts
npm run db:seed

# Start the web app
npm run dev
```

`db:setup` already runs `db:up` and `db:migrate`, so you do not need to run
those two commands again immediately after it. The dev server uses
[http://localhost:3001](http://localhost:3001) to avoid conflicts with other
apps that often occupy port `3000`.


## Login Info for Admin Panel
admin@paltar.az / admin1234
