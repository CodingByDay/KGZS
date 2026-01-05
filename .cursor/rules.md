# Cursor Project Rules – Mandatory

## Hard constraints (do not violate)
- Backend MUST be ASP.NET Core Web API (.NET).
- Frontend MUST be React + TypeScript.
- Do NOT suggest Vue, Angular, Next.js, or other alternatives unless explicitly asked.

## Architecture
- Use Clean Architecture:
  - Domain: entities, value objects, enums, pure business rules
  - Application: use-cases/services, DTOs, validation, interfaces
  - Infrastructure: EF Core, external integrations (email/SMS/payments), repositories
  - Api: controllers, auth, DI, SignalR hubs
- No business logic in controllers or React components.

## Security
- JWT authentication + role-based authorization required.
- Enforce roles on every endpoint.

## Offline + real-time
- Use SignalR for real-time evaluation status.
- Frontend should support intermittent connectivity (cache + queue actions).

## Naming
- Keep domain generic: ProductSample, Category, EvaluationEvent, Commission, Score, Protocol.
- No fish-specific assumptions.
