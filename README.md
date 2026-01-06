
# Portal za ocenjevanje živil – Digitalni ocenjevalni sistem

## ⚠️ Authoritative tech stack (non-negotiable)

This project MUST be implemented with:
- Backend: ASP.NET Core Web API (.NET)
- Frontend: React + TypeScript

Do not propose alternative frameworks (Vue/Angular/etc.).


Non-goals
- Do NOT propose alternative backend frameworks (Node, Java, etc.)
- Do NOT propose alternative frontend frameworks (Vue, Angular, etc.)
- Do NOT embed business logic in controllers or UI components

---

## Quick Start

### Prerequisites
- .NET SDK (8.0 or later)
- Node.js (18 or later)
- SQL Server (or use Docker with docker-compose.yml)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Configure the database connection string in `FoodEval.Api/appsettings.json` or via environment variables.

3. Run the API:
```bash
dotnet run --project FoodEval.Api/FoodEval.Api.csproj
```

The API will be available at `http://localhost:5080` (or the port configured in `launchSettings.json`).

#### Development Super User

⚠️ **Development Only**: A SuperAdmin user is automatically seeded when running in Development mode.

**Default Credentials:**
- Email: `super@local.test`
- Username: `super`
- Password: `ChangeMe!12345`

**Environment Variables** (optional):
- `SEED_SUPERUSER_EMAIL` - Default: `super@local.test`
- `SEED_SUPERUSER_USERNAME` - Default: `super`
- `SEED_SUPERUSER_PASSWORD` - Default: `ChangeMe!12345` (dev only)
- `SEED_SUPERUSER_ENABLED` - Set to `true` to enable seeding in non-Development environments (not recommended for production)

**Note**: The seeder only runs when:
- `ASPNETCORE_ENVIRONMENT=Development` OR
- `SEED_SUPERUSER_ENABLED=true`

