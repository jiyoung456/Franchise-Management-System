# Copilot / AI agent instructions for Franchise-Management-System

Purpose: Give concise, actionable guidance so an AI coding agent can be immediately productive in this repository.

1) Big picture
- This repo contains three main parts:
  - `backend/`: Java Spring Boot application (Gradle). Primary server, configuration via `src/main/resources/application.yaml`.
  - `frontend/`: Next.js (React + TypeScript) app. Uses path aliases configured in `tsconfig.json` (`@/*`). Entry under `src/app`, shared helpers in `src/lib` and API wrappers in `src/services`.
  - `agent/`: Python FastAPI-based agent service (LLM integrations) located at `agent/agent`. Entrypoint: `agent/agent/main.py` (run with `uvicorn agent.main:app --reload`).

2) How to run & build (developer workflows)
- Backend (Windows): `gradlew.bat build` and `gradlew.bat bootRun` (from `franchise/backend`). Unix: `./gradlew build` / `./gradlew bootRun`.
- Backend tests: `gradlew.bat test`.
- Frontend (from `franchise/frontend`): use Node scripts in `package.json` — `npm run dev` (dev), `npm run build` (production), `npm run start`.
- Frontend lint: `npm run lint` (ESLint).
- Agent (from `franchise/agent`): follow `agent/README.md`; recommended run: `uvicorn agent.main:app --reload`. Keep secrets in `.env` (see README) — `GOOGLE_API_KEY` and `GEMINI_MODEL_NAME` are expected.
- Infrastructure: local DB compose at `infra/db/docker-compose.yml`.

3) Project-specific conventions
- TypeScript path aliasing: import using `@/…` (example: `import { fetchStores } from "@/services/storeService"`). See `frontend/tsconfig.json`.
- Frontend service files: short, thin wrappers around HTTP calls live in `frontend/src/services/*.ts` (e.g. `aiAgentService.ts`, `boardService.ts`). Prefer editing these for API contract changes.
- React app uses Next.js app router under `frontend/src/app` (server/client component boundaries follow Next 13+ conventions).
- Backend Java package layout follows Gradle + Spring Boot defaults under `backend/src/main/java`.
- Agent code: FastAPI routes and helper agents are under `agent/agent/ai` and controllers under `agent/api`.

4) Integration points & external deps
- Frontend ⇄ Backend: frontend calls backend REST endpoints through services (`frontend/src/services`). Search for `axios` usage to find endpoints.
- Agent ⇄ Backend/LLM: `agent` service uses Google Gemini via `google-generativeai` (see `agent/README.md`). Keep API keys out of source — use `.env`.
- DB: docker-compose in `infra/db/docker-compose.yml` holds DB containers used by `backend` during local integration.

5) Useful quick searches & code locations
- Find backend controllers: search `@RestController` or `Controller` under `backend/src/main/java`.
- Find DB migrations/resources: `backend/src/main/resources` and `bin/main/db/migration` in the repo tree.
- Frontend components: `frontend/src/components`, pages/layout: `frontend/src/app/layout.tsx`.
- Agent main: `agent/agent/main.py` and FastAPI router(s) in `agent/api`.

6) Examples for the agent
- Example run commands:
  - Agent dev: `cd franchise/agent && uvicorn agent.main:app --reload`
  - Frontend dev: `cd franchise/frontend && npm run dev`
  - Backend dev (Windows): `cd franchise/backend && gradlew.bat bootRun`

7) When editing code, prefer these boundaries
- Change frontend UI & API consumption in `frontend/src/*`.
- Change backend server logic and DTOs in `backend/src/main/java` and configuration in `backend/src/main/resources/application.yaml`.
- Change AI prompt code, agent flows, or LLM calls in `agent/agent/ai` and `agent/agent`.

8) Don't assume
- There is no centralized monorepo build script — run each component from its folder.
- Agent secrets are not stored in repo. Never add API keys to source.

If anything here is unclear or you want more detail about a specific component (for example, build artifacts, common DTOs or a set of frequently-edited files), tell me which area and I'll expand the instructions. 
