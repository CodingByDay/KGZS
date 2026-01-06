# FoodEval Frontend

React + TypeScript frontend for the FoodEval system.

## Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **React Query** (optional) - Data fetching and caching

## Project Structure

```
src/
  app/                # Router, providers, app setup
  ui/                 # Pure presentational components
  pages/              # Page composition only
  application/        # Use-cases, DTOs, interfaces
  infrastructure/     # API client, storage, implementations
  domain/             # Types/enums shared with backend
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your API base URL (default: `http://localhost:5080`)

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Features

- ✅ JWT authentication with role-based authorization
- ✅ Protected routes
- ✅ Offline support with action queue
- ✅ Modern UI with TailwindCSS
- ✅ Layered architecture (no business logic in components)
- ✅ Type-safe API client

## Architecture

The frontend follows a clean architecture pattern:

- **Domain**: Shared types and enums
- **Infrastructure**: API client, storage, offline queue
- **Application**: Business logic, services, use-cases
- **UI**: Presentational components
- **Pages**: Page composition
- **App**: Routing and app setup

## API Integration

The frontend expects the following API endpoints:

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

Make sure the backend CORS is configured to allow requests from `http://localhost:5173`.
