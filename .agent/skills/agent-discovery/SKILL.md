---
name: Agent Discovery
description: Structured repository scanning and agent evaluation skill for discovering agents from the AI ecosystem
---

# Agent Discovery Skill

The **Agent Discovery** skill enables structured scanning of agent repositories, marketplaces, and research platforms to discover new AI agents for potential integration into G-Pilot.

## Overview

This skill follows the **Action-Ledger-Result** pattern and integrates with:
- GitHub API (repository scanning)
- HuggingFace API (model discovery)
- AI-powered analysis for other sources (LangChain Hub, CrewAI, etc.)

## Bound Functions

### `agent_discovery`
**Primary discovery function** - Scans multiple intelligence sources for agents.

```typescript
agent_discovery(userId, query, options) → DiscoveryResult
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | User ID for billing and auditing |
| `query` | string | Search query |
| `options.sources` | string[] | Sources to scan (defaults to top 3) |
| `options.limit` | number | Max results per source |
| `options.focusAreas` | string[] | Capability areas to prioritize |
| `options.minCompatibility` | number | Minimum compatibility score (0-1) |

### `check_compatibility`
**Compatibility assessment** - Deep analysis of a single agent dossier.

```typescript
check_compatibility(userId, dossier) → CompatibilityCheckResult
```

## Intelligence Sources

| Source | API Type | Capabilities |
|--------|----------|--------------|
| `github` | REST API | Repository metadata, stars, license |
| `huggingface` | REST API | Model info, downloads, pipeline tags |
| `langchain_hub` | AI-scanned | Prompts, chains, agent templates |
| `crewai_flows` | AI-scanned | Multi-agent workflows |
| `arxiv` | AI-scanned | Research papers, techniques |
| `gpt_store` | AI-scanned | Custom GPT agents |
| `vertex_ai` | AI-scanned | Enterprise agent solutions |
| `aws_bedrock` | AI-scanned | Foundation model agents |
| `azure_ai` | AI-scanned | Cognitive service agents |

## Output Schemas

### AgentDossier
```json
{
  "agentName": "example-agent",
  "source": "github",
  "sourceUrl": "https://github.com/example/agent",
  "description": "What this agent does",
  "compatibilityScore": 0.85,
  "securityRating": "A",
  "uniqueCapabilities": ["capability1", "capability2"],
  "requiredDependencies": ["node", "typescript"],
  "integrationEstimate": "1-2 days",
  "fuelCostEstimate": "50-100 PTS",
  "lastUpdated": "2026-01-19T00:00:00Z",
  "stars": 1234,
  "maintainer": "example-org",
  "license": "MIT"
}
```

### DiscoveryResult
```json
{
  "success": true,
  "query": "marketing automation agent",
  "sourcesScanned": ["github", "huggingface", "langchain_hub"],
  "dossiers": [...],
  "duration": 2500
}
```

### CompatibilityCheckResult
```json
{
  "success": true,
  "agent": "example-agent",
  "score": 0.8,
  "checks": [
    { "name": "Language Compatibility", "passed": true },
    { "name": "License Check", "passed": true },
    { "name": "Security Rating", "passed": true }
  ],
  "recommendation": "integrate"
}
```

## Usage Example

```typescript
import { agent_discovery, check_compatibility } from '@/tools/agentDiscoverySkill';

// Discover agents for a specific capability
const result = await agent_discovery(
  'user_123',
  'multi-agent orchestration',
  {
    sources: ['github', 'langchain_hub'],
    limit: 10,
    focusAreas: ['automation', 'workflow'],
    minCompatibility: 0.7
  }
);

// Deep check a specific candidate
for (const dossier of result.dossiers.slice(0, 3)) {
  const check = await check_compatibility('user_123', dossier);
  if (check.recommendation === 'integrate') {
    console.log(`Recommended: ${dossier.agentName}`);
  }
}
```

## Integration with Agent Scout

This skill is the primary tool bound to the **Agent Scout** agent:

```
Agent Scout
    ├── agent_discovery (primary)
    ├── check_compatibility
    ├── web_intel
    ├── structured_scraper
    └── deep_lookup
```

## Security Ratings

| Rating | Description | Criteria |
|--------|-------------|----------|
| **A** | Trusted | Popular, well-maintained, permissive license |
| **B** | Safe | Known maintainer, permissive license |
| **C** | Review | Limited info, needs manual review |
| **D** | Caution | Unknown maintainer, restrictive license |
| **F** | Reject | Security concerns, deprecated |

## Billing

| Operation | Fuel Cost |
|-----------|-----------|
| Quick Scan (3 sources) | 25 PTS |
| Deep Scan (all sources) | 100 PTS |
| Individual Compatibility Check | 10 PTS |
