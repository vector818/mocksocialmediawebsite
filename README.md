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

### Environment variables

All config is driven by `.env` files. Copy the `.example` files and adjust values.

#### `.env.prod` / `.env.dev` — app config

| Variable | Description | Example (prod) |
|---|---|---|
| `NODE_ENV` | Node environment | `production` |
| `DB_HOST` | Database host | `mysql-db` |
| `DB_PORT` | Database port | `3306` |
| `DB_NAME` | Database name | `mocksocialmedia` |
| `DB_USERNAME` | Database user | `mocksocial` |
| `DB_PASSWORD` | Database password | `change-me` |
| `DB_DIALECT` | Sequelize dialect | `mysql` |
| `JWT_SECRET` | JWT secret for admin auth | `change-me-admin-secret` |
| `JWT_USER_SECRET` | JWT secret for user auth | `change-me-user-secret` |
| `ADMIN_CREDENTIALS_JSON` | Admin accounts (JSON array) | `[{"username":"admin","password":"admin123"}]` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourdomain.com,https://www.yourdomain.com` |
| `DOMAIN` | Domain for nginx & SSL certs (prod only) | `yourdomain.com` |
| `BUILD_ENV` | Webpack build mode | `prod` or `dev` |
| `NGINX_CONF` | Nginx config file to use | `nginx.conf` or `nginx.dev.conf` |
| `REACT_APP_API_BASE_URL` | API base URL baked into frontend | `/api` |
| `BACKEND_LINK_ALIAS` | Docker link alias for backend | `be` (prod) / `local` (dev) |
| `MYSQL_DATABASE` | MySQL database name | `mocksocialmedia` |
| `MYSQL_USER` | MySQL user | `mocksocial` |
| `MYSQL_PASSWORD` | MySQL password | `change-me` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `change-me` |
| `MYSQL_HOST_PORT` | MySQL port exposed on host | `3306` (prod) / `3307` (dev) |

#### `.env.external-db` — external database (optional)

| Variable | Description | Example |
|---|---|---|
| `EXTERNAL_DB_HOST` | External DB hostname | `your-rds-endpoint.amazonaws.com` |
| `EXTERNAL_DB_PORT` | External DB port | `3306` |
| `EXTERNAL_DB_NAME` | External DB name | `mocksocialmedia` |
| `EXTERNAL_DB_USERNAME` | External DB user | `mocksocial` |
| `EXTERNAL_DB_PASSWORD` | External DB password | `change-me` |

### SSL setup

1. Point your domain's A record to the server IP
2. Install certbot and generate certs:
   ```sh
   sudo apt install certbot
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```
3. Set `DOMAIN=yourdomain.com` in `.env.prod` — nginx picks up certs from `/etc/letsencrypt/live/${DOMAIN}/` automatically

### Notes

- The `--profile internal-db` flag activates the MySQL container. Omit it when using an external DB.
- In dev mode, MySQL is exposed on port **3307** (to avoid conflicts with a local MySQL).
- SSL volumes (`/etc/letsencrypt`) and port 443 are in the base config; they are harmless in dev (nginx.dev.conf doesn't listen on 443).
- Nginx config uses `envsubst` at container startup to resolve `${DOMAIN}`, `${SSL_CERT_PATH}`, `${SSL_KEY_PATH}` — no need to edit nginx files per deployment.

---

## Original documentation

The Mock Social Media Website Tool is an open-source tool for conducting experimental, ecologically-valid research on social media behaviour.

[Please visit the website for the tool for more information](https://docs.studysocial.media)
