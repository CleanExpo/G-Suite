# New Project Setup Checklist

Complete checklist for setting up a fresh project with the domain memory system.

## Pre-Setup Requirements

### Software Installation

- [ ] **Docker Desktop** installed and running
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: Open Docker Desktop, ensure "Engine running" shows green

- [ ] **Node.js 18+** installed
  - Download: https://nodejs.org/
  - Verify: `node --version` (should show v18.x or higher)

- [ ] **pnpm** installed globally
  - Install: `npm install -g pnpm`
  - Verify: `pnpm --version`

- [ ] **Python 3.12+** installed
  - Download: https://www.python.org/downloads/
  - Verify: `python --version` (should show 3.12.x or higher)

- [ ] **uv** package manager installed
  - Install: `pip install uv`
  - Verify: `uv --version`

- [ ] **Git** installed (for version control)
  - Download: https://git-scm.com/
  - Verify: `git --version`

## Project Setup Steps

### 1. Clone/Create Project

- [ ] Clone the repository or create new project directory
  ```powershell
  git clone https://github.com/yourusername/yourproject.git
  cd yourproject
  ```

- [ ] Verify project structure exists:
  ```
  yourproject/
  ├── apps/
  │   ├── backend/
  │   └── web/
  ├── supabase/
  │   └── migrations/
  ├── scripts/
  └── docs/
  ```

### 2. Install Dependencies

- [ ] Install root-level dependencies
  ```powershell
  pnpm install
  ```
  **Expected:** No errors, `node_modules/` created

- [ ] Install backend dependencies
  ```powershell
  cd apps\backend
  uv sync
  ```
  **Expected:** Virtual environment created, dependencies installed

- [ ] Return to root directory
  ```powershell
  cd ..\..
  ```

### 3. Configure Environment

- [ ] Copy environment template
  ```powershell
  copy .env.example .env
  ```
  **If `.env.example` doesn't exist, create `.env` manually**

- [ ] Edit `.env` file with required variables:
  ```env
  # Supabase (will get these after starting Supabase)
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=

  # Anthropic (get from https://console.anthropic.com/)
  ANTHROPIC_API_KEY=

  # OpenAI (optional, get from https://platform.openai.com/)
  OPENAI_API_KEY=
  ```

### 4. Initialize Supabase

- [ ] Start Supabase local instance
  ```powershell
  supabase start
  ```
  **Expected:** Downloads Docker images (first time), starts containers

- [ ] Wait for "Started supabase" message

- [ ] Copy Supabase keys from output:
  ```
  API URL: http://localhost:54321
  anon key: eyJhbGc...
  service_role key: eyJhbGc...
  ```

