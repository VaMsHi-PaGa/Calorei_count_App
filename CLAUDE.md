# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend

```bash
# Run backend (from repo root, requires venv)
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Syntax check all Python files
source venv/bin/activate && python3 -m py_compile app/**/*.py
```

### Frontend

```bash
cd frontend
npm install          # first time only
npm run dev          # development server at http://localhost:3000
npm run build        # production build
npx tsc --noEmit     # type check without emitting
npm run lint         # ESLint
```

### Environment

Backend reads from `.env` at the repo root. Frontend reads from `frontend/.env.local`. Copy the relevant sections from `.env` to configure.

## Architecture

FitTrack is a full-stack fitness tracker: **FastAPI backend** (`app/`) + **Next.js 16 frontend** (`frontend/`).

### Backend (`app/`)

- **Entry point**: `app/main.py` — creates the FastAPI app, applies CORS middleware, auto-creates DB tables on startup via SQLAlchemy `create_all`, and registers all routers.
- **Database**: SQLAlchemy with `app/db/database.py` providing `engine`, `SessionLocal`, and `get_db()` (FastAPI dependency). Configured via `DATABASE_URL` env var (defaults to SQLite `fitness.db` in dev, PostgreSQL in prod).
- **Models** (`app/models/`): `User`, `FoodLog`, `WeightLog`, `UserGoal` — four tables. `User` has one-to-many with food/weight logs and one-to-one with `UserGoal`.
- **Schemas** (`app/schemas.py`): All Pydantic request/response models live in a single file.
- **Auth**: JWT-based. `app/services/auth.py` handles bcrypt hashing and JWT creation/verification. `app/middleware/auth.py` provides the `get_current_user` FastAPI dependency used by protected routes.
- **Route prefixes**: `/auth`, `/users`, `/food-log`, `/weight-log`, `/dashboard` (no prefix), `/api/goals`, `/api/reports`.
- **Services** (`app/services/`): Business logic separated from routes — `ai.py` (Ollama integration for food macro estimation), `aggregation.py` (historical stats/trends), `food_quality.py` (0–100 scoring), `suggestions.py` (AI-powered tips), `reports.py` (report assembly), `fitness.py` (BMI/calorie calc), `email.py` (SMTP, falls back to console).

### AI Integration

Food logging calls Ollama (`mistral` model) to estimate macros. If Ollama is unavailable or returns bad JSON, `app/services/ai.py` falls back to hardcoded defaults (300 kcal, 10g protein, 35g carbs, 10g fat). The AI timeout is 60s on the backend and 90s on the frontend (`AI_TIMEOUT_MS` in `services/api.ts`).

### Frontend (`frontend/`)

- **Framework**: Next.js 16.2 with App Router (`frontend/app/`). Each subdirectory is a page — `weight/`, `food-log/`, `water/`, `goals/`, `reports/`, `analytics/`, `insights/`, `settings/`, `admin/`, plus auth pages (`login/`, `signup/`, `forgot-password/`, `reset/`).
- **API client**: `frontend/services/api.ts` — single file with all typed API functions. Uses `fetch` with `AbortController` for timeouts. JWTs are stored in `localStorage` under `fitness_access_token` / `fitness_refresh_token`. The base URL is auto-detected: `NEXT_PUBLIC_API_BASE_URL` env var → current hostname:8000 → `localhost:8000`.
- **Styling**: Tailwind CSS v4 with dark theme.
- **Charts**: Chart.js via `react-chartjs-2`.
- **Water tracking** uses `localStorage` for persistence (no backend endpoint).

> **Note**: This project uses Next.js 16.2, which has breaking changes from the version in training data. Before modifying frontend routing or APIs, check `node_modules/next/dist/docs/` for the relevant guide.

### Token flow

`signup`/`login` return `{ access_token, refresh_token, user }`. Both are stored in `localStorage`. All non-`/auth/` requests automatically attach `Authorization: Bearer <access_token>`. The `/auth/refresh` endpoint rotates both tokens.
