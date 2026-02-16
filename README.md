# Mock Social Media Website Tool

> **Fork information:**
> This repository is a fork of [arvinsroom/mocksocialmediawebsite](https://github.com/arvinsroom/mocksocialmediawebsite) by Arvin Jagayat.
> Changes include Docker-based deployment setup, minor tweaks, and consolidated configuration files.
> All core functionality and documentation remain unchanged.

---

## Running the project in Docker

The entire stack (frontend, backend, MySQL) runs via Docker Compose.
There are two axes of configuration:

- **dev vs prod** — build mode, JWT secrets, allowed origins, nginx config, SSL
- **internal vs external DB** — MySQL in Docker or an external instance (e.g. RDS)

### Setup

1. Copy the example env file for your environment:
   ```sh
   cp .env.prod.example .env.prod   # or .env.dev for development
   ```
   Edit the values as needed (JWT secrets, credentials, origins).

2. If using an external database, also prepare:
   ```sh
   cp .env.external-db.example .env.external-db
   ```

### Commands

**Production + internal DB:**
```sh
docker compose --profile internal-db --env-file .env.prod up --build
```

**Development + internal DB:**
```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml \
  --profile internal-db --env-file .env.dev up --build
```

**Production + external DB:**
```sh
docker compose -f docker-compose.yml -f docker-compose.external-db.yml \
  --env-file .env.prod --env-file .env.external-db up --build
```

**Development + external DB:**
```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.external-db.yml \
  --env-file .env.dev --env-file .env.external-db up --build
```

### File structure

| File | Purpose |
|---|---|
| `docker-compose.yml` | Base config (prod defaults, all services) |
| `docker-compose.dev.yml` | Dev override (resource limits) |
| `docker-compose.external-db.yml` | External DB override (replaces DB_* vars) |
| `.env.prod` / `.env.dev` | Environment variables per mode |
| `.env.external-db` | External DB connection details |

### Notes

- The `--profile internal-db` flag activates the MySQL container. Omit it when using an external DB.
- In dev mode, MySQL is exposed on port **3307** (to avoid conflicts with a local MySQL).
- SSL volumes (`/etc/letsencrypt`) and port 443 are in the base config; they are harmless in dev (nginx.dev.conf doesn't listen on 443).

---

## Original documentation

The Mock Social Media Website Tool is an open-source tool for conducting experimental, ecologically-valid research on social media behaviour.

[Please visit the website for the tool for more information](https://docs.studysocial.media)
