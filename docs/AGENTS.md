# G-Pilot Agent Documentation

> **Version**: 1.0.0
> **Last Updated**: 01/02/2026
> **Locale**: en-AU (DD/MM/YYYY, AUD, AEST/AEDT)

This document provides comprehensive documentation for all G-Pilot agents, their capabilities, and usage patterns.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Base Agent Interface](#base-agent-interface)
3. [Agent Lifecycle](#agent-lifecycle)
4. [Agent Registry](#agent-registry)
5. [Core Agents](#core-agents)
6. [Specialist Agents](#specialist-agents)
7. [Creating Custom Agents](#creating-custom-agents)
8. [Token Tracking](#token-tracking)

---

## Architecture Overview

G-Pilot uses a hierarchical multi-agent architecture where specialised agents collaborate under orchestration to complete complex tasks.

```
┌─────────────────────────────────────────────────────────────────┐
│                      MISSION OVERSEER                           │
│                 (High-level orchestration)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Core Agents  │   │  Specialist   │   │   Utility     │
│               │   │    Agents     │   │    Agents     │
│ - Genesis     │   │ - Frontend    │   │ - Browser     │
│ - Content     │   │ - Backend     │   │ - Scraper     │
│ - Marketing   │   │ - Database    │   │ - Collector   │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Hierarchy** | Clear chain of command with orchestration at top |
| **Specialisation** | Each agent has focused expertise and capabilities |
| **Isolation** | Agents operate in isolated contexts to maximise focus |
| **Verification** | Every execution is verified before considered complete |
| **Token Economy** | Agents track token usage for cost telemetry |

---

## Base Agent Interface

All G-Pilot agents implement the `IGPilotAgent` interface:

```typescript
interface IGPilotAgent {
    readonly name: string;           // Unique agent identifier
    readonly description: string;    // Human-readable description
    readonly capabilities: string[]; // List of capabilities
    readonly requiredSkills: string[]; // Skills this agent needs
    mode: AgentMode;                 // Current operating mode

    plan(context: AgentContext): Promise<AgentPlan>;
    execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult>;
    verify(result: AgentResult, context: AgentContext): Promise<VerificationReport>;
}
```

### Agent Modes

| Mode | Purpose |
|------|---------|
| `PLANNING` | Analyse mission and create execution plan |
| `EXECUTION` | Execute the planned steps |
| `VERIFICATION` | Validate results and ensure objectives are met |

### Core Types

```typescript
interface AgentContext {
    userId: string;
    mission: string;
    locale?: string;
    previousResults?: AgentResult[];
    config?: Record<string, unknown>;
    onStream?: (chunk: string) => void;
}

interface AgentPlan {
    steps: PlanStep[];
    estimatedCost: number;
    requiredSkills: string[];
    reasoning: string;
}

interface AgentResult {
    success: boolean;
    data?: unknown;
    error?: string;
    cost: number;
    duration: number;
    artifacts?: AgentArtifact[];
    confidence?: number;
    uncertainties?: string[];
    tokensUsed?: TokenUsage;
}

interface VerificationReport {
    passed: boolean;
    checks: VerificationCheck[];
    recommendations?: string[];
}
```

---

## Agent Lifecycle

Every agent execution follows a three-phase lifecycle:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   PLANNING  │────▶│  EXECUTION  │────▶│ VERIFICATION │
│             │     │             │     │              │
│ Analyse     │     │ Execute     │     │ Validate     │
│ mission,    │     │ steps,      │     │ results,     │
│ create plan │     │ produce     │     │ check        │
│             │     │ artifacts   │     │ quality      │
└─────────────┘     └─────────────┘     └──────────────┘
```

### Example Usage

```typescript
import { AgentRegistry, initializeAgents } from '@/agents';

// Initialise agent fleet
await initializeAgents();

// Get an agent
const agent = AgentRegistry.get('frontend-specialist');

// Define context
const context = {
    userId: 'user_123',
    mission: 'Create a dashboard page with data visualisation'
};

// Execute lifecycle
const plan = await agent.plan(context);
const result = await agent.execute(plan, context);
const verification = await agent.verify(result, context);

if (verification.passed) {
    console.log('Task completed successfully!');
}
```

---

## Agent Registry

The `AgentRegistry` provides centralised discovery and management of all agents.

### Key Methods

```typescript
// Register an agent class for lazy instantiation
AgentRegistry.registerClass('agent-name', AgentClass);

// Get an agent by name
const agent = AgentRegistry.get('agent-name');

// List all available agents
const agents = AgentRegistry.getAvailableAgents();

// Find agents by capability
const agents = AgentRegistry.findByCapability('react_components');

// Find best agent for required skills
const agent = AgentRegistry.findBestAgent(['typescript', 'testing']);

// Check if agent exists
const exists = AgentRegistry.has('agent-name');
```

---

## Core Agents

### Mission Overseer

**Name**: `mission-overseer`
**Purpose**: High-level task orchestration and delegation

| Property | Value |
|----------|-------|
| Capabilities | `task_decomposition`, `agent_coordination`, `progress_tracking` |
| Required Skills | `orchestration`, `planning`, `delegation` |

Coordinates multiple agents to complete complex missions by decomposing tasks and delegating to specialists.

---

### Genesis Architect

**Name**: `genesis-architect`
**Purpose**: Project initialisation and architecture design

| Property | Value |
|----------|-------|
| Capabilities | `project_setup`, `architecture_design`, `tech_stack_selection` |
| Required Skills | `architecture`, `system_design`, `best_practices` |

Designs system architecture and initialises new projects with proper structure.

---

### Content Orchestrator

**Name**: `content-orchestrator`
**Purpose**: Content creation and management

| Property | Value |
|----------|-------|
| Capabilities | `content_planning`, `content_generation`, `content_optimization` |
| Required Skills | `writing`, `seo`, `content_strategy` |

Orchestrates content creation workflows across multiple channels.

---

### Marketing Strategist

**Name**: `marketing-strategist`
**Purpose**: Marketing strategy and campaign planning

| Property | Value |
|----------|-------|
| Capabilities | `market_analysis`, `campaign_planning`, `audience_targeting` |
| Required Skills | `marketing`, `analytics`, `strategy` |

Develops marketing strategies and campaign plans based on market analysis.

---

### SEO Analyst

**Name**: `seo-analyst`
**Purpose**: Search engine optimisation analysis

| Property | Value |
|----------|-------|
| Capabilities | `keyword_research`, `site_audit`, `competitor_analysis` |
| Required Skills | `seo`, `analytics`, `content_optimization` |

Analyses SEO performance and provides optimisation recommendations.

---

### Social Commander

**Name**: `social-commander`
**Purpose**: Social media management and strategy

| Property | Value |
|----------|-------|
| Capabilities | `social_planning`, `content_scheduling`, `engagement_tracking` |
| Required Skills | `social_media`, `content_creation`, `community_management` |

Manages social media presence across multiple platforms.

---

### Independent Verifier

**Name**: `independent-verifier`
**Purpose**: Independent quality verification

| Property | Value |
|----------|-------|
| Capabilities | `output_verification`, `quality_assurance`, `compliance_checking` |
| Required Skills | `verification`, `testing`, `quality_control` |

Provides independent verification of agent outputs to ensure quality.

---

## Specialist Agents

### Frontend Specialist

**Name**: `frontend-specialist`
**Purpose**: React/Next.js frontend development

| Property | Value |
|----------|-------|
| Capabilities | `react_components`, `nextjs_routing`, `state_management`, `css_styling`, `typescript`, `accessibility`, `performance_optimization` |
| Required Skills | `react`, `nextjs`, `typescript`, `tailwind`, `testing` |

Expert in React 19, Next.js 15, TypeScript, and modern frontend frameworks. Handles component architecture, state management, and UI implementation.

---

### Backend Specialist

**Name**: `backend-specialist`
**Purpose**: Node.js/API backend development

| Property | Value |
|----------|-------|
| Capabilities | `api_design`, `route_handlers`, `middleware`, `authentication`, `rate_limiting`, `error_handling` |
| Required Skills | `nodejs`, `typescript`, `api_design`, `security`, `databases` |

Expert in Node.js, API design, and backend architecture. Handles route handlers, middleware, and server-side logic.

---

### Database Specialist

**Name**: `database-specialist`
**Purpose**: PostgreSQL/Prisma database management

| Property | Value |
|----------|-------|
| Capabilities | `schema_design`, `migrations`, `query_optimization`, `indexing`, `data_modeling` |
| Required Skills | `postgresql`, `prisma`, `sql`, `data_modeling`, `performance` |

Expert in PostgreSQL, Prisma ORM, and database optimisation. Handles schema design, migrations, and query performance.

---

### Test Engineer

**Name**: `test-engineer`
**Purpose**: Testing and quality assurance

| Property | Value |
|----------|-------|
| Capabilities | `unit_testing`, `integration_testing`, `e2e_testing`, `test_coverage`, `mocking` |
| Required Skills | `vitest`, `playwright`, `testing_library`, `tdd`, `mocking` |

Expert in testing strategies and implementation. Creates comprehensive test suites for quality assurance.

---

### Security Auditor

**Name**: `security-auditor`
**Purpose**: Security analysis and compliance

| Property | Value |
|----------|-------|
| Capabilities | `vulnerability_scanning`, `owasp_compliance`, `penetration_testing`, `code_review`, `security_headers` |
| Required Skills | `security`, `owasp`, `cryptography`, `authentication`, `authorization` |

Expert in application security and OWASP compliance. Identifies vulnerabilities and recommends mitigations.

---

### Performance Optimiser

**Name**: `performance-optimizer`
**Purpose**: Performance analysis and optimisation

| Property | Value |
|----------|-------|
| Capabilities | `bundle_analysis`, `core_web_vitals`, `cache_strategy`, `lazy_loading`, `profiling` |
| Required Skills | `profiling`, `web_vitals`, `caching`, `optimization`, `monitoring` |

Expert in Core Web Vitals and performance optimisation. Analyses bundle size, render performance, and caching strategies.

---

### Deploy Guardian

**Name**: `deploy-guardian`
**Purpose**: CI/CD and deployment management

| Property | Value |
|----------|-------|
| Capabilities | `cicd_pipelines`, `deployment_strategies`, `zero_downtime_deploy`, `rollback`, `monitoring` |
| Required Skills | `github_actions`, `vercel`, `docker`, `kubernetes`, `monitoring` |

Expert in CI/CD pipelines and deployment automation. Manages zero-downtime deployments and rollback strategies.

---

### Docs Writer

**Name**: `docs-writer`
**Purpose**: Technical documentation

| Property | Value |
|----------|-------|
| Capabilities | `readme_generation`, `api_documentation`, `jsdoc_tsdoc`, `tutorials`, `changelog` |
| Required Skills | `technical_writing`, `markdown`, `openapi`, `documentation` |

Expert in technical writing and documentation. Creates READMEs, API docs, and inline code documentation.

---

### Code Reviewer

**Name**: `code-reviewer`
**Purpose**: Code review and best practices

| Property | Value |
|----------|-------|
| Capabilities | `pr_review`, `best_practices`, `security_review`, `performance_review`, `style_guide` |
| Required Skills | `code_review`, `design_patterns`, `clean_code`, `security` |

Expert in code review and best practices enforcement. Reviews pull requests for quality, security, and performance.

---

### Refactor Specialist

**Name**: `refactor-specialist`
**Purpose**: Code refactoring and modernisation

| Property | Value |
|----------|-------|
| Capabilities | `code_cleanup`, `pattern_migration`, `reduce_complexity`, `dead_code_removal`, `modernization` |
| Required Skills | `refactoring`, `design_patterns`, `clean_code`, `testing` |

Expert in code refactoring and technical debt reduction. Improves code quality while preserving behaviour.

---

### Bug Hunter

**Name**: `bug-hunter`
**Purpose**: Debugging and issue resolution

| Property | Value |
|----------|-------|
| Capabilities | `root_cause_analysis`, `bug_reproduction`, `fix_implementation`, `regression_testing` |
| Required Skills | `debugging`, `testing`, `logging`, `profiling` |

Expert in debugging and root cause analysis. Identifies, reproduces, and fixes bugs systematically.

---

## Utility Agents

### Browser Agent

**Name**: `browser-agent`
**Purpose**: Browser automation

| Property | Value |
|----------|-------|
| Capabilities | `page_navigation`, `element_interaction`, `screenshot`, `form_filling` |
| Required Skills | `playwright`, `dom`, `automation` |

Automates browser interactions using Playwright.

---

### Web Scraper

**Name**: `web-scraper`
**Purpose**: Web content extraction

| Property | Value |
|----------|-------|
| Capabilities | `content_extraction`, `structured_data`, `pagination`, `rate_limiting` |
| Required Skills | `scraping`, `html_parsing`, `data_extraction` |

Extracts structured data from web pages.

---

### Data Collector

**Name**: `data-collector`
**Purpose**: Data aggregation and processing

| Property | Value |
|----------|-------|
| Capabilities | `data_collection`, `aggregation`, `transformation`, `validation` |
| Required Skills | `data_processing`, `apis`, `validation` |

Collects and aggregates data from multiple sources.

---

### UI Auditor

**Name**: `ui-auditor`
**Purpose**: UI/UX quality analysis

| Property | Value |
|----------|-------|
| Capabilities | `visual_audit`, `accessibility_check`, `responsive_test`, `design_compliance` |
| Required Skills | `ui_design`, `accessibility`, `responsive_design` |

Audits user interfaces for quality, accessibility, and design compliance.

---

### Geo Marketing Agent

**Name**: `geo-marketing` / `geo-marketing-agent`
**Purpose**: Location-based marketing

| Property | Value |
|----------|-------|
| Capabilities | `local_seo`, `geo_targeting`, `location_analytics` |
| Required Skills | `local_marketing`, `geo_targeting`, `analytics` |

Handles location-based marketing and local SEO strategies.

---

### Agent Scout

**Name**: `agent-scout`
**Purpose**: Agent discovery and capability matching

| Property | Value |
|----------|-------|
| Capabilities | `agent_discovery`, `capability_matching`, `skill_assessment` |
| Required Skills | `agent_management`, `matching_algorithms` |

Discovers and matches agents to tasks based on capabilities.

---

## Creating Custom Agents

To create a custom agent, extend the `BaseAgent` class:

```typescript
import { BaseAgent, AgentContext, AgentPlan, AgentResult, VerificationReport } from '@/agents/base';

export class MyCustomAgent extends BaseAgent {
    readonly name = 'my-custom-agent';
    readonly description = 'Custom agent for specific tasks';
    readonly capabilities = ['capability_one', 'capability_two'];
    readonly requiredSkills = ['skill_one', 'skill_two'];

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('Planning...');

        return {
            steps: [
                {
                    id: 'step_one',
                    action: 'First action',
                    tool: 'tool_name',
                    payload: {}
                }
            ],
            estimatedCost: 10,
            requiredSkills: this.requiredSkills,
            reasoning: 'Why this plan makes sense'
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('Executing...');

        // Execute plan steps
        const artifacts = [];

        return {
            success: true,
            data: { message: 'Done' },
            cost: plan.estimatedCost,
            duration: Date.now(),
            artifacts
        };
    }

    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('Verifying...');

        return {
            passed: result.success,
            checks: [
                { name: 'Check One', passed: true, message: 'Passed' }
            ],
            recommendations: ['Consider adding more tests']
        };
    }
}
```

### Registering Custom Agents

Add your agent to the registry in `src/agents/registry.ts`:

```typescript
const { MyCustomAgent } = await import('./my-custom-agent');
AgentRegistry.registerClass('my-custom-agent', MyCustomAgent);
```

---

## Token Tracking

Agents track token usage for cost telemetry using the `TokenTracker` class:

```typescript
import { TokenTracker } from '@/lib/telemetry/token-tracker';

const tokenTracker = new TokenTracker();

// Record Gemini API usage
const result = await model.generateContent(prompt);
tokenTracker.recordGemini(result, 'gemini-3-flash-preview');

// Get usage summary
const usage = tokenTracker.getUsage();
// { promptTokens: 100, completionTokens: 200, totalTokens: 300, model: 'gemini-3-flash-preview' }

// Estimate cost
const cost = tokenTracker.estimateCost();
```

### Cost Estimation

Token costs are estimated based on model pricing:

| Model | Input | Output |
|-------|-------|--------|
| gemini-3-flash-preview | $0.075/1M tokens | $0.30/1M tokens |
| gemini-2.0-flash | $0.10/1M tokens | $0.40/1M tokens |

---

## Related Documentation

- [Multi-Agent Architecture](./MULTI_AGENT_ARCHITECTURE.md) - Hierarchical workflow specification
- [Agent PRD System](./AGENT_PRD_SYSTEM.md) - Product requirements for agents
- [Agentic Layer Implementation](./AGENTIC_LAYER_IMPLEMENTATION.md) - Implementation details

---

**Document maintained by G-Pilot Team**
