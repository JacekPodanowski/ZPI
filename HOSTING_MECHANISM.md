# Hosting Mechanism Overview

This document summarizes how the YourEasySite platform is hosted across backend and frontend services, and how deployments are coordinated.

## Core Architecture
- **Single multi-tenant backend** serves all creators and their sites via one Django/DRF API.
- **Multiple frontends on Vercel** consume the central API: the Studio (editor/dashboard) and individual public sites.
- **Publish workflow** connects the Studio to Vercel build hooks so creators can push site updates on demand.

## Backend Hosting
- Technology stack: Django + DRF, PostgreSQL, Simple JWT, Gunicorn.
- Containerized in Docker and deployed via `docker-compose` locally and a container host (e.g., Railway) in production.
- Key environment variables (defined in `BACKEND/.env`):
  - `DJANGO_SECRET_KEY`, `DEBUG`, `DATABASE_URL`.
  - `FRONTEND_URL` for CORS.
  - `VERCEL_BUILD_HOOK_URL` used by the publish endpoint.
- Static files served through WhiteNoise; HTTPS enforced when `DEBUG=False`.
- Migrations and superuser creation handled in `entrypoint.sh` during container boot.

## Frontend Hosting
- Single Vite + React codebase in `FRONTEND/` with two runtime modes:
  - **Studio**: the SaaS dashboard/editor, hosted on Vercel and run locally with `npm run dev`.
  - **Generated Sites**: static builds hosted on separate Vercel projects per creator site.
- Environment configuration:
  - `.env` for shared defaults; `.env.local` for local overrides (e.g., `VITE_API_BASE_URL=http://localhost:8000/api/v1`).
  - Each Vercel site build sets `VITE_SITE_ID` so `SiteApp.jsx` fetches the correct configuration from `/public-sites/by-id/<id>/`.

## Publish Workflow
1. Creators edit their site in the Studio.
2. Clicking **Publish** triggers `POST /api/v1/sites/<site_id>/publish/`.
3. The backend validates ownership, retrieves `VERCEL_BUILD_HOOK_URL`, and POSTs to `https://.../deploy?...&siteId=<site_id>`.
4. Vercel starts a new build; the static site fetches `template_config` for the requested `siteId` during build time and redeploys the updated site.

## Local Development
- **Backend**: `docker-compose up --build` (runs Django, PostgreSQL, applies migrations, seeds superuser).
- **Frontend**: `npm install` then `npm run dev` inside `FRONTEND/`; ensure `.env.local` points to the local API.
- Publish tests require a valid `VERCEL_BUILD_HOOK_URL` pointing to a test Vercel project or a mocked endpoint.

## Production Deployment Checklist
- Backend container registry or Railway project configured with secrets (`DATABASE_URL`, `VERCEL_BUILD_HOOK_URL`, email credentials, OAuth keys).
- Vercel project for the Studio (uses the same backend API, typically via HTTPS domain).
- Separate Vercel build hook per creator site; the hook URL stored in the backend for each deployment target.
- Domain and HTTPS certificates managed by Vercel (frontends) and the host platform (backend).

## Monitoring & Logs
- Backend logs emitted in JSON when `DEBUG=False`, suitable for aggregation on hosting provider (Railway / Docker platform).
- Vercel deployments expose build logs and publish status in the Vercel dashboard.
- Recommended to capture webhook responses and deployment metrics for troubleshooting failed publish attempts.
