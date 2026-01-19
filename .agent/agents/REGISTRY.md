# G-Pilot Agent Registry

This directory contains global agent specifications that are available across all G-Pilot missions.

## Available Agents

| Agent | Folder | Status |
|-------|--------|--------|
| Marketing Strategist | `marketing-strategist/` | Active |
| SEO Analyst | `seo-analyst/` | Active |
| Social Commander | `social-commander/` | Active |
| Content Orchestrator | `content-orchestrator/` | Active |

## Agent Discovery

Agents are automatically discovered from this directory. Each agent folder must contain:

- `AGENT.md` - Agent specification with capabilities and configuration

## Usage

Agents are loaded by the Agent Registry (`src/agents/registry.ts`) at runtime.

```typescript
import { AgentRegistry } from '@/agents/registry';

// Get an agent
const seoAgent = AgentRegistry.get('seo-analyst');

// Execute with context
const result = await seoAgent.execute({
  userId: 'user_123',
  mission: 'Audit my website SEO'
});
```
