# Platform Technical Architecture – Version A

## Technology Overview
- **Backend Stack:** Node.js 18, Express.js, TypeScript, Prisma ORM, Zod for validation, JWT-based authentication, bcryptjs for password hashing.
- **Frontend Stack:** React 18, Vite for bundling, React Router for navigation, fetch API for backend communication.
- **Database Layer:** PostgreSQL version 15.
- **Containerization & Orchestration:** Docker with Docker Compose.

## Project Directory Layout
- **backend/**
  - `src/index.ts` – Entry point for Express server
  - `src/controllers/*.ts` – Business logic for auth, tenants, users, projects, and tasks
  - `src/middleware/auth.ts` – JWT validation and RBAC logic
  - `src/routes/*.ts` – API route definitions
  - `src/utils/jwt.ts`, `src/utils/audit.ts` – Utility helpers
  - `src/prisma.ts` – Prisma client configuration
  - `prisma/schema.prisma`, `prisma/seed.js` – Database schema and seed data
- **frontend/**
  - `src/main.jsx`, `src/App.jsx` – Application bootstrap and routing
  - `src/context/AuthContext.jsx` – Authentication state handling
  - `src/components/ProtectedRoute.jsx` – Route-level access control
  - `src/services/api.js` – API communication layer
  - `src/pages/*.jsx` – UI screens (login, dashboard, projects, tasks, users)
- **docs/** – Technical and product documentation
- `docker-compose.yml` – Multi-service container configuration
- `integration-test.js` – Automated API verification script

## Environment Configuration

### Backend (.env)
- `DATABASE_URL=postgresql://postgres:postgres@database:5432/saas_db`
- `JWT_SECRET=<secure-random-string>`
- `JWT_EXPIRES_IN=24h`
- `PORT=5000`
- `FRONTEND_URL=http://frontend:3000`

### Frontend
- `VITE_API_URL=http://backend:5000/api`

## Development Setup (Without Containers)
1. Start PostgreSQL locally on port 5432.
2. Backend setup:
   - Install dependencies
   - Apply migrations and seed data
   - Run development server
3. Frontend setup:
   - Install packages
   - Start Vite development server

## Container-Based Execution
1. Start services using Docker Compose.
2. Confirm backend health and frontend availability.
3. Stop containers when required, optionally removing volumes.

## Testing Strategy
- End-to-end testing using `integration-test.js`.
- Backend unit tests executed via npm.

## API Design Notes
- Auth endpoints handle tenant registration, login, profile retrieval, and logout.
- RBAC and tenant scoping enforced through middleware.
- Super admin accounts operate without tenant restriction.
- Standardized JSON response format is used throughout.

## Deployment Guidelines
- Secure secrets and environment variables.
- Enable HTTPS and restrictive CORS policies.
- Apply database migrations during deployment.
- Build frontend assets for production use.
