# G-Pilot Agent Registry

This directory contains global agent specifications that are available across all G-Pilot missions.

## Active Fleet

| Agent | Implementation | Capabilities | Status |
|-------|----------------|--------------|--------|
| **Genesis Architect** | `genesis-architect.ts` | Agent creation, capability discovery, domain detection | 🟢 Active |
| **Agent Scout** | `agent-scout.ts` | Intelligence gathering, agent discovery, dossier generation | 🟢 Active |
| **Mission Overseer** | `mission-overseer.ts` | Task orchestration, mission coordination, fleet command | 🟢 Active |
| **Content Orchestrator** | `content-orchestrator.ts` | Research synthesis, presentation building, Veo 3.1 video | 🟢 Active |
| **SEO Analyst** | `seo-analyst.ts` | Technical SEO audits, keyword strategy, competitor analysis | 🟢 Active |
| **GEO Marketing Agent** | `geo-marketing-agent.ts` | Generative Engine Optimization, citation vectors, LLM visibility | 🟢 Active |
| **Marketing Strategist** | `marketing-strategist.ts` | Campaign planning, audience targeting, content strategy | 🟢 Active |
| **Social Commander** | `social-commander.ts` | Multi-platform publishing, engagement tracking, HITL approval | 🟢 Active |
| **Web Scraper** | `web-scraper.ts` | Enterprise scraping, anti-block handling, structured extraction | 🟢 Active |
| **Data Collector** | `data-collector.ts` | Batch data collection, archival, structured output | 🟢 Active |
| **Browser Agent** | `browser-agent.ts` | Web navigation, form filling, visual extraction | 🟢 Active |
| **UI Auditor** | `ui-auditor.ts` | Accessibility audits, UX analysis, component validation | 🟢 Active |

## Core Components

- **Base Agent** (`src/agents/base/`) - Abstract class defining the PLANNING → EXECUTION → VERIFICATION lifecycle
- **Agent Registry** (`src/agents/registry.ts`) - Dynamic agent registration and runtime discovery
- **NotebookLM Agent** (`src/agents/notebookLM.ts`) - Specialized agent for deep document grounding

## Agent Discovery

Agents are automatically discovered from this directory. Each agent folder must contain:

- `AGENT.md` - Agent specification with capabilities, bound skills, and configuration

## Usage

```typescript
import { AgentRegistry } from '@/agents/registry';

// Initialize all agents
await AgentRegistry.initializeAgents();

// Get an agent by name
const agent = AgentRegistry.get('geo-marketing');

// Execute with context
const plan = await agent.plan({
  userId: 'user_123',
  mission: 'Optimize for AI search engines',
  parameters: { targetUrl: 'https://example.com' }
});

const result = await agent.execute(plan, context);
const report = await agent.verify(result, context);
```

## Skill Bindings

Agents can bind to skills from the G-Pilot skill library:

| Skill | Description | Bound Agents |
|-------|-------------|--------------|
| `gemini_3_flash` | Gemini 3 Flash reasoning | All agents |
| `deep_research` | Long-context document analysis | Content Orchestrator, SEO Analyst |
| `veo_31_generate` | Video generation (Veo 3.1) | Content Orchestrator |
| `image_generation` | Imagen 3 visuals | Content Orchestrator, Marketing Strategist |
| `web_intel` | Web intelligence scraping | Agent Scout, Web Scraper |
| `agent_discovery` | Multi-source agent scanning | Agent Scout, Genesis Architect |
| `notebook_lm_research` | NotebookLM deep research | Content Orchestrator |

## Fleet Health

Fleet status is available via the `/dashboard` telemetry panel and the `FleetStatus` component.