Credentials are printed to the console on startup. **Never enable seeding in Production.**

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (if needed) with API base URL:
```
VITE_API_BASE_URL=http://localhost:5080
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Login

Use the seeded SuperAdmin credentials to log in:
- Email: `super@local.test`
- Password: `ChangeMe!12345`

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password, returns JWT token
- `GET /api/auth/me` - Get current user info and roles

### Categories
- `GET /api/categories` - List all categories (optional query: `evaluationEventId`)
- `GET /api/categories/{id}` - Get category details
- `POST /api/categories` - Create new category (requires Organizer/Admin/SuperAdmin)
- `PUT /api/categories/{id}` - Update category (requires Organizer/Admin/SuperAdmin)
- `DELETE /api/categories/{id}` - Delete category (requires Organizer/Admin/SuperAdmin)

### Product Samples
- `GET /api/productsamples` - List all product samples (optional query: `evaluationEventId`)
- `GET /api/productsamples/{id}` - Get product sample details
- `POST /api/productsamples` - Create new product sample (requires Organizer/Admin/SuperAdmin)
- `PUT /api/productsamples/{id}` - Update product sample (requires Organizer/Admin/SuperAdmin)
- `DELETE /api/productsamples/{id}` - Delete product sample (requires Organizer/Admin/SuperAdmin)

### Commissions
- `GET /api/commissions` - List all commissions (optional query: `evaluationEventId`)
- `GET /api/commissions/{id}` - Get commission details
- `POST /api/commissions` - Create new commission (requires Organizer/Admin/SuperAdmin)
- `PUT /api/commissions/{id}` - Update commission (requires Organizer/Admin/SuperAdmin)
- `DELETE /api/commissions/{id}` - Delete commission (requires Organizer/Admin/SuperAdmin)

### Evaluations (Evaluation Events)
- `GET /api/evaluations` - List all evaluation events
- `GET /api/evaluations/{id}` - Get evaluation event details
- `POST /api/evaluations` - Create new evaluation event (requires Organizer/Admin/SuperAdmin)
- `PUT /api/evaluations/{id}` - Update evaluation event (requires Organizer/Admin/SuperAdmin)
- `DELETE /api/evaluations/{id}` - Delete evaluation event (requires Organizer/Admin/SuperAdmin)
- `PUT /api/evaluations/{id}/status` - Update evaluation status (requires Organizer/Admin/SuperAdmin)
- `GET /api/evaluations/{id}/events` - Get evaluation sessions for an event
- `POST /api/evaluations/{id}/events` - Create evaluation session (activate sample) (requires CommissionChair/Organizer/Admin/SuperAdmin)
- `GET /api/evaluations/{id}/scores` - Get calculated scores for an event
- `POST /api/evaluations/scores/calculate` - Calculate score for a product sample (requires Organizer/Admin/SuperAdmin)

### Expert Evaluations
- `GET /api/expertevaluations/{id}` - Get expert evaluation details
- `GET /api/expertevaluations/session/{evaluationSessionId}` - Get evaluations for a session
- `GET /api/expertevaluations/product/{productSampleId}` - Get evaluations for a product sample
- `POST /api/expertevaluations` - Create expert evaluation (requires CommissionMember/CommissionChair/Organizer/Admin/SuperAdmin)
- `PUT /api/expertevaluations/{id}` - Update expert evaluation (requires CommissionMember/CommissionChair/Organizer/Admin/SuperAdmin)
- `POST /api/expertevaluations/{id}/submit` - Submit expert evaluation (requires CommissionMember/CommissionChair/Organizer/Admin/SuperAdmin)

### Protocols
- `GET /api/protocols` - List all protocols (optional query: `evaluationEventId` or `productSampleId`)
- `GET /api/protocols/{id}` - Get protocol details
- `POST /api/protocols/generate` - Generate protocol for a product sample (requires Organizer/Admin/SuperAdmin)

### SignalR Hub
- Hub URL: `/hubs/evaluation`
- Events:
  - `EvaluationStatusChanged` - When evaluation event status changes
  - `EvaluationSessionCreated` - When a new evaluation session is created
  - `ExpertEvaluationSubmitted` - When an expert evaluation is submitted
  - `ScoreCalculated` - When a score is calculated
  - `ProtocolGenerated` - When a protocol is generated
- Methods:
  - `JoinEvaluationGroup(evaluationEventId)` - Join group for real-time updates
  - `LeaveEvaluationGroup(evaluationEventId)` - Leave group

## Frontend Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page

### Authenticated Routes (`/app/*`)
- `/app/dashboard` - Dashboard overview
- `/app/productsamples` - List product samples
- `/app/categories` - List/create/edit categories
- `/app/commissions` - List/view commissions
- `/app/evaluations` - List evaluation events
- `/app/evaluations/:id` - Evaluation event detail with timeline, sessions, scores
- `/app/protocols` - List protocols
- `/app/profile` - User profile page
- `/app/admin` - Admin section (SuperAdmin only)

---

## Namen sistema
Ta projekt je spletna aplikacija za **digitalno ocenjevanje živil in prehranskih proizvodov**, ki nadomešča papirne in ročne postopke.

Sistem podpira celoten proces:
- prijave udeležencev,
- vnos živilskih vzorcev,
- digitalno ocenjevanje na tablicah,
- avtomatski izračun ocen,
- generiranje zapisnikov in analitičnih poročil.

Aplikacija je namenjena delu **na terenu**, tudi ob **nestabilni ali omejeni internetni povezavi**.

---

## Ključni koncepti sistema

### Dogodek ocenjevanja
Dogodek predstavlja posamezno ali periodično ocenjevanje živil.

Dogodek vsebuje:
- prijavitelje,
- vzorce živil,
- komisije,
- kriterije ocenjevanja,
- zapisnike in analitiko.

Dogodek se lahko ustvari:
- na novo ali
- s kopiranjem podatkov iz preteklih dogodkov (izborno).

---

## Uporabniške vloge

Sistem ima strogo definirane vloge in pravice:

- **SuperAdmin** (Development only)
  - najvišja raven dostopa, uporablja se za razvoj in testiranje
- **Administrator**
  - sistemske nastavitve, šifranti, uporabniki
- **Organizator**
  - upravlja dogodke, prijave, vzorce, komisije
- **Predsednik komisije**
  - vodi ocenjevanje, aktivira vzorce, potrjuje zapisnike
- **Član komisije**
  - vnaša ocene in opombe
- **Vajenec komisije**
  - vnaša ocene (lahko izločene iz končnega izračuna)
- **Prijavitelj**
  - prijavi vzorce in prejme zapisnike
- **Potrošnik**
  - sodeluje v potrošniškem ocenjevanju

---

## Prijave in plačila

- javni prijavni obrazec
- potrditev e-pošte
- SMS validacija telefonske številke
- obvezno plačilo (če je zahtevano):
  - spletno
  - po predračunu
- dokler plačilo ni potrjeno:
  - prijava in vzorci so v stanju *osnutek*

---

## Vzorci živil

Vsak vzorec ima:
- zaporedno številko (letno ponastavljanje),
- pripadajočo kategorijo ali skupino,
- način ocenjevanja:
  - končna ocena ali
  - ocenjevanje po kriterijih,
- QR kodo in nalepko.

---

## Komisije in ocenjevanje

### Komisije
- vezane na kategorije živil
- imajo člane in vajence
- določene kriterije ocenjevanja
- možnost izključitve člana med ocenjevanjem

### Proces ocenjevanja
1. Predsednik komisije aktivira vzorec (QR koda ali izbor)
2. Ocenjevalni zaslon se odpre članom komisije
3. Člani vnesejo ocene in opombe
4. Vzorec se lahko izloči (obvezna utemeljitev)
5. Če več kot polovica komisije izloči vzorec → avtomatska izločitev
6. Opombe se zbirajo v skupni zapisnik

---

## Opombe in komentarji

- strukturiran izbor tipičnih napak ali lastnosti
- prosto besedilno polje
- možnost izbire načina vnosa pred začetkom ocenjevanja
- predsednik komisije pregleda in potrdi opombe za zapisnik

---

## Izračun ocen

- do 4 ocen → povprečje vseh
- 5 ali več ocen:
  - izloči se najvišja in najnižja ocena
  - izločijo se pripadajoče opombe

---

## Zapisniki

- avtomatsko generirani zapisniki
- pregled po statusih
- izvoz v PDF in Excel
- samodejno obveščanje prijaviteljev

---

## Analitika

- število podeljenih priznanj
- analiza po kategorijah in regijah
- izločeni vzorci
- napredno filtriranje
- Excel izvoz

---

## Potrošniško ocenjevanje

- ločeno od strokovnih komisij
- več stojnic ali točk hkrati
- vsak potrošnik odda oceno
- brez generiranja zapisnikov

---

## Tehnične zahteve

- večjezična podpora
- delovanje na tablicah in mobilnih napravah
- offline-first delovanje s kasnejšo sinhronizacijo
- avtomatizirana obvestila
- revizijska sled sprememb


## Domain abstraction rules

- The system must never assume a specific food type
- Categories, criteria, and evaluation logic are event-defined
- Domain-specific behavior must be configurable, not hardcoded
- Future domains may include:
  - meat
  - dairy
  - wine
  - honey
  - bakery
  - processed foods
