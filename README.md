# ArchVision

ArchVision is an AI-assisted architectural visualization platform that turns a 2D elevation drawing plus a real site photo into a photorealistic concept render.

It was built as an end-to-end full-stack product: authentication, project management, image upload and preprocessing, an interactive placement editor, async AI generation, and Dockerized deployment. The UI copy is currently in Italian; the codebase and documentation are in English.

## What This Project Solves

Architects and designers often need a fast way to show how a facade concept could look in a real location before committing to a full 3D workflow. ArchVision shortens that feedback loop:

- upload an elevation drawing and a location photo
- position the facade directly on top of the photo
- clean the drawing background so the AI sees only the intended building mass
- choose style, lighting, season, and element-level materials
- generate a realistic render while preserving placement, perspective, and scene context

## Why It Is Technically Interesting

- Full-stack workflow from React UI to Express API to PostgreSQL persistence
- JWT auth with access/refresh token rotation and client-side auto-refresh queuing
- Image preprocessing pipeline with `sharp` for overlay cleanup and compositing
- Async AI orchestration against Replicate's `black-forest-labs/flux-kontext-pro`
- Prompt-building system with per-element material and application constraints
- Polling-based render lifecycle with persisted statuses: `pending`, `compositing`, `rendering`, `done`, `error`
- Containerized local deployment with Postgres, backend API, and Nginx-served frontend

## Product Workflow

1. The user creates a project and uploads two images: the architectural elevation (`prospetto`) and a real location photo.
2. In the editor, the elevation can be dragged and resized over the location image.
3. The backend can generate a cleaned overlay preview that removes the paper/background from the drawing while preserving key lines.
4. The backend composites the positioned overlay onto the location photo with `sharp`.
5. The user configures render parameters such as architectural style, lighting, season, and per-element materials/colors.
6. The backend sends the composite plus a structured prompt to Replicate and returns immediately.
7. The frontend polls for completion and then shows both the technical composite and the final AI render.

## Architecture

```text
React + Vite frontend
  -> JWT-protected API calls via Axios
  -> React Query for server state and polling
  -> Zustand for persisted auth state

Express backend
  -> auth routes
  -> project routes
  -> render routes
  -> image upload with Multer
  -> overlay cleanup + compositing with sharp
  -> async render generation via Replicate API

PostgreSQL
  -> users
  -> refresh_tokens
  -> projects
  -> renders

Local storage volume
  -> uploaded source images
  -> prepared overlays
  -> composite previews
  -> final generated renders
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, React Query, Zustand, Axios |
| Styling | CSS Modules |
| Backend | Node.js, Express, ESM |
| Validation | Zod |
| Auth | JWT access tokens + refresh token rotation |
| Database | PostgreSQL 16 |
| File Uploads | Multer |
| Image Processing | sharp |
| AI Generation | Replicate API, `black-forest-labs/flux-kontext-pro` |
| Deployment | Docker, Docker Compose, Nginx |

## Backend Capabilities

- User registration, login, logout, and `/me` profile lookup
- Refresh token persistence and rotation in the database
- Per-user project CRUD
- Per-user render CRUD
- Multipart image upload with type and size checks
- Cleanup preview generation for the elevation drawing
- Composite generation with exact x/y/width/height placement
- Async render start with persisted status updates
- Static serving of uploaded/generated assets under `/uploads`
- Security middleware with `helmet`, `cors`, and rate limiting

## Frontend Capabilities

- Protected routing for authenticated users
- Dashboard for project creation and listing
- Project workspace with render history and live status badges
- Four-step editor: upload, place, generate, result
- Interactive drag/resize canvas editor
- Material/application selector per facade element
- Render polling and toast-based feedback
- Automatic token refresh on `401` responses

## Render Pipeline

```text
1. POST /api/renders/upload
   Save source images and create a render row.

2. POST /api/renders/:id/cleanup-preview
   Prepare a cleaned overlay asset from the elevation drawing.

3. POST /api/renders/:id/composite
   Composite the positioned overlay onto the location image.

4. POST /api/renders/:id/generate
   Start Replicate generation in the background and mark the render as "rendering".

5. GET /api/renders/:id
   Poll until the render reaches "done" or "error".
