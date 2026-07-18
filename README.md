# SmartHire - AI-Powered Job Portal

SmartHire is a production-grade, AI-powered Job Portal designed with a clean architecture and scalable project organization. This project is structured as a monorepo containing both the frontend client and the backend server.

## Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy 2.0, PostgreSQL, Alembic
- **Authentication**: JWT & Refresh Tokens
- **AI Integration**: Resume Parsing and Job Matching
- **Deployment**: Docker and Docker Compose

---

## Directory Structure

```text
SmartHire/
├── backend/                  # FastAPI Backend Service
│   ├── alembic/              # Database migration configuration and scripts
│   ├── app/                  # Main application package
│   │   ├── api/              # API router and endpoints (V1)
│   │   ├── auth/             # Authentication & token verification helpers
│   │   ├── core/             # Application configs, security settings, constants
│   │   ├── database/         # SQLAlchemy DB connection & session managers
│   │   ├── dependencies/     # FastAPI Dependency injection parameters (e.g., db sessions, auth)
│   │   ├── middleware/       # Custom middlewares (CORS, timing, logging)
│   │   ├── models/           # SQLAlchemy Declarative models (database schemas)
│   │   ├── repositories/     # Data-access layer abstracts (CRUD operations)
│   │   ├── schemas/          # Pydantic schemas (request validation, response serialization)
│   │   ├── services/         # Business logic layer (orchestrates repositories and third-party integrations)
│   │   ├── uploads/          # Local files/resumes storage folder
│   │   └── utils/            # Shared utility functions and helpers
│   ├── tests/                # Pytest configuration and test suites
│   ├── alembic.ini           # Alembic configuration file
│   ├── Dockerfile            # Container definition for backend
│   └── requirements.txt      # Python dependencies manifest
│
├── frontend/                 # React Frontend Client
│   ├── public/               # Static assets directly served
│   ├── src/                  # Application source code
│   │   ├── assets/           # Media files, images, icons, global styles
│   │   ├── components/       # Reusable React components (common & feature-specific)
│   │   ├── constants/        # Application-wide constants, links, configuration parameters
│   │   ├── contexts/         # React Contexts (auth, theme, notifications)
│   │   ├── hooks/            # Custom React hooks (useAuth, useFetch)
│   │   ├── layouts/          # Layout components providing structural wrappers
│   │   ├── pages/            # View components tied directly to router endpoints
│   │   ├── routes/           # Routing configuration, private & public route wrapper setups
│   │   ├── services/         # API abstraction and external client calls
│   │   ├── styles/           # Global styling files, Tailwind configuration imports
│   │   ├── types/            # TypeScript type definitions and interfaces
│   │   └── utils/            # Helper utilities and validators
│   ├── Dockerfile            # Container definition for frontend
│   ├── package.json          # Node dependencies and scripts
│   ├── tsconfig.json         # TypeScript configuration
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS layout engine configuration
│   └── postcss.config.js     # PostCSS loader configuration
│
└── docker-compose.yml        # Local developer multi-container orchestrator
```

---

## Folder Responsibilities

### Backend Layer (`/backend`)

| Directory | Responsibility |
| :--- | :--- |
| **`alembic`** | Stores migrations scripts and schema evolution steps, enabling revision rollback and tracking. |
| **`app/api`** | HTTP endpoints layer. Declares paths, endpoints, tags, and delegates request execution to the service layer. |
| **`app/auth`** | Standardized token encryption, decryption, JWT generation, password-hashing, and refresh-token mechanisms. |
| **`app/core`** | Central settings configurations using Pydantic Settings, environment parsing, and global variables/security parameters. |
| **`app/database`** | Instantiates the SQLAlchemy engine, configures session pools, and sets up transaction boundaries. |
| **`app/dependencies`** | Injection helpers used inside API routes (e.g., extracting db session, checking user roles, verifying active sessions). |
| **`app/middleware`** | Interceptors operating on standard HTTP lifecycles (CORS permissions, logger telemetry, request tracing headers). |
| **`app/models`** | SQLAlchemy declarative structures defining the relational database schema and mapping columns to model fields. |
| **`app/repositories`** | Handles low-level database operations (CRUD queries). Decouples `models` from the service layer, keeping DB query syntax isolated. |
| **`app/schemas`** | Pydantic data objects. Validates payload models on inbound requests and filters properties on outbound responses. |
| **`app/services`** | Orchestrates application business logic. Integrates repositories, handles AI model invocations (Resume Parsing, Job Matching), and processes data. |
| **`app/uploads`** | Directory for storing raw files uploaded by applicants or job managers prior to processing. |
| **`app/utils`** | Pure, side-effect-free helper functions (date calculations, parsing utilities, regex checkers). |
| **`tests`** | Contains unit and integration test modules run with Pytest, using standard database mocks/fixtures. |

### Frontend Layer (`/frontend`)

| Directory | Responsibility |
| :--- | :--- |
| **`src/assets`** | Houses visual assets (logos, raw images, custom vectors) and system styles utilized throughout components. |
| **`src/components`** | Reusable UI widgets. Segmented into `common` (buttons, forms, modals) and `features` (job list card, resume uploader widget). |
| **`src/constants`** | Application configuration parameters, menu arrays, status maps, and error templates. |
| **`src/contexts`** | React state providers representing global operations like active authentication sessions, alerts, or color modes. |
| **`src/hooks`** | Custom React hooks decoupling side-effects and state synchronization from structural components. |
| **`src/layouts`** | Wrapper shells outlining key site navigation paths (e.g., standard site header + footer vs. sidebar dashboard view). |
| **`src/pages`** | High-level container components bound to routes (e.g., `JobsPage`, `ProfilePage`, `DashboardPage`). |
| **`src/routes`** | Configuration mapping page components to URL paths, including Route Guards for public, authenticated, or recruiter roles. |
| **`src/services`** | HTTP abstraction clients (like Axios/Fetch). Sends requests to the backend api endpoints. |
| **`src/styles`** | Tailwind CSS directives, theme configuration additions, and custom vanilla CSS components. |
| **`src/types`** | Holds TypeScript `interfaces`, `types`, and `enums` mapping database objects, APIs, and component props. |
| **`src/utils`** | Lightweight utility scripts (date formatters, currency formatting, text summarizers, local storage caching helpers). |

---

## Local Development Startup

To run the whole system locally using Docker:

```bash
docker-compose up --build
```

- Backend API: `http://localhost:8000`
- Frontend Application: `http://localhost:3000`
- PostgreSQL Database: `localhost:5432`
