# Mock Social Media Website Tool

> **Fork information:**  
> This repository is a fork of [arvinsroom/mocksocialmediawebsite](https://github.com/arvinsroom/mocksocialmediawebsite) by Arvin Jagayat.  
> The changes made here allow running the frontend and backend in Docker while connecting to an external MySQL instance (e.g., Amazon RDS).  
> All core functionality and documentation remain unchanged.

---

## Running the project with an external MySQL database

You can run the frontend and backend with Docker Compose while pointing to a managed MySQL service.  
There are two configurations available:

### Prepare environment

1. Copy `.env.example` to `.env`.
2. Fill in the Amazon RDS (or other managed MySQL) connection details.
3. Set `CORS_ALLOWED_ORIGINS` to the public URL of the frontend (comma separated for multiple origins).
4. Optionally set `API_BASE_URL` if the frontend should reach the API at a different origin than the one serving the web app (leave empty to default to `<current-origin>/api`).

### Development mode

```sh
docker-compose -f docker-compose.dev.yml up --build
```

- The backend and frontend will run in development mode.
- The backend connects to the database specified in your `.env`.
- Access the frontend at [http://localhost](http://localhost).

### Production mode

```sh
docker-compose up --build
```

- The backend and frontend will run in production mode.
- The backend connects to the database specified in your `.env`.
- Access the frontend at [http://localhost](http://localhost) or [https://localhost](https://localhost) (if SSL is configured).

---

## Original documentation

The Mock Social Media Website Tool is an open-source tool for conducting experimental, ecologically-valid research on social media behaviour.

[Please visit the website for the tool for more information](https://docs.studysocial.media)