```

## API At A Glance

### Auth

| Method | Path |
| --- | --- |
| `POST` | `/api/auth/register` |
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/refresh` |
| `POST` | `/api/auth/logout` |
| `GET` | `/api/auth/me` |

### Projects

| Method | Path |
| --- | --- |
| `GET` | `/api/projects` |
| `POST` | `/api/projects` |
| `GET` | `/api/projects/:id` |
| `PUT` | `/api/projects/:id` |
| `DELETE` | `/api/projects/:id` |

### Renders

| Method | Path |
| --- | --- |
| `GET` | `/api/renders?projectId=:id` |
| `GET` | `/api/renders/:id` |
| `POST` | `/api/renders/upload` |
| `POST` | `/api/renders/:id/cleanup-preview` |
| `POST` | `/api/renders/:id/composite` |
| `POST` | `/api/renders/:id/generate` |
| `DELETE` | `/api/renders/:id` |

## Running With Docker

The most reliable way to run the project is through Docker Compose.

### 1. Create a root `.env`

Create your local env file from the safe template:

```bash
cp .env.example .env
```

Then edit `./.env` in the repository root:

```env
NODE_ENV=production

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=archvision

JWT_SECRET=replace_me_with_a_long_random_string
JWT_REFRESH_SECRET=replace_me_with_a_different_long_random_string

REPLICATE_API_TOKEN=your_replicate_api_token
REPLICATE_SEED=42

VITE_API_URL=http://localhost:5000
```

Optional variables supported by the backend include:

- `FRONTEND_URL` for stricter CORS
- `UPLOAD_DIR` to override upload storage
- `REPLICATE_POLL_INTERVAL_MS`
- `REPLICATE_POLL_TIMEOUT_MS`

Important:

- `.env` is intentionally gitignored and should never be committed
- `.env.example` is the shareable template for GitHub

### 2. Start the stack

```bash
docker compose up -d --build
```

### 3. Run migrations

```bash
docker compose exec backend node src/migrations/run.js
```

### 4. Open the app

| Service | URL |
| --- | --- |
| Frontend | `http://localhost` |
| API | `http://localhost:5000` |
| Health check | `http://localhost:5000/health` |

## Local Development

### Backend

For local backend development outside Docker, provide the required environment variables either in your shell or in `backend/.env`.

Minimum backend variables:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/archvision
JWT_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me_too
REPLICATE_API_TOKEN=your_replicate_api_token
UPLOAD_DIR=./uploads
```

Start the backend:

```bash
cd backend
npm install
npm run migrate
npm run dev
```

### Frontend

The frontend expects the API at `http://localhost:5000` by default through the Vite proxy.

```bash
cd frontend
npm install
npm run dev
```

Frontend dev URL:

- `http://localhost:5173`

## Repository Structure

```text
archvision/
|- backend/
|  |- src/
|  |  |- controllers/
|  |  |- middlewares/
|  |  |- migrations/
|  |  |- routes/
|  |  |- services/
|  |  `- utils/
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- constants/
|  |  |- pages/
|  |  |- services/
|  |  |- store/
|  |  `- styles/
|- docker-compose.yml
`- README.md
```

## Engineering Notes

- Uploaded assets are stored on a local Docker volume mounted at `/app/uploads`.
- The frontend talks to the backend through `/api` and `/uploads` proxies in development and through Nginx in the containerized setup.
- The AI generation currently runs in-process after the API responds, which is fine for an MVP but should move to a queue-based worker for higher throughput.
- The prompt builder supports both legacy material presets and newer element-level material/application control.

## Push Safety

Before publishing the repository:

- keep only `.env.example` in Git, never `.env`
- verify no real API tokens, passwords, or database URLs were ever committed
- rotate any secret that may have been exposed outside your machine
- avoid committing generated folders such as `node_modules`, `dist`, and `uploads`

## Limitations And Next Steps

- Add automated tests for API, auth flows, and image-processing utilities
- Move background rendering to a job queue such as BullMQ + Redis
- Replace local file storage with S3/R2-style object storage
- Add richer mask generation or segmentation to improve element-specific control
- Add admin analytics and render usage metrics

## Summary

ArchVision is a portfolio project focused on real product engineering rather than a standalone AI demo. It combines frontend UX, backend API design, database modeling, image preprocessing, third-party AI integration, and deployment concerns into one coherent workflow for architectural concept visualization.
