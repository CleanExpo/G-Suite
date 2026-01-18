# ARCH.md: G-Pilot Technical Architecture

## 1. Unified Backend Strategy
- **Framework**: Next.js 16 (App Router) with Turbopack.
- **Node Runtime**: v20+ for stability.
- **Workflow Engine**: LangGraph for stateful agent orchestration.
- **Database**: Prisma + PostgreSQL (Cloud SQL) for persistence; Redis (Upstash) for BullMQ job queues.

## 2. Agentic Reasoning Layers
- **Primary LLM**: Gemini 2.0 Flash (for speed and context).
- **Creative Suite**: Imagen 3 (3D visuals) & VEO (cinematic video).
- **Tools**: Integrated `googleapis`, `puppeteer`, and custom social-swarm connectors.

## 3. Sovereign Vault System
- **Provider**: Firebase Admin SDK for decentralized document storage.
- **Encryption**: AES-256 for all stored credentials.
- **Ephemeral Logic**: No sensitive session data persisted outside the Vault.

## 4. Transactional Ledger
- **Engine**: Stripe for credit replenishment.
- **Internal Ledger**: "Fuel" system (PTS) mapped to transaction IDs.
- **Sync**: Real-time telemetry via BullMQ hooks.
