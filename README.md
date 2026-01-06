<div align="center">

# 🤖 NodeJS-Starter-V1

### Self-Contained AI Starter Template

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![No API Keys Required](https://img.shields.io/badge/🔓_No_API_Keys-Required-success?style=for-the-badge)](/)
[![Offline First](https://img.shields.io/badge/📡_Offline-First-blue?style=for-the-badge)](/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <strong>Production-ready monorepo for AI applications • Works completely offline • Zero external dependencies</strong>
</p>

[Quick Start](#-quick-start) •
[Features](#-features) •
[Architecture](#-architecture) •
[Documentation](#-documentation) •
[Optional Upgrades](#-optional-upgrades)

</div>

---

## 🎯 What Makes This Different?

✅ **No API Keys Required** - Works completely without external services
✅ **Runs Offline** - Local AI with Ollama (llama3.1:8b)
✅ **Self-Contained Database** - PostgreSQL + pgvector in Docker
✅ **One Command Setup** - `pnpm run setup` and you're done
✅ **Clone for New Projects** - Perfect starter template
✅ **Optional Cloud Upgrades** - Add Claude API, deploy when ready

This is a **starter template**, not a deployed product. Clone it, customize it, and build your own AI-powered application.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Docker | Latest | [docker.com](https://docker.com/) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 9+ | `npm install -g pnpm` |
| Python | 3.12+ | [python.org](https://python.org/) |
| uv | Latest | `pip install uv` |
| Ollama | Latest | [ollama.com](https://ollama.com/) |

### Installation (< 10 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/CleanExpo/NodeJS-Starter-V1.git
cd NodeJS-Starter-V1

# 2. Run automated setup
pnpm run setup

# 3. Start development
pnpm dev
```

**That's it!** No API keys, no account creation, no external services.

**Services will start on:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Ollama: http://localhost:11434

---

## ✨ Features

### 🎨 Frontend
- **Next.js 15** with App Router & React 19
- **Tailwind CSS v4** with design tokens
- **shadcn/ui** component library
- **TypeScript** for type safety
- Responsive & WCAG 2.1 AA accessible
- Server Components & RSC

### ⚡ Backend
- **FastAPI** for high-performance APIs
- **LangGraph** agent orchestration
- **JWT Authentication** (no external auth)
- Async-first architecture
- Structured logging
- SQLAlchemy ORM

### 🗄️ Database
- **PostgreSQL 15** in Docker
- **pgvector** for AI embeddings
- **Local-first** - No cloud required
- Migration system with Alembic
- Full-text search ready
- Redis for caching

### 🤖 AI Integration
- **Ollama** (local, default) - llama3.1:8b
- **Claude 4.5** (optional, cloud)
- **Multi-model support** ready
- Provider abstraction layer
- Embeddings for RAG

### 🧪 Testing & Quality
- **Zero external dependencies** for CI/CD
- pytest + vitest with coverage
- Playwright E2E tests
- ESLint + Ruff linting
- Type checking (mypy + tsc)
- NPM Audit + Trivy security scans

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js 15 │  │   React 19  │  │   Tailwind + shadcn/ui  │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         └────────────────┼──────────────────────┘               │
│                          │ JWT Auth                              │
└──────────────────────────┼───────────────────────────────────────┘
                           │ REST API
┌──────────────────────────┼───────────────────────────────────────┐
│                          ▼                                       │
│                       BACKEND                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   FastAPI   │──│  LangGraph  │──│   Agent Orchestrator    │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                       │               │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌────────────▼────────────┐  │
│  │  AI Models  │  │ SQLAlchemy  │  │      Provider Layer     │  │
│  │Ollama/Claude│  │     ORM     │  │   (Ollama → Claude)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                          ▼                                       │
│                    LOCAL SERVICES                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │           PostgreSQL 15 + pgvector (Docker)                  ││
│  │           Redis (Docker)                                     ││
│  │           Ollama (Local AI)                                  ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

**Key Principle**: Everything runs locally. No external API calls required.

---

## 📁 Project Structure

```
📦 NodeJS-Starter-V1
├── 📂 .github/workflows      # CI/CD (no secrets required)
│   └── 📂 examples           # Optional deployment templates
├── 📂 apps
│   ├── 📂 web                # Next.js frontend
│   │   ├── 📂 app            # App router pages
│   │   ├── 📂 components     # React components
│   │   ├── 📂 lib/api        # API client (replaces Supabase)
│   │   └── 📂 middleware.ts  # JWT auth middleware
│   └── 📂 backend            # Python backend
│       ├── 📂 src
│       │   ├── 📂 agents     # AI agent implementations
│       │   ├── 📂 api        # FastAPI routes
│       │   ├── 📂 auth       # JWT authentication
│       │   ├── 📂 config     # Database & settings
│       │   ├── 📂 db         # SQLAlchemy models
│       │   └── 📂 models     # AI provider layer
│       └── 📂 tests          # Pytest tests
├── 📂 scripts                # Setup & utility scripts
│   ├── init-db.sql          # PostgreSQL schema
│   ├── setup.sh             # Automated setup (Unix)
│   └── setup.ps1            # Automated setup (Windows)
├── docker-compose.yml       # PostgreSQL + Redis
├── .env.example             # Environment template (no secrets!)
└── README.md                # This file
```

---

## 🔧 Development

### Start All Services

```bash
# One command to start everything
pnpm dev
```

This starts:
- Frontend (Next.js) on :3000
- Backend (FastAPI) on :8000
- PostgreSQL on :5432
- Redis on :6379
- Ollama on :11434 (if running)

### Individual Services

```bash
# Frontend only
pnpm dev --filter=web

# Backend only
cd apps/backend
uv run uvicorn src.api.main:app --reload

# Database only
docker compose up postgres redis
```

### Quality Checks

```bash
# Run all checks (linting, type-check, tests)
pnpm turbo run lint type-check test

# Backend checks
cd apps/backend
uv run ruff check src/      # Linting
uv run mypy src/            # Type checking
uv run pytest --cov         # Tests with coverage

# Frontend checks
pnpm lint --filter=web      # Linting
pnpm type-check --filter=web # Type checking
pnpm test --filter=web      # Tests with coverage
```

---

## 🤖 AI Models

### Default (Local, Free)

| Provider | Model | Use Case | Cost |
|----------|-------|----------|------|
| **Ollama** | llama3.1:8b | General tasks | **FREE** |
| **Ollama** | nomic-embed-text | Embeddings | **FREE** |

### Optional (Cloud, Paid)

| Provider | Model | Use Case | Cost |
|----------|-------|----------|------|
| Anthropic | Claude Opus 4.5 | Complex reasoning | $15/$75 per 1M tokens |
| Anthropic | Claude Sonnet 4.5 | Balanced tasks | $3/$15 per 1M tokens |
| Anthropic | Claude Haiku 4.5 | Fast responses | $0.25/$1.25 per 1M tokens |

**To switch to Claude**: Set `AI_PROVIDER=anthropic` and add `ANTHROPIC_API_KEY` to `.env`

---

## ⚙️ Environment Variables

### Default Configuration (Works Out of the Box)

```env
# Database (Docker - no changes needed)
DATABASE_URL=postgresql://starter_user:local_dev_password@localhost:5432/starter_db

# JWT Authentication (change in production!)
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_EXPIRE_MINUTES=60

# AI Provider (local by default)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Backend
BACKEND_URL=http://localhost:8000
```

**That's it!** No API keys required for local development.

### Optional Upgrades

```env
# Cloud AI (Optional)
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# Other AI Providers (Optional)
GOOGLE_AI_API_KEY=xxx
OPENROUTER_API_KEY=sk-or-xxx

# MCP Tools (Optional)
EXA_API_KEY=xxx
REF_TOOLS_API_KEY=xxx
```

---

## 🚢 Optional Upgrades

### Deploy to Cloud (When Ready)

The template includes example deployment workflows in `.github/workflows/examples/`:

**Frontend Options:**
- Vercel (recommended) - see `deploy-frontend.yml.example`
- Netlify
- Cloudflare Pages
- AWS Amplify

**Backend Options:**
- DigitalOcean App Platform - see `deploy-backend.yml.example`
- Railway
- Fly.io
- Render
- AWS/GCP/Azure

**Database Options:**
- Keep PostgreSQL in Docker (recommended for small apps)
- Supabase (managed PostgreSQL)
- Neon, PlanetScale, or any PostgreSQL host

### Upgrade to Cloud AI

```bash
# 1. Get Claude API key from https://console.anthropic.com/
# 2. Update .env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# 3. Restart backend
pnpm dev
```

The provider layer automatically switches from Ollama to Claude.

### Add External Services

See `docs/OPTIONAL_SERVICES.md` for guides on adding:
- Codecov for coverage tracking
- Snyk for security scanning
- Additional AI providers
- Payment processing
- Email services
- Analytics

---

## 🧪 Testing

```bash
# Run all tests
pnpm turbo run test

# Frontend tests
pnpm test --filter=web
pnpm test:coverage --filter=web
pnpm test:e2e --filter=web

# Backend tests
cd apps/backend
uv run pytest
uv run pytest --cov
uv run pytest --cov --cov-report=html

# View coverage reports
open apps/web/coverage/index.html       # Frontend
open apps/backend/htmlcov/index.html    # Backend
```

**Note**: Tests run without any external services. CI/CD works out of the box.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [LOCAL_SETUP.md](docs/LOCAL_SETUP.md) | Docker setup & troubleshooting |
| [AI_PROVIDERS.md](docs/AI_PROVIDERS.md) | Ollama vs Claude comparison |
| [OPTIONAL_SERVICES.md](docs/OPTIONAL_SERVICES.md) | Deployment & upgrade guides |
| [.github/SECRETS.md](.github/SECRETS.md) | Optional secrets reference |

**Framework Documentation:**
- [Next.js](https://nextjs.org/docs) - Frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [LangGraph](https://langchain-ai.github.io/langgraph/) - Agent orchestration
- [Ollama](https://ollama.com/) - Local AI
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

## 🔧 Troubleshooting

### Ollama not running

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh  # Linux/Mac
# Windows: Download from https://ollama.com/

# Pull models
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# Start Ollama
ollama serve
```

### Database connection errors

```bash
# Check if Docker services are running
docker compose ps

# Restart services
docker compose down
docker compose up -d

# Reset database (CAUTION: destroys data)
docker compose down -v
docker compose up -d
```

### Port already in use

```bash
# Check what's using the port
lsof -i :3000   # Frontend
lsof -i :8000   # Backend
lsof -i :5432   # PostgreSQL

# Kill the process or change ports in .env
```

**More troubleshooting**: See `docs/LOCAL_SETUP.md`

---

## 🤝 Contributing

Contributions welcome! This is a **template project** - feel free to:

1. **Fork** for your own projects
2. **Submit PRs** to improve the template
3. **Report issues** if something doesn't work
4. **Share** your projects built with this template

**Guidelines:**
- Keep it self-contained (no required external services)
- Maintain offline-first capability
- Document any new dependencies
- Include tests for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR**: Use it for anything, commercially or personally, with or without attribution.

---

<div align="center">

### 🎯 Perfect For

New AI projects • Internal tools • MVPs • Learning • Experimentation

### 🚀 Clone → Setup → Build

No API keys • No accounts • No deployment required

**[⬆ Back to Top](#-nodejs-starter-v1)**

</div>
