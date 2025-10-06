# Mock Social Media Website Tool

> **Fork information:**  
> This repository is a fork of [arvinsroom/mocksocialmediawebsite](https://github.com/arvinsroom/mocksocialmediawebsite) by Arvin Jagayat.  
> The only changes made here are to enable running the entire service (frontend, backend, and MySQL database) fully in Docker containers, including MySQL running in Docker.  
> All core functionality and documentation remain unchanged.

---

## Running the project fully in Docker

You can run the whole service (frontend, backend, and MySQL) using Docker Compose.  
There are two configurations available:

### Development mode

```sh
docker-compose -f docker-compose.dev.yml up --build
```

- The backend and frontend will run in development mode.
- MySQL database will run in a Docker container.
- Access the frontend at [http://localhost](http://localhost).

### Production mode

```sh
docker-compose up --build
```

- The backend and frontend will run in production mode.
- MySQL database will run in a Docker container.
- Access the frontend at [http://localhost](http://localhost) or [https://localhost](https://localhost) (if SSL is configured).

---

## Original documentation

The Mock Social Media Website Tool is an open-source tool for conducting experimental, ecologically-valid research on social media behaviour.

[Please visit the website for the tool for more information](https://docs.studysocial.media)