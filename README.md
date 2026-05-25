# VietImmerse

## Northern Vietnamese Learning Platform for Japanese Speakers

> VietImmerseで北部ベトナム語をマスターしましょう。ハノイの街角で、もっと自由に。

---

*A full-stack web application connecting Japanese learners in Hanoi with native Vietnamese conversation partners, featuring structured curriculum, real-time messaging, voice pronunciation lab, and intelligent partner matching.*

---

**Frontend** : Next.js 16 -- React 19 -- TypeScript -- Tailwind CSS v4

**Backend** : ASP.NET Core 10 -- Entity Framework Core 10 -- PostgreSQL 16

**Real-time** : SignalR -- WebSocket

**Cloud Services** : Cloudinary -- FPT.AI (TTS + ASR) -- OpenAI Whisper

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
  - [Database](#database)
  - [JWT Authentication](#jwt-authentication)
  - [SMTP Email (Gmail)](#smtp-email-gmail)
  - [Cloudinary (Image Storage)](#cloudinary-image-storage)
  - [FPT.AI Services](#fptai-services)
  - [OpenAI Whisper](#openai-whisper)
- [Architecture Overview](#architecture-overview)
  - [Project Structure](#project-structure)
  - [Backend Architecture](#backend-architecture)
  - [Frontend Architecture](#frontend-architecture)
- [Features](#features)
- [API Reference](#api-reference)
- [Design System](#design-system)
- [Route Map](#route-map)
- [Development Conventions](#development-conventions)
- [Available Scripts](#available-scripts)

---

## Prerequisites

| Tool       | Version    | Notes                                  |
| ---------- | ---------- | -------------------------------------- |
| Node.js    | v20 LTS+   | Recommended: v22 LTS                   |
| npm        | v10+       |                                        |
| .NET SDK   | v10.0+     |                                        |
| PostgreSQL | v16+       | Or use Docker                          |
| Git        | v2.x       |                                        |
| Docker     | Latest     | Optional, for containerized deployment |

---

## Getting Started

### Frontend Setup

```bash
git clone <repository-url>
cd kanoe_itss_b1/frontend

npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Backend Setup

**Step 1** -- Create the database (skip if using Docker):

```bash
psql -U postgres -h localhost -p 5432
CREATE DATABASE "VietImmerse_db";
\q
```

**Step 2** -- Configure environment variables (see [Environment Variables](#environment-variables) section).

**Step 3** -- Run the backend:

```bash
cd backend/backend
dotnet run
```

The API server will be available at [http://localhost:8080](http://localhost:8080).

> [!NOTE]
> On first startup, the backend automatically seeds the database using SQL files located in `backend/backend/database/`. The seeding process is idempotent (uses UPSERT), so it is safe to run multiple times.

### Docker Deployment

```bash
# From project root
docker-compose up --build
```

Docker Compose reads all variables from the root `.env` file and injects them into `backend` and `frontend` containers automatically.

> [!IMPORTANT]
> In `DATABASE_CONNECTION_STRING`, `Host=db` refers to the Docker network service name. When running the backend **outside Docker**, change it to `Host=localhost`.

---

## Environment Variables

Create a `.env` file at the project root (same level as `docker-compose.yml`). Below is the full template -- replace values inside `< >` with your actual credentials.

```env
# ===================================
# DATABASE
# ===================================
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=VietImmerse_db;Username=postgres;Password=<your_db_password>;Pooling=true;Trust Server Certificate=true

# ===================================
# JWT AUTHENTICATION
# ===================================
JWT_SECRET=<your_jwt_secret_at_least_32_chars>
JWT_ISSUER=VietImmerse
JWT_AUDIENCE=VietImmerseApp
JWT_EXPIRY_HOURS=24

# ===================================
# ASP.NET CORE
# ===================================
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:8080

# ===================================
# FRONTEND
# ===================================
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=production

# ===================================
# SMTP EMAIL (Gmail)
# ===================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your_gmail_address>
SMTP_PASSWORD=<your_16_char_app_password>
SMTP_FROM=VietImmerse <your_gmail_address>

# ===================================
# CLOUDINARY (Avatar Upload)
# ===================================
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# ===================================
# FPT.AI Text-to-Speech
# ===================================
FPT_TTS_API_KEY=<your_fpt_tts_key>

# ===================================
# FPT.AI Speech-to-Text (ASR)
# ===================================
FPT_ASR_API_KEY=<your_fpt_asr_key>

# ===================================
# OpenAI (Whisper Fallback ASR)
# ===================================
OPENAI_API_KEY=<your_openai_key>
```

> [!WARNING]
> **Security Notice** -- The `.env` file contains sensitive credentials (database passwords, API keys, JWT secrets). **Never commit** this file to version control. Verify it is listed in `.gitignore` before pushing.

---

### Database

| Variable                               | Description                              |
| -------------------------------------- | ---------------------------------------- |
| `ConnectionStrings__DefaultConnection` | EF Core connection string for PostgreSQL |

The backend uses `DotNetEnv` to load environment variables from the `.env` file at startup. The connection string format follows the standard Npgsql pattern.

---

### JWT Authentication

| Variable           | Default          | Description                        |
| ------------------ | ---------------- | ---------------------------------- |
| `JWT_SECRET`       | --               | Signing key, minimum 32 characters |
| `JWT_ISSUER`       | `VietImmerse`    | Token issuer claim                 |
| `JWT_AUDIENCE`     | `VietImmerseApp` | Token audience claim               |
| `JWT_EXPIRY_HOURS` | `24`             | Token lifetime in hours            |

---

### SMTP Email (Gmail)

| Variable        | Default          | Description                                          |
| --------------- | ---------------- | ---------------------------------------------------- |
| `SMTP_HOST`     | `smtp.gmail.com` | SMTP server                                          |
| `SMTP_PORT`     | `587`            | STARTTLS port                                        |
| `SMTP_USER`     | --               | Gmail address used for sending                       |
| `SMTP_PASSWORD` | --               | Google App Password (16 characters)                  |
| `SMTP_FROM`     | --               | Display name + sender, e.g. `VietImmerse <a@b.com>`  |

> [!CAUTION]
> **`SMTP_PASSWORD` is NOT your Gmail login password.**
>
> Google requires an **App Password** -- a 16-character key generated through your Google Account security settings. Regular account passwords will not work.

**Steps to generate a Google App Password:**

1. Go to [Google Account Security](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if not already active -- this is mandatory.
3. Navigate to [App Passwords](https://myaccount.google.com/apppasswords).
4. Create a new app password (name it `VietImmerse` or similar).
5. Copy the 16-character code (remove spaces) and set it as `SMTP_PASSWORD`.

---

### Cloudinary (Image Storage)

| Variable                | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `CLOUDINARY_CLOUD_NAME` | Unique cloud name from your Cloudinary account   |
| `CLOUDINARY_API_KEY`    | Public API key for request authentication        |
| `CLOUDINARY_API_SECRET` | Secret key -- **must never be exposed publicly** |

**Setup:**

1. Sign up or log in at [cloudinary.com](https://cloudinary.com/).
2. Go to **Dashboard** at [console.cloudinary.com](https://console.cloudinary.com/).
3. Find `Cloud Name`, `API Key`, and `API Secret` under **Product Environment Credentials**.

> [!CAUTION]
> If `CLOUDINARY_API_SECRET` is leaked, an attacker gains full access to your Cloudinary account (upload, delete, modify assets). Regenerate keys immediately via **Dashboard > Settings > Access Keys** if compromised.
>
> **Free Tier**: 25,000 transformations and 25 GB storage per month.

---

### FPT.AI Services

| Variable          | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `FPT_TTS_API_KEY` | API key for FPT.AI Text-to-Speech v5 (Vietnamese voice output)   |
| `FPT_ASR_API_KEY` | API key for FPT.AI Speech-to-Text (automatic speech recognition) |

These services power the **Voice Lab** feature -- learners can listen to native pronunciation (TTS) and submit their own recordings for accuracy scoring (ASR).

---

### OpenAI Whisper

| Variable         | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `OPENAI_API_KEY` | API key for OpenAI Whisper -- used as fallback ASR provider |

The system uses a **fallback chain**: FPT ASR is attempted first; if it fails, OpenAI Whisper handles the transcription.

---

## Architecture Overview

### Project Structure

```text
kanoe_itss_b1/
|
|-- backend/
|   |-- backend.sln
|   |-- Dockerfile
|   +-- backend/
|       |-- Program.cs                         # App startup, DI registration, middleware
|       |-- backend.csproj                     # .NET 10 project, NuGet packages
|       |-- appsettings.json
|       |-- Controllers/
|       |   |-- AuthController.cs              # Register, login, forgot/reset/change password
|       |   |-- UserController.cs              # Profile, avatar upload, presence
|       |   |-- MessageController.cs           # Conversations, messages, read receipts
|       |   |-- BookingController.cs           # Lesson request lifecycle (create/accept/decline/cancel)
|       |   |-- LessonController.cs            # Curriculum chapters and lesson details
|       |   |-- TtsController.cs               # Text-to-Speech synthesis endpoint
|       |   |-- VoiceLabController.cs          # Pronunciation evaluation (ASR + scoring)
|       |   +-- HomeController.cs              # Health check
|       |-- Services/
|       |   |-- IAuthService / AuthService             # Auth logic with BCrypt hashing
|       |   |-- IJwtService / JwtService               # JWT token generation
|       |   |-- IEmailService / SmtpEmailService       # Transactional emails
|       |   |-- IPhotoService / CloudinaryPhotoService  # Avatar upload to Cloudinary
|       |   |-- IMessageService / MessageService       # Chat persistence + SignalR broadcast
|       |   |-- IBookingService / BookingService        # Booking state machine
|       |   |-- ILessonService / LessonService         # Curriculum data access
|       |   |-- ITtsService / FptTtsService             # FPT.AI TTS integration
|       |   |-- IAsrService / FallbackAsrService       # ASR with FPT + OpenAI Whisper fallback
|       |   |-- IVoiceScoringService / VoiceScoringService  # Pronunciation scoring engine
|       |   |-- ITranslationService / TranslationService    # Vi-Ja translation
|       |   +-- DatabaseSeeder                         # SQL-based data seeding
|       |-- Hubs/
|       |   +-- ChatHub.cs                     # SignalR hub: messaging, booking events, presence
|       |-- Models/                            # EF Core entities (25 models)
|       |-- DTOs/                              # Request/Response DTOs (Auth, Booking, Lesson, Message, TTS, VoiceLab)
|       +-- database/
|           |-- schema.sql                     # DDL schema definition
|           +-- seed_data*.sql                 # Seeding scripts (curriculum, sample data)
|
|-- frontend/
|   |-- Dockerfile
|   |-- package.json
|   |-- next.config.ts
|   |-- tsconfig.json
|   |-- postcss.config.mjs
|   +-- src/
|       |-- app/
|       |   |-- layout.tsx                     # Root layout (fonts, providers, metadata)
|       |   |-- globals.css                    # Design system (MD3 color tokens, light/dark)
|       |   |-- page.tsx                       # Landing page
|       |   |-- login/page.tsx                 # Authentication
|       |   |-- signup/
|       |   |   |-- page.tsx                   # Role selection (Learner / Partner)
|       |   |   |-- learner/page.tsx           # Learner registration form
|       |   |   +-- partner/page.tsx           # Partner registration form
|       |   |-- forgot-password/page.tsx       # Password recovery (email)
|       |   |-- reset-password/page.tsx        # Password reset (from email link)
|       |   |-- change-password/page.tsx       # Password change (authenticated)
|       |   |-- learner/
|       |   |   |-- layout.tsx                 # Learner shell (navbar, bottom nav)
|       |   |   |-- home/page.tsx              # Learner dashboard
|       |   |   |-- lessons/page.tsx           # Curriculum browser (chapters + lessons)
|       |   |   |-- lessons/[id]/page.tsx      # Lesson detail (dialogue, tone notes, voice lab)
|       |   |   |-- matching/page.tsx          # Partner matching
|       |   |   |-- messages/page.tsx          # Real-time chat
|       |   |   +-- settings/page.tsx          # Account settings
|       |   +-- partner/
|       |       |-- layout.tsx                 # Partner shell
|       |       |-- home/page.tsx              # Partner dashboard
|       |       |-- messages/page.tsx          # Real-time chat
|       |       +-- settings/page.tsx          # Account settings
|       |-- components/
|       |   |-- auth/
|       |   |   +-- ProtectedRoute.tsx         # JWT-based route guard
|       |   |-- common/
|       |   |   |-- AvatarUploadModal.tsx      # Image crop + upload to Cloudinary
|       |   |   |-- ProfileDropdown.tsx        # User menu with sign out
|       |   |   |-- LanguageSwitcher.tsx       # Vi/Ja toggle
|       |   |   |-- DatePicker.tsx             # Custom date picker component
|       |   |   |-- TimePicker.tsx             # Custom time picker component
|       |   |   +-- SelectPicker.tsx           # Custom select dropdown
|       |   +-- layout/
|       |       |-- LearnerNavbar.tsx           # Top navigation for Learner
|       |       |-- LearnerBottomNav.tsx        # Mobile bottom navigation for Learner
|       |       |-- PartnerNavbar.tsx           # Top navigation for Partner
|       |       +-- PartnerBottomNav.tsx        # Mobile bottom navigation for Partner
|       |-- contexts/
|       |   |-- LanguageContext.tsx             # i18n provider (Vietnamese / Japanese)
|       |   +-- PresenceContext.tsx             # Online/offline user presence tracking
|       |-- hooks/
|       |   +-- useForgotPassword.ts           # Forgot password form logic
|       +-- lib/
|           |-- api.ts                         # HTTP client + typed API endpoints
|           |-- auth.tsx                       # AuthProvider + useAuth hook
|           |-- signalr.ts                     # SignalR connection manager
|           |-- chatUtils.ts                   # Message formatting + conversation helpers
|           |-- audio-utils.ts                 # Audio recording + processing utilities
|           +-- cropImage.ts                   # Canvas-based image cropping
|
|-- docs/
|   |-- dev-environment-setup-guide.docx       # Developer onboarding guide
|   |-- lesson_request_card_workflow.md        # Booking card state machine documentation
|   +-- messaging_workflow.md                  # Real-time messaging architecture documentation
|
|-- docker-compose.yml                         # Multi-service orchestration
|-- .env.example                               # Environment template
+-- README.md
```

---

### Backend Architecture

The backend follows a **layered service architecture** with clear separation of concerns:

```text
Controllers (HTTP endpoints)
     |
     v
Services (Business logic, interfaces + implementations)
     |
     v
Models (EF Core entities) <---> PostgreSQL
     |
     v
Hubs (SignalR real-time events)
```

**Key design decisions:**

- **Interface-driven DI** -- Every service is registered through an interface (`IAuthService`, `IMessageService`, etc.), enabling testability and swappability.
- **Fallback pattern for ASR** -- `FallbackAsrService` wraps `FptAsrService` and `OpenAiWhisperService`, attempting FPT first and falling back to Whisper on failure.
- **SignalR presence tracking** -- `ChatHub` uses `ConcurrentDictionary<Guid, HashSet<string>>` to track multiple connections per user, only marking a user offline when their last connection drops.
- **SQL-based seeding** -- Schema and seed data are managed via raw SQL files (`schema.sql`, `seed_data*.sql`), not EF Core migrations. This provides full control over the DDL and curriculum data.

---

### Frontend Architecture

The frontend uses the **Next.js App Router** with a mix of Server and Client Components:

```text
Providers (Auth, Language, Presence)
     |
     v
Layouts (Learner shell, Partner shell)
     |
     v
Pages (route-level components)
     |
     v
Components (shared UI: navigation, modals, pickers)
     |
     v
Lib (API client, SignalR, utilities)
```

**Key patterns:**

- **Role-based routing** -- `/learner/*` and `/partner/*` routes have separate layouts with role-specific navigation.
- **ProtectedRoute guard** -- Client-side route protection using JWT tokens stored in `localStorage`.
- **Context-based state** -- `AuthProvider`, `LanguageProvider`, and `PresenceProvider` wrap the app tree for global state access.
- **Bilingual UI** -- All user-facing text supports Vietnamese and Japanese through `LanguageContext`.

---

## Features

### Authentication and User Management

| Feature           | Description                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| Registration      | Separate flows for Learner (with level selection) and Partner (with profile details)|
| Login             | Email/password with JWT token issuance                                              |
| Password Recovery | Email-based forgot password with reset link                                         |
| Password Change   | Authenticated users can update their password                                       |
| Avatar Upload     | Image crop modal with Cloudinary storage                                            |
| User Presence     | Real-time online/offline status via SignalR                                         |

### Learning System

| Feature            | Description                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Curriculum Browser | Chapters organized by content level, each containing multiple lessons                             |
| Lesson Detail      | Interactive dialogue view with Vietnamese and Japanese translations                               |
| Tone Notes         | Color-coded Vietnamese tone pronunciation guides per lesson                                       |
| Text-to-Speech     | Native Vietnamese pronunciation playback powered by FPT.AI                                        |
| Voice Lab          | Record and evaluate pronunciation with completeness, accuracy, fluency, and prosody scores        |

### Communication

| Feature             | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| Real-time Messaging | SignalR-powered chat with instant message delivery                  |
| Conversations       | Persistent chat threads between Learner and Partner                 |
| Read Receipts       | Track message read status per conversation                          |
| Auto-translation    | Vietnamese to Japanese message translation                          |
| Lesson Booking      | In-chat lesson request cards with accept/decline/cancel workflow    |
| Meeting Links       | Attach meeting URLs to confirmed bookings                           |

### Partner Matching

| Feature            | Description                                             |
| ------------------ | ------------------------------------------------------- |
| Partner Discovery  | Browse available Vietnamese conversation partners       |
| Profile Cards      | View partner details (bio, age range, occupation)       |
| Initiate Chat      | Start a conversation directly from matching results     |

---

## API Reference

### Auth Endpoints

| Method | Endpoint                     | Description                  | Auth |
| ------ | ---------------------------- | ---------------------------- | ---- |
| POST   | `/api/auth/register/learner` | Register as Learner          | No   |
| POST   | `/api/auth/register/partner` | Register as Partner          | No   |
| POST   | `/api/auth/login`            | Login                        | No   |
| POST   | `/api/auth/forgot-password`  | Request password reset email | No   |
| POST   | `/api/auth/reset-password`   | Reset password with token    | No   |
| POST   | `/api/auth/change-password`  | Change password              | Yes  |
| GET    | `/api/auth/me`               | Get current user profile     | Yes  |

### User Endpoints

| Method | Endpoint              | Description          | Auth |
| ------ | --------------------- | -------------------- | ---- |
| POST   | `/api/users/avatar`   | Upload avatar image  | Yes  |
| POST   | `/api/users/presence` | Update online status | Yes  |
| GET    | `/api/users/presence` | Get online user IDs  | Yes  |

### Message Endpoints

| Method | Endpoint                             | Description              | Auth |
| ------ | ------------------------------------ | ------------------------ | ---- |
| GET    | `/api/message/conversations`         | List all conversations   | Yes  |
| GET    | `/api/message/{conversationId}`      | Get messages (paginated) | Yes  |
| POST   | `/api/message/{conversationId}`      | Send a message           | Yes  |
| PUT    | `/api/message/{conversationId}/read` | Mark messages as read    | Yes  |

### Booking Endpoints

| Method | Endpoint                                     | Description                   | Auth |
| ------ | -------------------------------------------- | ----------------------------- | ---- |
| POST   | `/api/booking/request`                       | Create a lesson request       | Yes  |
| PATCH  | `/api/booking/{bookingId}/accept`            | Accept a lesson request       | Yes  |
| PATCH  | `/api/booking/{bookingId}/decline`           | Decline a lesson request      | Yes  |
| DELETE | `/api/booking/{bookingId}`                   | Cancel a lesson request       | Yes  |
| GET    | `/api/booking/conversation/{conversationId}` | Get bookings for conversation | Yes  |
| GET    | `/api/booking/upcoming`                      | Get upcoming bookings         | Yes  |

### Lesson Endpoints

| Method | Endpoint                            | Description               | Auth |
| ------ | ----------------------------------- | ------------------------- | ---- |
| GET    | `/api/lesson/chapters?levelId={id}` | Get chapters with lessons | Yes  |
| GET    | `/api/lesson/{id}`                  | Get lesson detail         | Yes  |

### TTS and Voice Lab Endpoints

| Method | Endpoint                 | Description                             | Auth |
| ------ | ------------------------ | --------------------------------------- | ---- |
| POST   | `/api/tts/synthesize`    | Synthesize Vietnamese text to speech    | Yes  |
| POST   | `/api/voicelab/evaluate` | Evaluate pronunciation (multipart/form) | Yes  |

### SignalR Hub

| Property | Value                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Endpoint | `/chathub` (WebSocket)                                                   |
| Events   | `ReceiveMessage`, `UserOnline`, `UserOffline`, `BookingUpdated`          |
| Methods  | `JoinConversation`, `LeaveConversation`, `JoinPresence`, `LeavePresence` |
| Auth     | JWT via `access_token` query parameter                                   |

---

## Design System

The application implements a **Material Design 3** color system with light and dark theme support.

### Color Tokens

| Token                 | Light Value | Dark Value | Usage                        |
| --------------------- | ----------- | ---------- | ---------------------------- |
| `--primary`           | `#09294f`   | `#adc7f7`  | Primary actions, brand color |
| `--secondary`         | `#715a3e`   | `#e0c29f`  | Secondary elements           |
| `--tertiary`          | `#3f2122`   | `#ecbbba`  | Accent elements              |
| `--error`             | `#ba1a1a`   | `#ffb4ab`  | Error states                 |
| `--surface`           | `#f9f9f7`   | `#111418`  | Page backgrounds             |
| `--on-surface`        | `#1a1c1b`   | `#e2e2e0`  | Text on surfaces             |
| `--surface-container` | `#eeeeec`   | `#1e2025`  | Card backgrounds             |
| `--outline`           | `#74777d`   | `#8e9097`  | Borders, dividers            |

### Typography

| Role     | Font Family    | Weight Range | Usage            |
| -------- | -------------- | ------------ | ---------------- |
| Headline | Be Vietnam Pro | 400 -- 800   | Titles, headings |
| Body     | Manrope        | 400 -- 700   | Body text, labels|

### Custom Utilities

| Class                  | Effect                                     |
| ---------------------- | ------------------------------------------ |
| `.lotus-shape`         | Decorative polygon clip-path               |
| `.lotus-mask`          | SVG-based lotus petal mask                 |
| `.lotus-gradient`      | Primary-to-container gradient              |
| `.glass-panel`         | Frosted glass effect (backdrop blur)       |
| `.engawa-shadow`       | Elevated card shadow                       |
| `.profile-card-shadow` | Subtle card shadow for matching profiles   |
| `.bg-pattern`          | Dot pattern background texture             |

---

## Route Map

### Public Routes

| Route              | Page                                |
| ------------------ | ----------------------------------- |
| `/`                | Landing page                        |
| `/login`           | Sign in                             |
| `/signup`          | Role selection (Learner or Partner) |
| `/signup/learner`  | Learner registration                |
| `/signup/partner`  | Partner registration                |
| `/forgot-password` | Password recovery                   |
| `/reset-password`  | Password reset (via email token)    |

### Authenticated Routes -- Learner

| Route                  | Page                         |
| ---------------------- | ---------------------------- |
| `/learner/home`        | Dashboard                    |
| `/learner/lessons`     | Curriculum browser           |
| `/learner/lessons/:id` | Lesson detail with Voice Lab |
| `/learner/matching`    | Partner discovery            |
| `/learner/messages`    | Chat with partners           |
| `/learner/settings`    | Account settings             |
| `/change-password`     | Password change              |

### Authenticated Routes -- Partner

| Route               | Page               |
| ------------------- | ------------------ |
| `/partner/home`     | Dashboard          |
| `/partner/messages` | Chat with learners |
| `/partner/settings` | Account settings   |
| `/change-password`  | Password change    |

---

## Development Conventions

| Aspect           | Convention                                                      |
| ---------------- | --------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router) + React 19 + TypeScript strict          |
| Styling          | Tailwind CSS v4 with custom MD3 design tokens                   |
| Components       | Client/Server Components, `PascalCase.tsx` naming               |
| Route files      | `page.tsx` per directory (App Router convention)                |
| Backend          | ASP.NET Core 10, interface-driven DI, `PascalCase` C#           |
| State management | React Context (Auth, Language, Presence)                        |
| Form validation  | React Hook Form + Zod schema validation                         |
| Real-time        | SignalR WebSocket with JWT query-string auth                    |
| Commits          | Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)       |
| Git              | `.env` excluded via `.gitignore`                                |

---

## Available Scripts

### Frontend (from `frontend/` directory)

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Create production build
npm run start     # Start production server
npm run lint      # Run ESLint checks
```

### Backend (from `backend/backend/` directory)

```bash
dotnet run        # Start API server (http://localhost:8080)
dotnet build      # Compile the project
dotnet test       # Run unit tests
```

### Docker (from project root)

```bash
docker-compose up --build     # Build and start all services
docker-compose down           # Stop and remove containers
docker-compose logs -f        # Follow container logs
```

---

**VietImmerse** -- Built with purpose for the Japanese community in Hanoi.