- [ ] Update `.env` file with Supabase keys:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-anon-key>
  SUPABASE_SERVICE_ROLE_KEY=<paste-service-role-key>
  ```

### 5. Initialize Database

- [ ] Run database initialization script
  ```powershell
  .\scripts\init-database.ps1 -Reset -Verify
  ```

- [ ] Confirm database reset when prompted (type `y`)

- [ ] Verify all checks pass:
  ```
  ✅ Docker is running
  ✅ Supabase started successfully
  ✅ Database reset complete
  ✅ All migrations applied
  ✅ All checks passed! Database is properly configured.
  ```

### 6. Verify Memory System Setup

- [ ] Run Python setup verification
  ```powershell
  cd apps\backend
  uv run python scripts\setup-memory.py
  ```

- [ ] Verify all checks pass:
  ```
  ✅ Supabase URL
  ✅ Supabase service key
  ✅ Database connection
  ✅ MemoryStore initialization
  ✅ Embedding generation
  ✅ Create memory
  ✅ Read memory
  ✅ Update memory
  ✅ Delete memory
  ✅ All checks passed! Domain memory system is ready.
  ```

### 7. Run Tests

- [ ] Run unit tests
  ```powershell
  uv run pytest tests\test_memory*.py -v
  ```
  **Expected:** All tests pass (56 tests for memory system)

- [ ] Run integration tests
  ```powershell
  uv run pytest tests\integration\ -v -m integration
  ```
  **Expected:** All integration tests pass

- [ ] Run performance benchmarks (optional)
  ```powershell
  uv run pytest tests\performance\ -v -m performance -s
  ```
  **Expected:** Performance within acceptable ranges

- [ ] Return to root directory
  ```powershell
  cd ..\..
  ```

### 8. Run Full Project Checks

- [ ] Run type checking
  ```powershell
  pnpm turbo run type-check
  ```
  **Expected:** No type errors

- [ ] Run linting
  ```powershell
  pnpm turbo run lint
  ```
  **Expected:** No linting errors

- [ ] Run all tests
  ```powershell
  pnpm turbo run test
  ```
  **Expected:** All tests pass across all packages

### 9. Start Development

- [ ] Start all services
  ```powershell
  pnpm dev
  ```

- [ ] Verify services are running:
  - [ ] **Frontend:** http://localhost:3000 (Next.js app loads)
  - [ ] **Backend:** http://localhost:8000 (API responds)
  - [ ] **Supabase Studio:** http://localhost:54323 (UI loads)

- [ ] Check browser console for errors (should be none)

### 10. Verify Database in Supabase Studio

- [ ] Open Supabase Studio: http://localhost:54323

- [ ] Navigate to "Table Editor" in left sidebar

- [ ] Verify domain memory tables exist:
  - [ ] `domain_memories`
  - [ ] `domain_knowledge`
  - [ ] `user_preferences`
  - [ ] `test_failure_patterns`
  - [ ] `test_results`
  - [ ] `debugging_sessions`

- [ ] Click on `domain_memories` table

- [ ] Verify columns exist:
  - [ ] `id`, `domain`, `category`, `key`, `value`
  - [ ] `user_id`, `source`, `tags`
  - [ ] `embedding` (vector type)
  - [ ] `relevance_score`, `access_count`
  - [ ] `created_at`, `updated_at`

## Optional Setup

### Configure IDE

- [ ] **VS Code:** Install recommended extensions
  - Python
  - Pylance
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

- [ ] **PyCharm/IntelliJ:** Configure Python interpreter
  - Point to `apps/backend/.venv/` virtual environment

### Set Up Git Hooks

- [ ] Initialize Git (if not already)
  ```powershell
  git init
  ```

- [ ] Create pre-commit hook (optional)
  ```powershell
  # In .git/hooks/pre-commit
  #!/bin/sh
  pnpm turbo run type-check lint test
  ```

### Configure Anthropic API

- [ ] Sign up for Anthropic API: https://console.anthropic.com/

- [ ] Generate API key

- [ ] Add to `.env`:
  ```env
  ANTHROPIC_API_KEY=sk-ant-...
  ```

### Configure OpenAI API (for embeddings)

- [ ] Sign up for OpenAI API: https://platform.openai.com/

- [ ] Generate API key

- [ ] Add to `.env`:
  ```env
  OPENAI_API_KEY=sk-...
  ```

- [ ] Re-verify setup to use OpenAI embeddings:
  ```powershell
  cd apps\backend
  uv run python scripts\setup-memory.py
  ```

## Verification Checklist

Run this final verification to ensure everything works:

```powershell
# Single command - all checks
pnpm turbo run type-check lint test && echo "✅ Ready for development"
```

### Expected Results

- [ ] ✅ Type checking passes (no TypeScript errors)
- [ ] ✅ Linting passes (no ESLint/Pylint errors)
- [ ] ✅ All tests pass (unit + integration)
- [ ] ✅ "Ready for development" message appears

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Docker not running | Start Docker Desktop, wait for green "Engine running" |
| Port conflicts (54321, 54323) | Stop other services using these ports, or change Supabase config |
| Migration errors | Run `.\scripts\init-database.ps1 -Reset` to clean slate |
| Tests failing | Ensure database is initialized, check `.env` file |
| Supabase won't start | `supabase stop`, then `supabase start` |

### Get Help

- **Documentation:** Check `docs/` folder
- **Validation script:** `.\scripts\validate-database.ps1 -Verbose`
- **Setup verification:** `cd apps\backend && uv run python scripts\setup-memory.py`

## Next Steps

After completing this checklist:

1. **Read the architecture docs:**
   - `docs/domain-memory-setup.md`
   - `docs/domain-memory-architecture.md` (if exists)

2. **Explore examples:**
   - `apps/backend/src/memory/examples/` (if exists)

3. **Start building:**
   - Create your first memory-powered agent
   - Implement knowledge persistence
   - Add user preference tracking

4. **Monitor and optimize:**
   - Run performance benchmarks regularly
   - Check Supabase logs for slow queries
   - Optimize indexes as needed

## Quick Reference

### Essential Commands

```powershell
# Start development
pnpm dev

# Run all checks
pnpm turbo run type-check lint test

# Database management
supabase start                          # Start Supabase
supabase stop                           # Stop Supabase
.\scripts\init-database.ps1             # Apply new migrations
.\scripts\init-database.ps1 -Reset      # Reset database
.\scripts\validate-database.ps1         # Validate setup

# Testing
cd apps\backend
uv run pytest -v                        # All tests
uv run pytest tests\integration\ -v    # Integration tests
uv run pytest tests\performance\ -s    # Performance benchmarks

# Verification
cd apps\backend
uv run python scripts\setup-memory.py   # Verify memory system
```

---

**Setup time:** ~15-20 minutes (first time, including Docker downloads)
**Last updated:** December 2025
