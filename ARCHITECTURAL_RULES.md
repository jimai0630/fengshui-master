# Project Architectural Rules

This document defines the strict architectural rules for the Fengshui Master project. All future development must adhere to these guidelines.

## 1. High-Level Architecture
The project follows a **Monolithic Repository** structure with a **Client-Server** architecture.

- **Backend**: Express (Node.js) located in `src/backend`.
- **Frontend**: React (Vite) located in the `src` root (`src/components`, `src/pages`, `src/services`, `src/App.tsx`, etc.), EXCLUDING `src/backend` and `src/frontend` (stale).
- **Shared**: Types located in `src/types`.

## 2. Frontend/Backend Separation

### 2.1. Authorization & Secrets
- **STRICT RULE**: The Frontend **MUST NOT** store or access any API keys (e.g., Dify keys) or secrets.
- All third-party API interactions (Dify, Payment, etc.) **MUST** be proxied through the Backend.
- `dotenv` usage is restricted to the Backend (`src/backend`). Frontend uses `import.meta.env` only for public variables (e.g., `VITE_BACKEND_BASE_URL`).

### 2.2. Communication
- Frontend communicates with Backend via HTTP requests to `/api/...`.
- **Vite Proxy**: Development environment proxies `/api` requests to `http://localhost:4000`.
- **Production**: logic in `server.js` serves the frontend static build (if configured) or stands alone as an API service.

## 3. Code Organization

### 3.1. Directory Structure Rules
- **Backend Logic**: All server-side logic resides strictly in `src/backend`.
- **Frontend Logic**: UI components, hooks, and pages reside in `src/components`, `src/pages`, and `src/App.tsx`.
- **Services**: `src/services` contains the **Frontend** service layer that calls the backend API. It does NOT contain backend logic.
- **Types**: Shared interfaces (API responses, data models) reside in `src/types`.
- **Ignored**: `src/frontend` appears to be a stale directory and should be ignored/removed to avoid confusion.

### 3.2. Adding New Features
1.  **Define Types**: Update `src/types` with the request/response shapes.
2.  **Backend Implementation**: Add the endpoint to `src/backend/server.js`.
    -   *Constraint*: If `server.js` exceeds 500 lines, consider extracting route handlers into separate files within `src/backend/routes`.
3.  **Frontend Service**: Add the API caller method to the appropriate file in `src/services` (e.g., `difyService.ts`).
4.  **UI Implementation**: Consume the service in React components.

## 4. Coding Standards

### 4.1. Error Handling
- **Backend**: All async route handlers must wrap logic in `try/catch` blocks and return appropriate HTTP status codes (400, 500) with a JSON error message `{ error: string }`.
- **Frontend**: Services must throw typed errors or standardized error objects that the UI can catch and display.

### 4.2. Type Safety
- strictly use TypeScript interfaces for API payloads and responses.
- Avoid `any`.

## 5. Development Workflow
- Run `npm run dev` to start the frontend.
- Ensure the backend is running (typically separate or concurrent in dev). *Note: Current scripts `dev` only runs Vite. You must run the node server separately or add a concurrent script.*

---
**Verification Checklist**
Before committing code:
- [ ] Are secrets isolated in Backend?
- [ ] Is the logic placed in the correct directory (Frontend vs. Backend)?
- [ ] Are types updated?
