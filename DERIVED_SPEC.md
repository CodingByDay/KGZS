# Derived Specification - Product Evaluation System

## Overview
This document summarizes the functional requirements extracted from README.md and maps them to the implementation.

## Core Domain Entities (Generic Naming)

1. **ProductSample** - Represents a product sample submitted for evaluation
2. **Category** - Product category within an evaluation event
3. **EvaluationEvent** - A single or periodic evaluation session (renamed from Event)
4. **Commission** - Evaluation commission for a category
5. **Score** - Calculated evaluation score (derived from ExpertEvaluations)
6. **Protocol** - Generated evaluation record/protocol (renamed from Record)

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based authorization: SuperAdmin, Administrator, Organizer, CommissionChair, CommissionMember, CommissionTrainee, Applicant, Consumer
- Development-only SuperAdmin seed user

### Evaluation Workflow
1. Create EvaluationEvent
2. Define Categories and Commissions
3. Applicants register and submit ProductSamples
4. Commission Chair activates sample for evaluation
5. Commission members submit evaluations (ExpertEvaluations)
6. System calculates final Score
7. Generate Protocol (Record)
8. Send Protocol to Applicant

### Real-time Updates
- SignalR hub broadcasts evaluation status changes
- Frontend receives real-time updates for active evaluations

### Offline Support
- Frontend queues write operations when offline
- Automatic retry when connection restored
- Local cache for read operations

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh JWT token (optional)
- `GET /me` - Get current user info

### ProductSamples
- `GET /productsamples` - List all (filtered by event/category)
- `GET /productsamples/{id}` - Get details
- `POST /productsamples` - Create new
- `PUT /productsamples/{id}` - Update
- `DELETE /productsamples/{id}` - Delete (soft delete)

### Categories
- `GET /categories` - List all (filtered by event)
- `GET /categories/{id}` - Get details
- `POST /categories` - Create new
- `PUT /categories/{id}` - Update
- `DELETE /categories/{id}` - Delete

### Commissions
- `GET /commissions` - List all (filtered by event/category)
- `GET /commissions/{id}` - Get details
- `POST /commissions` - Create new
- `PUT /commissions/{id}` - Update
- `DELETE /commissions/{id}` - Delete

### Evaluations (EvaluationEvents)
- `GET /evaluations` - List all events
- `GET /evaluations/{id}` - Get event details
- `POST /evaluations` - Create new event
- `PUT /evaluations/{id}` - Update event
- `GET /evaluations/{id}/events` - Get evaluation events (EvaluationSessions)
- `POST /evaluations/{id}/events` - Create evaluation session (activate sample)
- `GET /evaluations/{id}/scores` - Get calculated scores
- `POST /evaluations/{id}/scores` - Calculate/update scores

### Protocols
- `GET /protocols` - List all (filtered by event/sample)
- `GET /protocols/{id}` - Get details
- `POST /protocols` - Generate protocol
- `GET /protocols/{id}/pdf` - Download PDF

### SignalR Hub
- `EvaluationHub` - Real-time updates for evaluation status changes

## Frontend Pages

### Public
- `/` - Landing page
- `/login` - Login page

### Authenticated App (`/app/*`)
- `/app/dashboard` - Overview dashboard
- `/app/productsamples` - List/create/edit ProductSamples
- `/app/productsamples/:id` - ProductSample details
- `/app/categories` - List/create/edit Categories
- `/app/commissions` - List/view Commissions
- `/app/commissions/:id` - Commission details
- `/app/evaluations` - List EvaluationEvents with filters
- `/app/evaluations/:id` - EvaluationEvent details with timeline
- `/app/evaluations/:id/create` - Create evaluation wizard
- `/app/protocols` - List Protocols
- `/app/protocols/:id` - Protocol details (printable view)
- `/app/admin` - Admin section (SuperAdmin only)
  - Users management
  - Roles management

## Data Flow

### Evaluation Creation Flow
1. Organizer creates EvaluationEvent
2. Organizer creates Categories
3. Organizer creates Commissions for each Category
4. Organizer assigns CommissionMembers
5. Applicants register and submit ProductSamples
6. Commission Chair activates sample → creates EvaluationSession
7. Commission Members submit ExpertEvaluations
8. System calculates Score
9. System generates Protocol
10. Protocol sent to Applicant

### Score Calculation
- If < 5 evaluations: average of all non-excluded
- If >= 5 evaluations: exclude highest and lowest, then average
- Excluded evaluations (trainee/member exclusion) never included
- Round to 2 decimal places

## Technical Decisions

### Generic Naming
- Event → EvaluationEvent (to avoid confusion with domain events)
- Record → Protocol (more generic, not food-specific)
- Score is a calculated value, not an entity

### Clean Architecture Layers
- **Domain**: Entities, Value Objects, Enums, Business Rules
- **Application**: Use Cases, DTOs, Validation, Interfaces
- **Infrastructure**: EF Core, Repositories, External Services
- **Api**: Controllers, Auth, DI, SignalR Hubs

### Security
- All endpoints require `[Authorize]` except `/auth/login` and `/health`
- Role-based authorization on sensitive endpoints
- JWT tokens with expiration
- Password hashing with ASP.NET Identity or BCrypt

### Offline Strategy
- IndexedDB for local storage
- Action queue for write operations
- Automatic retry with exponential backoff
- Conflict resolution (last-write-wins)

## Development Credentials

**SuperAdmin** (Development only):
- Email: `super@local.test`
- Username: `super`
- Password: `ChangeMe!12345` (or from `SEED_SUPERUSER_PASSWORD` env var)

## Happy Path Test

1. Start backend: `dotnet run --project FoodEval.Api/FoodEval.Api.csproj`
2. Start frontend: `npm run dev` (in frontend directory)
3. Login with SuperAdmin credentials
4. Create EvaluationEvent
5. Create Category
6. Create Commission
7. Create ProductSample
8. Create EvaluationSession (activate sample)
9. Submit ExpertEvaluation
10. Calculate Score
11. Generate Protocol
12. View Protocol in list
