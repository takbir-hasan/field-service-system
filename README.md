# Field Service System

A full-stack field service ticket management application built with React, TypeScript, Express, MySQL, and Docker.

## Features

- JWT-based authentication
- Admin and technician roles
- Ticket creation for administrators
- Ticket assignment to technicians
- Ticket status updates and status history
- Ticket comments and activity counts
- Search, status, and priority filtering
- Dynamic ticket list updates without full-page reloads
- Shared navigation and logout across protected pages
- Dashboard summaries and technician statistics
- Responsive React interface
- Swagger API documentation
- Docker Compose setup for MySQL, backend, and frontend

## Tech Stack

- Frontend: React 19, TypeScript, Vite, React Router, Tailwind CSS, Axios
- Backend: Node.js, Express 5, TypeScript, MySQL 8
- Authentication: JWT and bcryptjs
- Validation: Zod
- API documentation: Swagger UI
- Deployment: Docker and Docker Compose

## Project Structure

```text
field-service-system/
├── backend/       Express API and database access
├── database/      MySQL initialization script
├── frontend/      React client application
├── docker-compose.yml
└── .env.example
```

## Prerequisites

- Node.js 22 or newer
- npm
- Docker Desktop with Docker Compose

## Environment Setup

Copy the example environment file to `.env` in the project root:

```powershell
Copy-Item .env.example .env
```

Update the values in `.env`, especially the database password and JWT secret. The frontend uses `/api` when running through Docker and `http://localhost:5050/api` for local development.

For local frontend development, make sure `frontend/.env` contains:

```env
VITE_API_BASE_URL=http://localhost:5050/api
```

Vite reads environment variables when it starts, so restart the frontend after changing this value.

## Run With Docker

Start the complete application from the project root:

```powershell
docker compose up -d --build
```

Open the application at:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5050/api/health
- Swagger API docs: http://localhost:5050/api-docs

Check service status:

```powershell
docker compose ps
```

View logs:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
```

Stop the services:

```powershell
docker compose down
```

The MySQL data is stored in the `mysql_data` Docker volume. To remove the database volume as well:

```powershell
docker compose down -v
```

## Run Locally

### 1. Start MySQL

Start only the database with Docker:

```powershell
docker compose up -d mysql
```

### 2. Start the backend

```powershell
Set-Location backend
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Start the frontend

In a second terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

## Seed Data

With MySQL running and the backend environment configured, seed users and sample tickets:

```powershell
Set-Location backend
npm run seed
```

The seed script is idempotent for seeded users and can be run again when needed.

### Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin@123` |
| Admin | `sarah.admin@example.com` | `Admin@123` |
| Technician | `john@example.com` | `Tech@123` |
| Technician | `alex@example.com` | `Tech@123` |

Change demo credentials before using the application outside local development.

## User Roles

| Capability | Admin | Technician |
| --- | --- | --- |
| View dashboard | Yes | Yes, assigned-ticket summary |
| View tickets | All tickets | Assigned tickets only |
| Create tickets | Yes | No |
| Assign technicians | Yes | No |
| Update ticket status | Yes | Only assigned tickets |
| Add comments | Yes | Only accessible tickets |

## Frontend Pages

- `/login` - authentication
- `/dashboard` - role-specific summary and technician list for admins
- `/tickets` - ticket list, status counts, search, status filter, and priority filter
- `/tickets/new` - admin-only ticket creation
- `/tickets/:id` - ticket details, assignment, status updates, comments, and activity

Ticket filters are applied through the API with a short debounce. The existing list remains visible while filtered data is loading, so changing a filter does not reload the browser or replace the whole page.

## Useful Commands

### Frontend

```powershell
Set-Location frontend
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```powershell
Set-Location backend
npm run dev
npm run build
npm start
npm run seed
```

## API Overview

All protected endpoints require a bearer token in the `Authorization` header.

- `POST /api/auth/login` - log in
- `GET /api/dashboard/summary` - admin dashboard summary
- `GET /api/dashboard/my-summary` - technician dashboard summary
- `GET /api/tickets` - list tickets with pagination and filters
- `POST /api/tickets` - create a ticket; admin only
- `GET /api/tickets/:id` - get ticket details
- `PATCH /api/tickets/:id/status` - update ticket status
- `POST /api/tickets/:id/assign` - assign a technician; admin only
- `GET /api/tickets/:id/comments` - list comments
- `POST /api/tickets/:id/comments` - add a comment
- `GET /api/users/technicians` - list technicians

Ticket list query parameters include `page`, `limit`, `search`, `status`, and `priority`.

Example filtered request:

```text
GET /api/tickets?limit=100&search=network&status=IN_PROGRESS&priority=HIGH
```

Supported status values: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

Supported priority values: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

The ticket list supports up to 100 records per request. Use `page` and `limit` together when working with a larger dataset.

## API Authentication

First log in through `POST /api/auth/login` and use the returned token in subsequent requests:

```http
Authorization: Bearer <access-token>
```

The frontend stores the token locally for the current browser session and attaches it automatically to API requests. Logging out removes the stored token and user data, then returns the user to the login page.

## Troubleshooting

- If only old ticket data appears after a backend change, rebuild the backend container with `docker compose up -d --build backend`.
- If the frontend cannot reach the API in local mode, check `frontend/.env` and set `VITE_API_BASE_URL=http://localhost:5050/api`.
- If the database connection fails, confirm MySQL is healthy with `docker compose ps` and verify the root `.env` values.
- After changing Vite environment variables, restart the frontend dev server or rebuild the frontend image.
