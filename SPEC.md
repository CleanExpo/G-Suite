# G-PILOT SPECIFICATION v8.2
**"Sovereign Control" Release**

> Autonomous AI orchestration platform for elite founders, leveraging Google Cloud's most advanced reasoning models in a secure, military-grade environment.

**Version**: 8.2.0
**Last Updated**: 2026-01-27
**Status**: Production Ready

---

## TABLE OF CONTENTS
- [PART 1: PROJECT OVERVIEW](#part-1-project-overview)
- [PART 2: SYSTEM ARCHITECTURE](#part-2-system-architecture)
- [PART 3: AGENT FLEET SPECIFICATION](#part-3-agent-fleet-specification)
- [PART 4: API SPECIFICATIONS](#part-4-api-specifications)
- [PART 5: DATABASE SCHEMA](#part-5-database-schema)
- [PART 6: EXECUTION FLOW](#part-6-execution-flow)
- [PART 7: SKILL & TOOL ECOSYSTEM](#part-7-skill--tool-ecosystem)
- [PART 8: USER INTERFACE](#part-8-user-interface)
- [PART 9: PERSISTENCE & AUDIT TRAIL](#part-9-persistence--audit-trail)
- [PART 10: TESTING REQUIREMENTS](#part-10-testing-requirements)
- [PART 11: SECURITY & COMPLIANCE](#part-11-security--compliance)
- [PART 12: BILLING & COST MANAGEMENT](#part-12-billing--cost-management)
- [PART 13: CONFIGURATION & ENVIRONMENT](#part-13-configuration--environment)
- [PART 14: MONITORING & OBSERVABILITY](#part-14-monitoring--observability)
- [PART 15: ROADMAP & FUTURE PHASES](#part-15-roadmap--future-phases)
- [APPENDICES](#appendices)

---

## PART 1: PROJECT OVERVIEW

### 1.1 Mission Statement
To provide an autonomous AI orchestration layer for elite founders, leveraging Google Cloud's most advanced reasoning models (Gemini Pro, VEO, Imagen) in a secure, military-grade environment.

### 1.2 Project Vision & Goals
**Vision**: Democratize access to advanced AI orchestration while maintaining enterprise-grade security and autonomous execution capabilities.

**Core Goals**:
- **Autonomous Execution**: "Green Light" mode as standard—proceed from research to implementation silently
- **Visual Authority**: Maintain v8.1-Refined Standard with 3D Glass Medallions, 8K Cinematic Imagery, Linear-Style Minimalist UI
- **Sovereign Security**: All client secrets remain in The Vault; logic is ephemeral, security is absolute
- **Recursive Efficiency**: Leverage local skills and dynamic skill generation for self-evolving core

### 1.3 Target Users
- **Elite Founders**: Entrepreneurs building SaaS products who need AI-powered automation
- **Marketing Teams**: Content creators requiring multi-channel orchestration
- **E-commerce Operators**: Shopify store owners needing intelligent inventory and marketing automation
- **SEO Professionals**: SEO analysts requiring deep research and content generation capabilities

### 1.4 Core Value Propositions
1. **Multi-Agent Orchestration**: 14+ specialized agents working in harmony
2. **Independent Verification**: Quality gates prevent self-validation bias
3. **Real-Time Streaming**: Live mission monitoring with "The Matrix View"
4. **Persistent Audit Trails**: Every action logged with mission context
5. **Sovereign Security**: Military-grade encryption with The Vault system
6. **Cost Transparency**: Fuel-based credit system with granular tracking

### 1.5 Version History
- **v8.2 "Sovereign Control"** (2026-01-27): Unified execution protocol, mission persistence, independent verification foundation
- **v8.1 "Refined Standard"**: Design system overhaul, visual authority established
- **v8.0 "Genesis"**: Initial multi-agent orchestration framework
- **v7.x**: Legacy LangGraph implementation (deprecated)

---

## PART 2: SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          G-PILOT v8.2 ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌────────────────────────────────────────────┐
│   USER UI    │────────▶│         NEXT.JS 16 (Turbopack)             │
│  Dashboard   │         │                                            │
│  Mission     │         │  ┌──────────────────────────────────────┐ │
│  Control     │◀────────│  │       API ROUTES                      │ │
└──────────────┘         │  │  • GET/POST /api/agents               │ │
                         │  │  • GET /api/health                    │ │
      ▲                  │  │  • POST /api/webhooks/stripe          │ │
      │                  │  └──────────────┬───────────────────────┘ │
      │ Streaming        │                 │                          │
      │ (Custom)         └─────────────────┼──────────────────────────┘
      │                                    ▼
      │                  ┌────────────────────────────────────────────┐
      │                  │      MISSION OVERSEER (Orchestrator)       │
      └──────────────────│                                            │
                         │  ┌────────────────────────────────────┐   │
                         │  │  ANALYZE → PLANNING → EXECUTION    │   │
                         │  │       → VERIFICATION → RETRY       │   │
                         │  └────────────────────────────────────┘   │
                         └──────────────┬──────────────────────────┬──┘
                                        │                          │
                         ┌──────────────▼─────────┐   ┌───────────▼──────┐
                         │   AGENT REGISTRY       │   │  INDEPENDENT     │
                         │  (14 Specialized       │   │   VERIFIER       │
                         │   Agents)              │   │  (Quality Gates) │
                         └──────────┬─────────────┘   └──────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
       ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
       │  MARKETING     │  │   SEO          │  │   SOCIAL       │
       │  STRATEGIST    │  │   ANALYST      │  │   COMMANDER    │
       └────────────────┘  └────────────────┘  └────────────────┘
                ▼                   ▼                   ▼
       ┌────────────────────────────────────────────────────────┐
       │            SKILL & TOOL ECOSYSTEM                       │
       │  • Gemini 3 Flash        • Deep Research               │
       │  • VEO 3.1 Video         • Document AI                 │
       │  • Web Unlocker          • SERP Collector              │
       │  • Puppeteer             • Imagen 3                    │
       └────────────────┬───────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
┌────────────────┐  ┌──────────┐  ┌───────────────┐
│   POSTGRESQL   │  │  STRIPE  │  │  FIREBASE     │
│   (Prisma)     │  │ BILLING  │  │  ADMIN SDK    │
│   • Mission    │  │          │  │  (Vault Keys) │
│   • Wallet     │  │          │  │               │
│   • Profile    │  │          │  │               │
└────────────────┘  └──────────┘  └───────────────┘
```

### 2.2 Unified Execution Protocol ("The Loop")

The v8.2 "Unified Execution Protocol" ensures all agent invocations flow through a single, auditable path:

```
USER REQUEST
     ↓
ARCHITECT NODE (LangGraph)
     ↓ (Generate SPEC)
BILLING NODE
     ↓ (Cost Validation)
EXECUTOR NODE
     ↓
MISSION OVERSEER
     ↓
[ANALYZE → PLANNING → EXECUTION → VERIFICATION → RETRY/FINALIZE]
     ↓
RESPONSE (Streaming/JSON)
```

**Key Principles**:
1. **Single Entry Point**: All requests funnel through Mission Overseer
2. **Quality Gates**: Independent verification prevents self-validation
3. **State Persistence**: Every phase persisted to database
4. **Streaming Transparency**: Real-time logs via `onStream` callback
5. **Retry Logic**: Up to 3 retry cycles with learning adaptation

### 2.3 Technology Stack

#### **Frontend**
- **Framework**: Next.js 16.1.3 (App Router, Turbopack)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.18
- **Animation**: Framer Motion 12.26.2
- **Icons**: Lucide React 0.562.0
- **Theme**: next-themes 0.4.6

#### **Backend**
- **Runtime**: Node.js (Latest LTS)
- **API**: Next.js API Routes + Server Actions
- **Orchestration**: LangGraph 1.1.0, LangChain Core 1.1.15
- **LLM**: Google Generative AI 0.24.1 (Gemini 2.0 Flash)
- **Database**: PostgreSQL via Prisma 6.4.1
- **Queue**: BullMQ 5.66.5
- **Validation**: Zod 4.3.5

#### **Infrastructure**
- **Hosting**: Google Cloud Run
- **Database**: Cloud SQL (PostgreSQL)
- **Storage**: Firebase Admin 13.6.0
- **CDN**: Vercel Edge Network (if deployed on Vercel)

#### **Authentication & Billing**
- **Auth**: Supabase Auth 2.90.1 + Clerk 6.36.8 (hybrid)
- **Payments**: Stripe 20.2.0 + Stripe.js 8.6.1

#### **Testing**
- **Unit/Integration**: Vitest 4.0.17
- **E2E**: Playwright 1.57.0
- **Mocking**: Happy-DOM 20.3.3
- **Coverage**: @vitest/coverage-v8 4.0.17

#### **Developer Tools**
- **Linter**: GTS 7.0.0 (Google TypeScript Style)
- **Browser Automation**: Puppeteer 24.35.0
- **Date Handling**: date-fns 4.1.0

### 2.4 Infrastructure & Deployment

**Development**:
```bash
npm run dev          # Start dev server on port 4000
npm run test:watch   # Live unit testing
npm run test:e2e:ui  # Playwright UI mode
```

**Production Build**:
```bash
npm run build        # Next.js production build
npm run start        # Start production server
```

**Deployment Targets**:
- **Google Cloud Run**: Primary production environment
- **Vercel**: Alternative deployment (with Edge Functions)
- **Docker**: Container-ready (Next.js standalone mode)

**Environment Requirements**:
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- Redis (for BullMQ)
- Firebase project (for Vault encryption keys)

### 2.5 Security Architecture

**Defense Layers**:
1. **The Vault**: AES-256-GCM encrypted API keys in Firebase Firestore
2. **Clerk/Supabase Auth**: OAuth + Email/Password with MFA support
3. **Prisma ORM**: SQL injection prevention via parameterized queries
4. **HTTPS Only**: TLS 1.3 for all production traffic
5. **CORS**: Strict origin policies
6. **CSP**: Content Security Policy headers
7. **Rate Limiting**: Per-user request throttling

**Encryption Standards**:
- **At Rest**: AES-256-GCM for sensitive data
- **In Transit**: TLS 1.3
- **Keys**: Firebase Admin SDK for key management
- **Sessions**: HTTPOnly, Secure, SameSite cookies

### 2.6 Data Flow & State Management

**Client → Server**:
1. User interacts with Dashboard UI (React)
2. Client calls API route (`POST /api/agents`)
3. API initializes AgentRegistry
4. Delegates to Mission Overseer
5. Overseer plans, executes, verifies
6. Streams logs back to client via `onStream`
7. Persists results to PostgreSQL via PrismaMissionAdapter

**State Management**:
- **Client State**: React hooks (useState, useEffect)
- **Server State**: Prisma Client (database queries)
- **Mission State**: In-memory during execution, persisted on completion
- **LangGraph State**: Stateful workflow execution with checkpoints

---

## PART 3: AGENT FLEET SPECIFICATION

### 3.1 Agent Orchestration Model

G-Pilot uses a **hierarchical orchestration** model:
- **Mission Overseer**: Supreme orchestrator, coordinates all missions
- **Independent Verifier**: Quality authority, validates all outputs
- **Specialized Agents**: Domain experts (marketing, SEO, content, etc.)
- **Genesis Architect**: Meta-agent, generates new agents dynamically

**Orchestration Principles**:
1. **Directed Mode**: User specifies agents explicitly via config
2. **Auto Mode**: Overseer selects best agent based on capabilities
3. **Parallel Mode** (Phase 9.3): Multiple agents execute concurrently
4. **Quality Gates**: All outputs verified by Independent Verifier before finalization

### 3.2 Agent Lifecycle (Planning → Execution → Verification)

Every agent mission follows this lifecycle:

```
1. PLANNING PHASE
   ↓
   Agent.plan(context) → returns PlanStep[]
   - Analyze mission requirements
   - Identify required skills
   - Estimate cost
   - Define completion criteria

2. EXECUTION PHASE
   ↓
   Agent.execute(plan, context) → returns TaskOutput
   - Bind skills to agent
   - Execute each plan step
   - Collect results and artifacts
   - Stream logs via context.onStream()

3. VERIFICATION PHASE
   ↓
   IndependentVerifier.verify(output) → returns VerificationReport
   - Validate against completion criteria
   - Check file existence, code quality, test results
   - Visual verification (via UIAuditor if needed)
   - Return pass/fail with detailed checks

4. RETRY OR FINALIZE
   ↓
   IF verification fails:
      - Retry with enhanced context (max 3 attempts)
      - Log failure reasoning
   ELSE:
      - Persist to database (Mission table)
      - Return success response
```

### 3.3 Agent Capabilities Matrix

| Agent Name | Identifier | Domain | Primary Capabilities | Required Skills | Status |
|------------|-----------|--------|---------------------|-----------------|--------|
| **Mission Overseer** | `mission-overseer` | Orchestration | mission_analysis, agent_coordination, quality_assurance, iterative_refinement, learning_adaptation | `[]` | ✅ Active |
| **Independent Verifier** | `independent-verifier` | Quality Control | file_verification, code_verification, test_verification, criteria_validation, visual_verification | `fs_read`, `lint`, `test_runner` | ✅ Active |
| **Genesis Architect** | `genesis-architect` | Meta-Evolution | meta_planning, skill_generation, agent_synthesis, pattern_learning, recursive_intelligence | `code_gen`, `meta_analysis` | ✅ Active |
| **Marketing Strategist** | `marketing-strategist` | Campaign Strategy | deep_research, veo_31_generate, campaign_planning, audience_analysis | `deep_research`, `veo_31_generate` | ✅ Active |
| **SEO Analyst** | `seo-analyst` | Search Optimization | deep_research, document_ai_extract, keyword_analysis, technical_seo, content_audit | `deep_research`, `document_ai_extract` | ✅ Active |
| **Social Commander** | `social-commander` | Social Distribution | gemini_3_flash, veo_31_generate, content_scheduling, platform_optimization | `gemini_3_flash`, `veo_31_generate` | ✅ Active |
| **Content Orchestrator** | `content-orchestrator` | Content Creation | deep_research, veo_31_generate, content_synthesis, multi_format_output | `deep_research`, `veo_31_generate` | ✅ Active |
| **UI Auditor** | `ui-auditor` | Visual QA | vision_analyze, screenshot_capture, code_edit, accessibility_check, visual_regression | `puppeteer`, `vision_api` | ✅ Active |
| **Browser Agent** | `browser-agent` | Web Automation | puppeteer_navigate, screenshot, extract, form_fill, navigation | `puppeteer` | ✅ Active |
| **Web Scraper** | `web-scraper` | Data Extraction | web_unlocker, web_crawler, structured_scraper, anti_detection | `web_unlocker`, `structured_scraper` | ✅ Active |
| **Data Collector** | `data-collector` | Intelligence | serp_collector, data_archive, deep_lookup, entity_resolution | `serp_collector`, `data_archive` | ✅ Active |
| **GEO Marketing** | `geo-marketing-agent` | Geo-Targeting | location_analysis, demographic_research, local_seo, geo_campaigns | `maps_api`, `census_data` | ✅ Active |
| **Agent Scout** | `agent-scout` | Discovery | agent_discovery, capability_matching, skill_search, registry_query | `[]` | ✅ Active |
| **NotebookLM** | `notebooklm-agent` | Research Synthesis | research_synthesis, document_analysis, knowledge_extraction | `notebooklm_api` | ✅ Active |

**Total Active Agents**: 14

### 3.4 Independent Verification Protocol

The Independent Verifier acts as the **sole verification authority**, preventing agents from "grading their own homework."

**Verification Types**:
1. **File Verification**: Checks file existence, size, format
2. **Code Verification**: Lints code, checks syntax, validates structure
3. **Test Verification**: Runs test suites, validates coverage
4. **Criteria Validation**: Matches output against completion criteria
5. **Visual Verification**: Uses UIAuditor for screenshot comparison

**Verification Flow**:
```typescript
interface VerificationReport {
  passed: boolean;
  checks: {
    criterion: string;
    passed: boolean;
    details: string;
  }[];
  summary: string;
}

// Example
const report = await verifier.verify({
  output: agentOutput,
  criteria: [
    'File src/components/Button.tsx exists',
    'Component passes TypeScript validation',
    'Unit tests have >80% coverage'
  ]
});

if (!report.passed) {
  // Trigger retry with enhanced context
  retry(agentOutput, report);
}
```

### 3.5 Agent Registry & Discovery

**AgentRegistry** (`src/agents/registry.ts`) provides centralized agent management:

```typescript
// Singleton pattern
export const AgentRegistry = new AgentRegistryClass();

// Methods
AgentRegistry.get(name: string): IGPilotAgent | undefined
AgentRegistry.getAvailableAgents(): string[]
AgentRegistry.findByCapability(capability: string): IGPilotAgent[]
AgentRegistry.findBestAgent(requiredSkills: string[]): IGPilotAgent | undefined
```

**Registration**:
- Lazy instantiation via `registerClass(name, AgentClass)`
- Direct instance registration via `register(agent)`
- Auto-initialization on module load via `initializeAgents()`

**Discovery**:
- By name: `AgentRegistry.get('seo-analyst')`
- By capability: `findByCapability('deep_research')`
- By skills: `findBestAgent(['gemini_3_flash', 'veo_31_generate'])`

### 3.6 Individual Agent Specifications

#### 3.6.1 Mission Overseer
**File**: `src/agents/mission-overseer.ts`
**Role**: Supreme orchestrator, coordinates all multi-agent missions
**Capabilities**:
- `mission_analysis`: Classifies complexity (SIMPLE, MODERATE, COMPLEX)
- `agent_coordination`: Routes work to specialized agents
- `quality_assurance`: Enforces 85% quality threshold
- `iterative_refinement`: Retry logic (max 3 cycles)
- `learning_adaptation`: Stores learnings for future missions

**Execution Phases**:
1. **ANALYZE**: Parse request, classify complexity, estimate costs
2. **PLANNING**: Select agents, define workflow, set checkpoints
3. **EXECUTION**: Coordinate agent execution, monitor progress
4. **VERIFICATION**: Independent audits via IndependentVerifier
5. **TESTING**: Simulate results before finalization
6. **RETRY**: Fix issues iteratively (max 3 attempts)
7. **FINALIZE**: Aggregate results, archive learnings

**Configuration**:
- Max Retry Cycles: 3
- Quality Threshold: 85% (0.85)
- Learning Enabled: true
- Fuel Budget Override: Commander Only

**Example Usage**:
```typescript
const overseer = AgentRegistry.get('mission-overseer');
const context: AgentContext = {
  userId: 'user-123',
  mission: 'Generate SEO-optimized blog post about AI trends',
  config: { explicitAgents: ['seo-analyst', 'content-orchestrator'] }
};

const plan = await overseer.plan(context);
const result = await overseer.execute(plan, context);
```

#### 3.6.2 Independent Verifier
**File**: `src/agents/independent-verifier.ts`
**Role**: Quality authority, validates all agent outputs
**Capabilities**:
- `file_verification`: Checks file existence, size, format
- `code_verification`: Lints code, validates TypeScript
- `test_verification`: Runs test suites, checks coverage
- `criteria_validation`: Matches against completion criteria
- `visual_verification`: Screenshot comparison via UIAuditor

**Verification Criteria Examples**:
```typescript
const criteria = [
  'File src/pages/landing.tsx exists',
  'Component passes ESLint validation',
  'Tests have >80% code coverage',
  'Visual regression: homepage matches baseline'
];
```

**Integration**:
```typescript
const verifier = AgentRegistry.get('independent-verifier');
const report = await verifier.verify({
  output: taskOutput,
  criteria: completionCriteria
});
```

#### 3.6.3 Genesis Architect
**File**: `src/agents/genesis-architect.ts`
**Role**: Meta-agent, generates new agents dynamically
**Capabilities**:
- `meta_planning`: Analyzes capability gaps
- `skill_generation`: Creates new skill modules
- `agent_synthesis`: Generates agent class code
- `pattern_learning`: Learns from existing agents
- `recursive_intelligence`: Self-improves agent fleet

**Use Case**: When no existing agent matches requirements, Genesis Architect generates a new specialized agent on-the-fly.

#### 3.6.4 Marketing Strategist
**File**: `src/agents/marketing-strategist.ts`
**Required Skills**: `deep_research`, `veo_31_generate`
**Capabilities**:
- Deep market research
- Campaign strategy formulation
- Audience persona generation
- VEO 3.1 video content creation

#### 3.6.5 SEO Analyst
**File**: `src/agents/seo-analyst.ts`
**Required Skills**: `deep_research`, `document_ai_extract`
**Capabilities**:
- Keyword research & analysis
- Technical SEO audits
- Content optimization
- Competitor analysis
- Document extraction for research

#### 3.6.6 Social Commander
**File**: `src/agents/social-commander.ts`
**Required Skills**: `gemini_3_flash`, `veo_31_generate`
**Capabilities**:
- Multi-platform social media content
- Video generation (VEO 3.1)
- Scheduling and distribution
- Platform optimization (X, LinkedIn, Instagram)

#### 3.6.7 Content Orchestrator
**File**: `src/agents/content-orchestrator.ts`
**Required Skills**: `deep_research`, `veo_31_generate`
**Capabilities**:
- Long-form content creation
- Multi-format output (blog, video, infographic)
- Research synthesis
- Brand voice adherence

#### 3.6.8 UI Auditor
**File**: `src/agents/ui-auditor.ts`
**Required Skills**: `puppeteer`, `vision_api`
**Capabilities**:
- Visual regression testing
- Accessibility audits (WCAG)
- Responsive design validation
- Screenshot comparison

#### 3.6.9 Browser Agent
**File**: `src/agents/browser-agent.ts`
**Required Skills**: `puppeteer`
**Capabilities**:
- Web automation
- Form filling
- Navigation and extraction
- Screenshot capture

#### 3.6.10 Web Scraper
**File**: `src/agents/web-scraper.ts`
**Required Skills**: `web_unlocker`, `structured_scraper`
**Capabilities**:
- CAPTCHA bypass (via Web Unlocker)
- Structured data extraction
- Anti-detection techniques
- Rate limiting compliance

#### 3.6.11 Data Collector
**File**: `src/agents/data-collector.ts`
**Required Skills**: `serp_collector`, `data_archive`
**Capabilities**:
- SERP data collection
- Entity resolution
- Data archival
- Deep web lookup

#### 3.6.12 GEO Marketing Agent
**File**: `src/agents/geo-marketing-agent.ts`
**Required Skills**: `maps_api`, `census_data`
**Capabilities**:
- Location-based targeting
- Demographic research
- Local SEO optimization
- Geo-campaigns

#### 3.6.13 Agent Scout
**File**: `src/agents/agent-scout.ts`
**Capabilities**:
- Discover available agents
- Match capabilities to mission requirements
- Recommend agent combinations
- Registry query optimization

#### 3.6.14 NotebookLM Agent
**Required Skills**: `notebooklm_api`
**Capabilities**:
- Research synthesis from multiple sources
- Document analysis and summarization
- Knowledge extraction

---

## PART 4: API SPECIFICATIONS

### 4.1 REST API Endpoints

#### 4.1.1 GET /api/agents
**Description**: List all available agents with capabilities

**Request**:
```http
GET /api/agents HTTP/1.1
Host: gpilot.com
Authorization: Bearer <token>
```

**Response**:
```json
{
  "agents": [
    {
      "name": "mission-overseer",
      "capabilities": [
        "mission_analysis",
        "agent_coordination",
        "quality_assurance"
      ],
      "requiredSkills": []
    },
    {
      "name": "seo-analyst",
      "capabilities": [
        "deep_research",
        "document_ai_extract",
        "keyword_analysis"
      ],
      "requiredSkills": ["deep_research", "document_ai_extract"]
    }
  ],
  "count": 14
}
```

#### 4.1.2 POST /api/agents
**Description**: Invoke agent mission with streaming response

**Request**:
```http
POST /api/agents HTTP/1.1
Host: gpilot.com
Content-Type: application/json
Authorization: Bearer <token>

{
  "mission": "Generate SEO-optimized blog post about AI trends in 2026",
  "config": {
    "explicitAgents": ["seo-analyst", "content-orchestrator"],
    "budget": 500
  }
}
```

**Response** (Streaming):
```
LOG: 🚀 Mission Overseer: Analyzing mission...
LOG: 📊 Complexity: MODERATE
LOG: 🎯 Selected agents: seo-analyst, content-orchestrator
LOG: 💰 Estimated cost: 420 credits
LOG: ▶️ Executing SEO Analyst...
LOG: 🔍 Performing deep research on AI trends...
LOG: ✅ SEO Analyst completed
LOG: ▶️ Executing Content Orchestrator...
LOG: ✍️ Generating blog post...
LOG: ✅ Content Orchestrator completed
LOG: 🛡️ Independent Verifier: Validating outputs...
RESULT: {"status":"COMPLETED","artifacts":{"blogPost":"..."},"cost":420}
```

**Response Format** (Custom Protocol):
- `LOG:` prefix for log messages
- `RESULT:` prefix for final JSON result
- `ERROR:` prefix for error messages

#### 4.1.3 GET /api/health
**Description**: System health check

**Request**:
```http
GET /api/health HTTP/1.1
Host: gpilot.com
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-27T12:00:00Z",
  "services": {
    "database": "connected",
    "agents": "14 active",
    "redis": "connected"
  }
}
```

#### 4.1.4 POST /api/webhooks/stripe
**Description**: Stripe webhook for payment events

**Request** (from Stripe):
```http
POST /api/webhooks/stripe HTTP/1.1
Host: gpilot.com
Content-Type: application/json
Stripe-Signature: <signature>

{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "amount_total": 2000,
      "metadata": {
        "userId": "user-123",
        "credits": 200
      }
    }
  }
}
```

**Response**:
```json
{
  "received": true
}
```

### 4.2 Streaming Protocol

**Current Implementation** (v8.2): Custom text/event protocol

**Protocol**:
```
LOG:<message>     # Log messages (status updates, progress)
RESULT:<json>     # Final result (JSON-encoded)
ERROR:<message>   # Error messages
```

**Client Example**:
```typescript
const response = await fetch('/api/agents', {
  method: 'POST',
  body: JSON.stringify({ mission, config })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('LOG:')) {
      console.log(line.substring(4));
    } else if (line.startsWith('RESULT:')) {
      const result = JSON.parse(line.substring(7));
      handleResult(result);
    } else if (line.startsWith('ERROR:')) {
      handleError(line.substring(6));
    }
  }
}
```

**Future Implementation** (Phase 9.0): Vercel AI SDK standard

### 4.3 Authentication & Authorization

**Authentication**:
- **Primary**: Supabase Auth (OAuth + Email/Password)
- **Secondary**: Clerk (as fallback)
- **Session**: HTTPOnly cookies + JWT tokens
- **MFA**: Optional 2FA via Supabase

**Authorization**:
- **Role-Based**: Admin, User, Viewer (planned in Phase 10.0)
- **Resource-Based**: Users can only access their own missions
- **API Keys**: Stored encrypted in The Vault

**Headers**:
```http
Authorization: Bearer <supabase_jwt_token>
X-User-ID: <clerk_id_or_supabase_id>
```

### 4.4 Rate Limiting & Error Handling

**Rate Limits**:
- **API Requests**: 100 requests/minute per user
- **Mission Invocations**: 10 concurrent missions per user
- **Streaming**: 1 active stream per user (enforced client-side)

**Error Codes**:
```json
{
  "400": "Bad Request - Invalid mission payload",
  "401": "Unauthorized - Invalid or missing token",
  "402": "Payment Required - Insufficient credits",
  "403": "Forbidden - Access denied",
  "429": "Too Many Requests - Rate limit exceeded",
  "500": "Internal Server Error",
  "503": "Service Unavailable - Agent fleet offline"
}
```

**Error Response Format**:
```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Mission requires 500 credits, but wallet has 120 credits",
    "details": {
      "required": 500,
      "available": 120,
      "shortfall": 380
    }
  }
}
```

### 4.5 Request/Response Schemas

**Mission Request Schema** (Zod):
```typescript
const MissionRequestSchema = z.object({
  mission: z.string().min(10).max(5000),
  config: z.object({
    explicitAgents: z.array(z.string()).optional(),
    budget: z.number().int().positive().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'KINETIC']).optional()
  }).optional()
});
```

**Mission Response Schema**:
```typescript
interface MissionResponse {
  status: 'COMPLETED' | 'FAILED';
  artifacts: Record<string, any>;
  cost: number;
  duration: number; // milliseconds
  audit: VerificationReport;
}
```

---

## PART 5: DATABASE SCHEMA

### 5.1 Schema Overview
G-Pilot uses **PostgreSQL** via **Prisma ORM** for type-safe database access.

**Database**: `gpilot_production`
**Provider**: PostgreSQL 14+
**ORM**: Prisma 6.4.1
**Migrations**: Prisma Migrate

### 5.2 Data Models

#### 5.2.1 UserWallet
**Purpose**: Credit balance tracking for billing system

```prisma
model UserWallet {
  id           String        @id @default(uuid())
  clerkId      String        @unique
  balance      Int           @default(0) // Stored in 'credits' (100 = $1.00)
  transactions Transaction[]
}
```

**Fields**:
- `id`: UUID primary key
- `clerkId`: Unique user identifier from Clerk/Supabase
- `balance`: Credit balance in points (100 points = $1.00 USD)
- `transactions`: Relation to Transaction records

**Example**:
```typescript
// User has $25.00 in credits
{
  id: 'wallet-123',
  clerkId: 'user_abc',
  balance: 2500 // 2500 credits = $25.00
}
```

#### 5.2.2 Transaction
**Purpose**: Audit trail for credit usage and top-ups

```prisma
model Transaction {
  id          String     @id @default(uuid())
  walletId    String
  wallet      UserWallet @relation(fields: [walletId], references: [id])
  amount      Int        // Negative for usage, positive for top-up
  description String
  metadata    Json?
  createdAt   DateTime   @default(now())
}
```

**Fields**:
- `id`: UUID primary key
- `walletId`: Foreign key to UserWallet
- `amount`: Credit change (negative = usage, positive = top-up)
- `description`: Human-readable description
- `metadata`: JSON field for additional data (mission ID, Stripe payment ID, etc.)
- `createdAt`: Timestamp

**Example**:
```typescript
// Mission cost 420 credits
{
  id: 'tx-456',
  walletId: 'wallet-123',
  amount: -420,
  description: 'Mission: Generate SEO blog post',
  metadata: { missionId: 'mission-789', agent: 'seo-analyst' },
  createdAt: '2026-01-27T12:00:00Z'
}
```

#### 5.2.3 UserProfile
**Purpose**: User settings, encrypted API keys (The Vault), and integration status

```prisma
model UserProfile {
  id                  String   @id @default(uuid())
  clerkId             String   @unique
  websiteUrl          String?
  brandConfig         Json?    // Stores extracted logo, fonts, colors (The Mirror)

  // Encrypted Keys (The Vault)
  googleApiKey        String?  // Google AI Studio / Gemini Key
  shopifyAccessToken  String?  // For Shopify sync
  redditApiKey        String?  // For Reddit scraping/posting
  socialApiKeys       Json?    // Encrypted map of other social keys (X, LinkedIn, etc.)

  integrations        Json?    // Connection status & metadata
  onboardingCompleted Boolean  @default(false)

  tasks               KanbanTask[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Fields**:
- `id`: UUID primary key
- `clerkId`: Unique user identifier
- `websiteUrl`: User's website (for brand extraction via "The Mirror")
- `brandConfig`: JSON with logo, fonts, colors extracted from website
- **Encrypted Keys** (The Vault):
  - `googleApiKey`: Google AI Studio API key (AES-256 encrypted)
  - `shopifyAccessToken`: Shopify store access token
  - `redditApiKey`: Reddit API credentials
  - `socialApiKeys`: JSON map of social platform keys (X, LinkedIn, etc.)
- `integrations`: Connection status for external services
- `onboardingCompleted`: User has completed setup
- `tasks`: Relation to KanbanTask records
- `createdAt` / `updatedAt`: Timestamps

**Example**:
```typescript
{
  id: 'profile-123',
  clerkId: 'user_abc',
  websiteUrl: 'https://example.com',
  brandConfig: {
    logo: 'https://cdn.example.com/logo.png',
    primaryColor: '#1E40AF',
    font: 'Inter'
  },
  googleApiKey: 'encrypted_blob_...',
  socialApiKeys: {
    twitter: 'encrypted_blob_...',
    linkedin: 'encrypted_blob_...'
  },
  onboardingCompleted: true
}
```

#### 5.2.4 KanbanTask
**Purpose**: User task tracking with mission workflow states

```prisma
model KanbanTask {
  id          String      @id @default(uuid())
  clerkId     String
  profile     UserProfile @relation(fields: [clerkId], references: [clerkId])

  title       String
  description String?
  status      String      @default("OBLIGATION") // OBLIGATION, EXECUTION, VALIDATION, ARCHIVE
  priority    String      @default("MEDIUM")     // LOW, MEDIUM, HIGH, KINETIC

  dueDate     DateTime?
  payload     Json?       // Mission data (tool options, specs)
  resultUrl   String?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

**Fields**:
- `id`: UUID primary key
- `clerkId`: Foreign key to UserProfile
- `title`: Task title
- `description`: Optional task description
- `status`: Workflow state (OBLIGATION → EXECUTION → VALIDATION → ARCHIVE)
- `priority`: Task priority (LOW, MEDIUM, HIGH, KINETIC)
- `dueDate`: Optional deadline
- `payload`: JSON with mission parameters
- `resultUrl`: URL to result (e.g., generated blog post)
- `createdAt` / `updatedAt`: Timestamps

**Status Workflow**:
```
OBLIGATION (New task)
    ↓
EXECUTION (Agent working on it)
    ↓
VALIDATION (Independent verification)
    ↓
ARCHIVE (Completed or failed)
```

**Example**:
```typescript
{
  id: 'task-789',
  clerkId: 'user_abc',
  title: 'Generate Q1 2026 Marketing Campaign',
  status: 'EXECUTION',
  priority: 'HIGH',
  dueDate: '2026-02-01T00:00:00Z',
  payload: {
    agents: ['marketing-strategist', 'content-orchestrator'],
    budget: 1000
  }
}
```

#### 5.2.5 Mission (v8.2)
**Purpose**: Persistent mission records with plan, result, audit trail, and cost

```prisma
model Mission {
  id        String   @id @default(uuid())
  status    String   // PENDING, RUNNING, COMPLETED, FAILED
  plan      Json?
  result    Json?
  audit     Json?    // Independent Verification Report
  cost      Int
  userId    String   // Corresponds to clerkId/User ID
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Fields**:
- `id`: UUID primary key
- `status`: Mission status (PENDING, RUNNING, COMPLETED, FAILED)
- `plan`: JSON with PlanStep[] array from planning phase
- `result`: JSON with TaskOutput from execution phase
- `audit`: JSON with VerificationReport from Independent Verifier
- `cost`: Total cost in credits
- `userId`: User identifier (clerkId)
- `createdAt` / `updatedAt`: Timestamps

**Example**:
```typescript
{
  id: 'mission-123',
  status: 'COMPLETED',
  plan: {
    steps: [
      { agent: 'seo-analyst', action: 'Research AI trends' },
      { agent: 'content-orchestrator', action: 'Write blog post' }
    ],
    estimatedCost: 500
  },
  result: {
    artifacts: {
      blogPost: 'content...',
      keywords: ['AI', 'trends', '2026']
    }
  },
  audit: {
    passed: true,
    checks: [
      { criterion: 'Blog post >1500 words', passed: true },
      { criterion: 'SEO score >80', passed: true }
    ]
  },
  cost: 420,
  userId: 'user_abc',
  createdAt: '2026-01-27T12:00:00Z'
}
```

### 5.3 Relationships & Foreign Keys

**Relationships**:
```
UserWallet (1) ──< (N) Transaction
UserProfile (1) ──< (N) KanbanTask
```

**Foreign Keys**:
- `Transaction.walletId` → `UserWallet.id`
- `KanbanTask.clerkId` → `UserProfile.clerkId`

**No foreign key** on `Mission.userId` (loose coupling for flexibility)

### 5.4 Indexes & Performance

**Recommended Indexes**:
```sql
-- UserWallet
CREATE INDEX idx_userwallet_clerkid ON UserWallet(clerkId);

-- Transaction
CREATE INDEX idx_transaction_walletid ON Transaction(walletId);
CREATE INDEX idx_transaction_createdat ON Transaction(createdAt DESC);

-- UserProfile
CREATE INDEX idx_userprofile_clerkid ON UserProfile(clerkId);

-- KanbanTask
CREATE INDEX idx_kanbantask_clerkid ON KanbanTask(clerkId);
CREATE INDEX idx_kanbantask_status ON KanbanTask(status);
CREATE INDEX idx_kanbantask_duedate ON KanbanTask(dueDate);

-- Mission
CREATE INDEX idx_mission_userid ON Mission(userId);
CREATE INDEX idx_mission_status ON Mission(status);
CREATE INDEX idx_mission_createdat ON Mission(createdAt DESC);
```

**Query Optimization**:
- Use `SELECT` with specific fields instead of `SELECT *`
- Paginate large result sets (e.g., mission history)
- Use Prisma's `include` and `select` for efficient joins

### 5.5 Migration Strategy

**Development**:
```bash
# Create migration
npx prisma migrate dev --name add_agent_costs

# Apply migration
npx prisma migrate deploy
```

**Production**:
```bash
# Preview migration
npx prisma migrate deploy --preview

# Apply migration
npx prisma migrate deploy
```

**Rollback**:
```bash
# Manually revert via Prisma Migrate history
# Or use database backups (Cloud SQL automatic backups)
```

---

## PART 6: EXECUTION FLOW

### 6.1 Unified Execution Loop Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                     UNIFIED EXECUTION LOOP v8.2                        │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  USER REQUEST (Dashboard → POST /api/agents)                        │
│  Payload: { mission, config: { explicitAgents, budget } }           │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│  ARCHITECT NODE (LangGraph)                                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  • Analyze mission intent                                       │ │
│  │  • Generate SPEC (tool selection + payload)                     │ │
│  │  • Reasoning & strategy formulation                             │ │
│  │  Output: { tool: 'mission-overseer', payload: {...} }           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│  BILLING NODE                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  • Cost estimation based on SPEC                                │ │
│  │  • Wallet balance validation                                    │ │
│  │  • Budget check (config.budget)                                 │ │
│  │  • Debit credits if sufficient                                  │ │
│  │  IF insufficient: ABORT with 402 Payment Required               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│  EXECUTOR NODE                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MISSION OVERSEER (Unified Entry Point)                       │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  ▶ ANALYZE PHASE                                         │ │  │
│  │  │    • Mission classification (SIMPLE/MODERATE/COMPLEX)    │ │  │
│  │  │    • Agent selection (explicit or auto)                  │ │  │
│  │  │    • Cost estimation refinement                          │ │  │
│  │  └──────────────────┬───────────────────────────────────────┘ │  │
│  │                     ↓                                          │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  ▶ PLANNING PHASE                                        │ │  │
│  │  │    • Create mission state object                         │ │  │
│  │  │    • Initialize DB persistence (PrismaMissionAdapter)    │ │  │
│  │  │    • Define execution steps (PlanStep[])                 │ │  │
│  │  │    • Add Independent Audit as final step                 │ │  │
│  │  └──────────────────┬───────────────────────────────────────┘ │  │
│  │                     ↓                                          │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  ▶ EXECUTION PHASE                                       │ │  │
│  │  │    FOR EACH AGENT IN PLAN:                               │ │  │
│  │  │      1. agent.plan(context) → PlanStep[]                 │ │  │
│  │  │      2. agent.execute(plan, context) → TaskOutput        │ │  │
│  │  │      3. Capture results & artifacts                      │ │  │
│  │  │      4. Stream logs via context.onStream()               │ │  │
│  │  │      5. Store output in mission state                    │ │  │
│  │  └──────────────────┬───────────────────────────────────────┘ │  │
│  │                     ↓                                          │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  ▶ INDEPENDENT AUDIT PHASE                               │ │  │
│  │  │    • Route to IndependentVerifier agent                  │ │  │
│  │  │    • Verify ALL worker outputs against criteria          │ │  │
│  │  │    • Check TaskOutput & CompletionCriteria               │ │  │
│  │  │    • Visual verification via UIAuditor (if needed)       │ │  │
│  │  │    Output: VerificationReport { passed, checks[] }       │ │  │
│  │  └──────────────────┬───────────────────────────────────────┘ │  │
│  │                     ↓                                          │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  ▶ RETRY OR FINALIZE                                     │ │  │
│  │  │    IF verification.passed == false:                      │ │  │
│  │  │      • Increment retry count                             │ │  │
│  │  │      • IF retries < 3:                                   │ │  │
│  │  │          - Enhance context with failure details          │ │  │
│  │  │          - GOTO EXECUTION PHASE                          │ │  │
│  │  │      • ELSE:                                             │ │  │
│  │  │          - Mark mission FAILED                           │ │  │
│  │  │          - Persist to DB with audit report               │ │  │
│  │  │    ELSE:                                                 │ │  │
│  │  │      • Mark mission COMPLETED                            │ │  │
│  │  │      • Persist to DB (plan, result, audit, cost)         │ │  │
│  │  │      • Store learnings for future missions               │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│  RESPONSE (Streaming or JSON)                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  • Mission state: COMPLETED / FAILED                            │ │
│  │  • Independent audit report (VerificationReport)                │ │
│  │  • Artifacts & data outputs (blog post, video, etc.)            │ │
│  │  • Cost & duration metrics                                      │ │
│  │  • Stream format: LOG:/RESULT:/ERROR: protocol                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 LangGraph Workflow Architecture

**Workflow Definition** (`src/graph/workflow.ts`):
```typescript
const workflow = new StateGraph<AgentState>({
  channels: agentStateChannels
});

// Define nodes
workflow.addNode('architect', architectNode);
workflow.addNode('billing', billingNode);
workflow.addNode('executor', executorNode);

// Define edges
workflow.addEdge(START, 'architect');
workflow.addEdge('architect', 'billing');
workflow.addEdge('billing', 'executor');
workflow.addEdge('executor', END);

// Compile
export const graph = workflow.compile();
```

**State Channels**:
```typescript
interface AgentState {
  messages: Message[];
  mission: string;
  spec: { tool: string; payload: any } | null;
  result: any | null;
  cost: number;
}
```

### 6.3 Node Specifications

#### 6.3.1 Architect Node
**File**: `src/graph/nodes.ts` (architectNode)
**Purpose**: Analyze mission and generate execution specification

**Logic**:
1. Parse user mission request
2. Classify complexity (SIMPLE, MODERATE, COMPLEX)
3. Determine which agents to invoke
4. Generate SPEC object: `{ tool: 'mission-overseer', payload: { agents, budget } }`
5. Add reasoning to state

**Output**:
```typescript
{
  spec: {
    tool: 'mission-overseer',
    payload: {
      explicitAgents: ['seo-analyst', 'content-orchestrator'],
      estimatedCost: 500
    }
  }
}
```

#### 6.3.2 Billing Node
**File**: `src/graph/nodes.ts` (billingNode)
**Purpose**: Validate credits and debit cost

**Logic**:
1. Fetch user wallet balance
2. Compare balance vs. estimated cost
3. If insufficient: throw error (402 Payment Required)
4. Else: debit credits, create transaction record
5. Update state with actual cost

#### 6.3.3 Executor Node
**File**: `src/graph/nodes.ts` (executorNode)
**Purpose**: Delegate to Mission Overseer for execution

**Logic**:
1. Initialize AgentRegistry
2. Get Mission Overseer agent
3. Create AgentContext with streaming callback
4. Call `overseer.plan(context)`
5. Call `overseer.execute(plan, context)`
6. Capture result and update state

### 6.4 Mission State Management

**State Object**:
```typescript
interface MissionState {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  plan: PlanStep[];
  outputs: Map<string, TaskOutput>;
  retryCount: number;
  learnings: string[];
}
```

**State Transitions**:
```
PENDING (initial)
    ↓
RUNNING (during execution)
    ↓
COMPLETED (verification passed) | FAILED (max retries or critical error)
```

### 6.5 Error Recovery & Retry Logic

**Retry Conditions**:
1. Verification failed
2. Retry count < 3
3. Error is recoverable (not quota exceeded, not auth error)

**Retry Flow**:
```typescript
for (let attempt = 0; attempt < 3; attempt++) {
  const output = await agent.execute(plan, context);
  const verification = await verifier.verify(output, criteria);

  if (verification.passed) {
    return { status: 'COMPLETED', output, verification };
  }

  // Enhance context with failure details
  context.learnings.push(`Attempt ${attempt + 1} failed: ${verification.summary}`);
}

return { status: 'FAILED', verification };
```

---

## PART 7: SKILL & TOOL ECOSYSTEM

### 7.1 Google API Skills

#### Gemini 3 Flash
**File**: `src/tools/googleAPISkills.ts`
**Purpose**: Fast text generation and reasoning
**API**: Google Generative AI SDK
**Model**: `gemini-2.0-flash`
**Use Cases**: Quick content generation, chat, Q&A

#### Deep Research
**File**: `src/tools/googleAPISkills.ts`
**Purpose**: Multi-source research synthesis
**Model**: `gemini-3-flash-thinking`
**Use Cases**: Market research, competitor analysis, SEO research

#### VEO 3.1 (Video)
**File**: `src/tools/googleAPISkills.ts`
**Purpose**: AI video generation
**API**: Google VEO API
**Use Cases**: Social media videos, product demos, marketing content

#### Document AI
**File**: `src/tools/googleAPISkills.ts`
**Purpose**: Document extraction and OCR
**API**: Google Document AI
**Use Cases**: PDF parsing, receipt extraction, form processing

#### Imagen 3
**File**: `src/tools/imagen3.ts`
**Purpose**: AI image generation
**API**: Google Imagen API
**Use Cases**: Product images, marketing graphics, social media visuals

### 7.2 Web Intelligence Skills

#### Web Unlocker
**Purpose**: CAPTCHA bypass and anti-bot detection
**Provider**: ScraperAPI or Bright Data
**Use Cases**: Scraping protected sites, bypassing rate limits

#### SERP Collector
**Purpose**: Search engine results page scraping
**Use Cases**: SEO analysis, competitor tracking, keyword research

#### Web Crawler
**Purpose**: Recursive website crawling
**Use Cases**: Site mapping, content audits, link analysis

#### Structured Scraper
**Purpose**: Targeted data extraction with CSS/XPath selectors
**Use Cases**: Product data, pricing, reviews

### 7.3 Integration Tools

#### Shopify Sync
**Purpose**: E-commerce integration
**API**: Shopify Admin API
**Features**: Product sync, inventory management, order processing

#### Social Blast
**Purpose**: Multi-platform social media posting
**APIs**: X (Twitter), LinkedIn, Facebook, Instagram
**Features**: Scheduled posting, multi-account, analytics

#### Search Console Audit
**Purpose**: Google Search Console integration
**API**: Google Search Console API
**Features**: Performance metrics, indexing status, sitemap submission

### 7.4 Skill Binding Protocol

**Dynamic Skill Binding**:
```typescript
// Skills are bound at runtime
const agent = AgentRegistry.get('seo-analyst');
agent.bindSkill('deep_research', deepResearchSkill);
agent.bindSkill('document_ai_extract', documentAISkill);

// Agent can now use these skills
const output = await agent.execute(plan, context);
```

**Skill Interface**:
```typescript
interface Skill {
  name: string;
  execute(params: any, context: AgentContext): Promise<any>;
}
```

---

## PART 8: USER INTERFACE

### 8.1 Design System (v8.1 Standard)

**Visual Identity**:
- **3D Glass Medallions**: Agent status indicators with depth
- **8K Cinematic Imagery**: High-resolution background graphics
- **Linear-Style Minimalist UI**: Clean, spacious, focused

**Color Palette**:
```css
--primary: #1E40AF;     /* Blue 800 */
--secondary: #9333EA;   /* Purple 600 */
--accent: #F59E0B;      /* Amber 500 */
--success: #10B981;     /* Green 500 */
--danger: #EF4444;      /* Red 500 */
--background: #0F172A;  /* Slate 900 */
--surface: #1E293B;     /* Slate 800 */
--text: #F1F5F9;        /* Slate 100 */
```

**Typography**:
- **Primary**: Inter (variable font)
- **Monospace**: JetBrains Mono (code, logs)

### 8.2 Component Library

**Core Components**:
- `MissionModal.tsx`: Mission launch dialog with streaming logs
- `fleet-status.tsx`: Agent fleet health indicators
- `credit-dialog.tsx`: Credit purchase flow
- `telemetry-panel.tsx`: Real-time metrics dashboard

**Shared Components**:
- Button, Card, Badge, Input, Select
- Dialog, Dropdown, Toast, Tooltip
- Table, Tabs, Avatar, Progress

### 8.3 Dashboard Architecture

#### 8.3.1 Mission Control
**Route**: `/dashboard`
**Features**:
- Wallet balance display (USD conversion)
- Mission launch button → MissionModal
- Mission Archive Ledger (last 50 missions)
- Fleet Status panel (6 system cards)

**Key Metrics**:
- Total Missions
- Success Rate
- Fuel Consumed
- Active Agents

#### 8.3.2 Fleet Status
**Component**: `fleet-status.tsx`
**Features**:
- Real-time agent status (IDLE, BUSY, ERROR)
- 3D Glass Medallion indicators
- Capability tags
- Last activity timestamp

#### 8.3.3 Mission History
**Component**: Mission Archive Ledger table
**Columns**:
- Mission ID (truncated UUID)
- Status (badge)
- Cost (credits)
- Created At (relative time)
- Actions (View Details)

#### 8.3.4 Vault UI
**Route**: `/dashboard/vault`
**Features**:
- Encryption key visualization
- Key rotation button (UI ready, backend Phase 9.1)
- "Military-Grade Encryption" messaging
- Status cards: HSM, AES-256-GCM

### 8.4 Responsive Design Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Ultra-wide */
```

**Mobile-First Approach**:
- Stack cards vertically on mobile
- Horizontal scroll for mission table
- Hamburger menu for navigation

### 8.5 Real-Time Streaming UI

**MissionModal Streaming**:
```tsx
<MissionModal>
  <StreamingLogs>
    {logs.map(log => (
      <LogLine key={log.id} type={log.type}>
        {log.message}
      </LogLine>
    ))}
  </StreamingLogs>
  <ProgressBar value={progress} />
</MissionModal>
```

**Terminal-Style Display**:
- Monospace font (JetBrains Mono)
- Auto-scroll to bottom
- Syntax highlighting for JSON results
- Copy-to-clipboard button

---

## PART 9: PERSISTENCE & AUDIT TRAIL

### 9.1 PrismaMissionAdapter

**File**: `src/lib/prisma-mission-adapter.ts`
**Purpose**: Non-blocking database writes for mission persistence

**Interface**:
```typescript
class PrismaMissionAdapter {
  async recordMission(mission: MissionRecord): Promise<void>
  async updateMissionStatus(id: string, status: string): Promise<void>
  async getMissionById(id: string): Promise<Mission | null>
  async getMissionsByUser(userId: string, limit: number): Promise<Mission[]>
}
```

**Usage**:
```typescript
// Non-blocking write
await adapter.recordMission({
  id: missionId,
  status: 'COMPLETED',
  plan: executionPlan,
  result: taskOutput,
  audit: verificationReport,
  cost: totalCost,
  userId: context.userId
});
```

### 9.2 Mission Logging Protocol

**Log Levels**:
```
INFO:  General status updates
WARN:  Non-critical issues
ERROR: Critical failures
DEBUG: Detailed execution traces
```

**Log Format**:
```typescript
interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  agent: string;
  message: string;
  metadata?: Record<string, any>;
}
```

### 9.3 Audit Trail Requirements

**Required Fields**:
1. **Who**: User ID (clerkId)
2. **What**: Mission description
3. **When**: Timestamps (createdAt, updatedAt)
4. **How**: Plan (agents used, steps executed)
5. **Result**: Output artifacts
6. **Verification**: Audit report from IndependentVerifier
7. **Cost**: Credits consumed

### 9.4 Data Retention Policy

**Retention Periods**:
- **Missions**: 90 days (then archived to cold storage)
- **Transactions**: Indefinite (financial compliance)
- **Logs**: 30 days (then deleted)
- **Audit Reports**: 1 year (compliance)

**Archival Strategy**:
```sql
-- Archive old missions to separate table
INSERT INTO missions_archive
SELECT * FROM missions
WHERE createdAt < NOW() - INTERVAL '90 days';

DELETE FROM missions
WHERE createdAt < NOW() - INTERVAL '90 days';
```

---

## PART 10: TESTING REQUIREMENTS

### 10.1 Unit Testing (123 Tests)

**Test Framework**: Vitest 4.0.17
**Assertion Library**: Vitest (expect)
**Mocking**: vi.mock()
**DOM Environment**: Happy-DOM 20.3.3

**Test Structure**:
```
tests/unit/
├── agents/
│   ├── marketing-strategist.test.ts (7 tests)
│   ├── seo-analyst.test.ts (8 tests)
│   ├── social-commander.test.ts (8 tests)
│   ├── content-orchestrator.test.ts (10 tests)
│   ├── mission-overseer.test.ts (8 tests)
│   ├── independent-verifier.test.ts (3 tests)
│   ├── web-scraper.test.ts (10 tests)
│   ├── geo-marketing.test.ts (8 tests)
│   ├── genesis-architect.test.ts (6 tests)
│   ├── agent-scout.test.ts (5 tests)
│   └── registry.test.ts (10 tests)
└── tools/
    ├── googleAPISkills.test.ts (8 tests)
    ├── webIntelligenceSkills.test.ts (12 tests)
    ├── agentDiscoverySkill.test.ts (5 tests)
    └── notebookLMResearch.test.ts (7 tests)
```

**Test Standards**:
1. Mock external dependencies (APIs, DB)
2. Test both success and failure paths
3. Validate input/output schemas
4. Check error handling
5. Verify logging

**Example Test**:
```typescript
describe('SEOAnalystAgent', () => {
  it('should generate keyword research', async () => {
    const agent = new SEOAnalystAgent();
    const context = {
      userId: 'test-user',
      mission: 'Research keywords for AI blog',
      config: {}
    };

    const plan = await agent.plan(context);
    expect(plan.steps).toHaveLength(2);

    const output = await agent.execute(plan, context);
    expect(output.artifacts.keywords).toBeDefined();
    expect(output.artifacts.keywords.length).toBeGreaterThan(0);
  });
});
```

### 10.2 Integration Testing

**Test File**: `tests/integration/agent-pipeline.test.ts` (10 tests)

**Tests**:
1. End-to-end agent coordination
2. Multi-agent workflows
3. Independent verification integration
4. Database persistence
5. Billing integration
6. Error recovery flows

**Example**:
```typescript
it('should coordinate SEO + Content agents', async () => {
  const overseer = AgentRegistry.get('mission-overseer');
  const result = await overseer.execute({
    mission: 'Create SEO-optimized blog post',
    agents: ['seo-analyst', 'content-orchestrator']
  });

  expect(result.status).toBe('COMPLETED');
  expect(result.artifacts.blogPost).toBeDefined();
  expect(result.audit.passed).toBe(true);
});
```

### 10.3 E2E Testing (Playwright)

**Framework**: Playwright 1.57.0
**Browsers**: Chromium, Firefox, Safari (WebKit)

**Test Suites**:
```
tests/e2e/
├── basic.test.ts (Landing page, navigation)
└── auth.test.ts (Login, signup, protected routes)
```

**Planned E2E Tests** (Phase 9.0+):
```
tests/e2e/
├── dashboard.spec.ts (Mission launch, history)
├── agent-lifecycle.spec.ts (Full mission workflow)
├── content-orchestrator.spec.ts (Content generation)
└── mission-overseer.spec.ts (Orchestration flows)
```

**Example**:
```typescript
test('should launch mission and see streaming logs', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('button:has-text("Launch Mission")');
  await page.fill('textarea', 'Generate blog post about AI');
  await page.click('button:has-text("Execute")');

  // Wait for streaming logs
  await expect(page.locator('.log-line').first()).toBeVisible();
  await expect(page.locator('text=RESULT:')).toBeVisible({ timeout: 30000 });
});
```

### 10.4 Coverage Requirements (>80%)

**Coverage Command**:
```bash
npm run test:coverage
```

**Target Coverage**:
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

**Coverage Report**:
```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
agents/             |   85.2  |   78.4   |   82.1  |   85.5  |
tools/              |   82.7  |   75.3   |   79.8  |   83.1  |
graph/              |   78.9  |   72.1   |   76.5  |   79.3  |
lib/                |   88.4  |   81.2   |   85.7  |   88.9  |
--------------------|---------|----------|---------|---------|
All files           |   83.8  |   76.8   |   81.0  |   84.2  |
--------------------|---------|----------|---------|---------|
```

### 10.5 CI/CD Pipeline

**GitHub Actions Workflows**:
```
.github/workflows/
├── ci.yml (Run tests on PR)
├── deploy.yml (Deploy to production)
└── playwright.yml (E2E tests)
```

**CI Pipeline** (`.github/workflows/ci.yml`):
```yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:coverage
      - run: npm run build
```

### 10.6 Test Data Management

**Mocking Strategy**:
- Mock external APIs (Google Gemini, Stripe)
- Use in-memory database for integration tests
- Fixtures for common test data

**Test Fixtures**:
```typescript
// tests/fixtures/agents.ts
export const mockAgentContext: AgentContext = {
  userId: 'test-user-123',
  mission: 'Test mission',
  config: { budget: 1000 }
};

export const mockTaskOutput: TaskOutput = {
  completionStatus: 'completed',
  artifacts: { result: 'test result' },
  logs: ['Step 1 completed'],
  completionCriteria: []
};
```

---

## PART 11: SECURITY & COMPLIANCE

### 11.1 Vault System (Sovereign Security)

**Purpose**: Encrypted storage for API keys and sensitive credentials

**Architecture**:
- **Storage**: Firebase Firestore (encrypted at rest)
- **Encryption**: AES-256-GCM via Node.js crypto module
- **Key Management**: Firebase Admin SDK
- **Access**: Server-side only (never exposed to client)

**Encrypted Fields** (UserProfile):
- `googleApiKey`: Google AI Studio API key
- `shopifyAccessToken`: Shopify store access token
- `redditApiKey`: Reddit API credentials
- `socialApiKeys`: JSON map of social platform keys

### 11.2 Encryption Standards (AES-256)

**Algorithm**: AES-256-GCM (Galois/Counter Mode)
**Key Derivation**: PBKDF2 with SHA-256
**Initialization Vector**: Random 16 bytes per encryption

**Encryption Flow**:
```typescript
import crypto from 'crypto';

function encrypt(plaintext: string, masterKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  });
}

function decrypt(ciphertext: string, masterKey: string): string {
  const { encrypted, iv, authTag } = JSON.parse(ciphertext);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    masterKey,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### 11.3 API Key Management

**Storage**:
1. User enters API key in Vault UI
2. Client sends key to server via HTTPS
3. Server encrypts key with AES-256-GCM
4. Encrypted blob stored in UserProfile (Firestore)
5. Key never logged or exposed

**Retrieval**:
1. Agent requests key from context
2. Server fetches encrypted blob from database
3. Server decrypts using master key (from env)
4. Decrypted key passed to agent (in-memory only)
5. Key never leaves server

### 11.4 Firebase Admin SDK Integration

**Initialization**:
```typescript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

const db = admin.firestore();
```

**Key Rotation** (Phase 9.1):
```typescript
async function rotateEncryptionKeys(userId: string): Promise<void> {
  // 1. Generate new master key
  const newMasterKey = crypto.randomBytes(32);

  // 2. Fetch user profile with old encrypted keys
  const profile = await db.collection('profiles').doc(userId).get();

  // 3. Decrypt all keys with old master key
  const decryptedKeys = decryptAllKeys(profile.data(), oldMasterKey);

  // 4. Re-encrypt all keys with new master key
  const reencryptedKeys = encryptAllKeys(decryptedKeys, newMasterKey);

  // 5. Update profile with new encrypted keys + key version
  await db.collection('profiles').doc(userId).update({
    ...reencryptedKeys,
    keyVersion: incrementKeyVersion(profile.data().keyVersion)
  });
}
```

### 11.5 Authentication (Supabase)

**Provider**: Supabase Auth
**Methods**: OAuth (Google, GitHub), Email/Password
**MFA**: Optional 2FA via TOTP

**Session Management**:
- **Access Token**: Short-lived (1 hour)
- **Refresh Token**: Long-lived (30 days)
- **Cookie**: HTTPOnly, Secure, SameSite=Strict

**Auth Flow**:
```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Refresh token
const { data: { session: newSession } } = await supabase.auth.refreshSession();
```

### 11.6 Authorization & RBAC

**Planned for Phase 10.0** (Multi-Tenant Architecture)

**Roles**:
- **Owner**: Full control, billing, user management
- **Admin**: Mission management, agent configuration
- **Member**: Mission execution, view history
- **Viewer**: Read-only access

**Permissions**:
```typescript
interface Permission {
  resource: 'mission' | 'agent' | 'wallet' | 'vault';
  action: 'create' | 'read' | 'update' | 'delete';
}

const rolePermissions: Record<Role, Permission[]> = {
  Owner: [
    { resource: '*', action: '*' }
  ],
  Admin: [
    { resource: 'mission', action: '*' },
    { resource: 'agent', action: 'read' }
  ],
  Member: [
    { resource: 'mission', action: 'create' },
    { resource: 'mission', action: 'read' }
  ],
  Viewer: [
    { resource: 'mission', action: 'read' }
  ]
};
```

---

## PART 12: BILLING & COST MANAGEMENT

### 12.1 Fuel System (PTS Credits)

**Credit Model**:
- **1 Credit = $0.01 USD**
- **100 Credits = $1.00 USD**
- Credits stored as integers (avoids floating-point issues)

**Example**:
```typescript
// User purchases $25.00 worth of credits
const credits = 2500; // 2500 credits = $25.00

// Mission costs 420 credits
const cost = 420; // 420 credits = $4.20

// New balance
const newBalance = 2500 - 420; // 2080 credits = $20.80
```

### 12.2 Cost Gates & Budget Controls

**Pre-Mission Validation**:
```typescript
async function validateBudget(
  userId: string,
  estimatedCost: number,
  userBudget?: number
): Promise<void> {
  const wallet = await prisma.userWallet.findUnique({
    where: { clerkId: userId }
  });

  if (wallet.balance < estimatedCost) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  if (userBudget && estimatedCost > userBudget) {
    throw new Error('BUDGET_EXCEEDED');
  }
}
```

**Budget Override**:
Users can specify max budget in config:
```typescript
{
  mission: 'Generate campaign',
  config: {
    budget: 500 // Max 500 credits
  }
}
```

### 12.3 Stripe Integration

**Payment Flow**:
1. User clicks "Add Credits" button
2. Client calls Stripe Checkout API
3. Stripe redirects to payment page
4. User completes payment
5. Stripe sends webhook to `/api/webhooks/stripe`
6. Server verifies webhook signature
7. Server credits user wallet
8. Server creates transaction record

**Webhook Handler**:
```typescript
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const credits = parseInt(session.metadata.credits);

    // Credit wallet
    await prisma.userWallet.update({
      where: { clerkId: userId },
      data: { balance: { increment: credits } }
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: credits,
        description: `Credit purchase - $${session.amount_total / 100}`,
        metadata: { stripeSessionId: session.id }
      }
    });
  }

  return new Response(JSON.stringify({ received: true }));
}
```

### 12.4 Transaction Ledger

**Fields**:
- `id`: UUID
- `walletId`: Foreign key to UserWallet
- `amount`: Credit change (positive = top-up, negative = usage)
- `description`: Human-readable description
- `metadata`: JSON with mission ID, Stripe session ID, etc.
- `createdAt`: Timestamp

**Query Examples**:
```typescript
// Get all transactions for user
const transactions = await prisma.transaction.findMany({
  where: { wallet: { clerkId: userId } },
  orderBy: { createdAt: 'desc' },
  take: 100
});

// Get total spent
const totalSpent = await prisma.transaction.aggregate({
  where: {
    wallet: { clerkId: userId },
    amount: { lt: 0 }
  },
  _sum: { amount: true }
});
```

### 12.5 Usage Analytics

**Fleet Stats**:
```typescript
async function getFleetStats(userId: string) {
  const missions = await prisma.mission.findMany({
    where: { userId }
  });

  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.status === 'COMPLETED').length;
  const successRate = (completedMissions / totalMissions) * 100;

  const fuelConsumed = missions.reduce((sum, m) => sum + m.cost, 0);

  return {
    totalMissions,
    successRate,
    fuelConsumed
  };
}
```

---

## PART 13: CONFIGURATION & ENVIRONMENT

### 13.1 Environment Variables

**Required Variables**:
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/gpilot

# Google AI
GOOGLE_AI_API_KEY=AIza...

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Clerk (fallback auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

# App Config
NEXT_PUBLIC_APP_URL=https://gpilot.com
NODE_ENV=production
```

### 13.2 Configuration Files

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  experimental: {
    turbo: true
  },
  images: {
    domains: ['cdn.gpilot.com', 'firebasestorage.googleapis.com']
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: '8.2.0'
  }
};
```

**Tailwind Config** (`tailwind.config.ts`):
```typescript
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#9333EA'
      }
    }
  }
};
```

### 13.3 Feature Flags

**Planned for Phase 9.3+**:
```typescript
interface FeatureFlags {
  parallelAgentExecution: boolean;
  vercelAIStreaming: boolean;
  multiTenantMode: boolean;
}

const flags: FeatureFlags = {
  parallelAgentExecution: process.env.FEATURE_PARALLEL_AGENTS === 'true',
  vercelAIStreaming: process.env.FEATURE_VERCEL_AI === 'true',
  multiTenantMode: false
};
```

### 13.4 Deployment Environments

**Development**:
- Local PostgreSQL
- Local Redis
- Firebase Emulators
- Stripe Test Mode

**Staging**:
- Cloud SQL (development instance)
- Upstash Redis
- Firebase (staging project)
- Stripe Test Mode

**Production**:
- Cloud SQL (production instance)
- Upstash Redis (production)
- Firebase (production project)
- Stripe Live Mode

---

## PART 14: MONITORING & OBSERVABILITY

### 14.1 Logging Standards

**Log Format** (JSON):
```json
{
  "timestamp": "2026-01-27T12:00:00Z",
  "level": "INFO",
  "agent": "mission-overseer",
  "message": "Mission completed successfully",
  "metadata": {
    "missionId": "mission-123",
    "duration": 45000,
    "cost": 420
  }
}
```

**Log Levels**:
- `DEBUG`: Detailed traces (development only)
- `INFO`: General operational events
- `WARN`: Non-critical issues (retry, fallback)
- `ERROR`: Critical failures (mission failed, quota exceeded)

### 14.2 Performance Metrics

**Tracked Metrics**:
- Mission duration (ms)
- Agent execution time (ms)
- API call latency (ms)
- Database query time (ms)
- Streaming throughput (bytes/sec)

**Example**:
```typescript
const start = Date.now();
const result = await agent.execute(plan, context);
const duration = Date.now() - start;

console.log(`Agent execution completed in ${duration}ms`);
```

### 14.3 Fleet Health Monitoring

**Health Checks**:
```typescript
async function checkFleetHealth(): Promise<FleetHealthReport> {
  const agents = AgentRegistry.getAvailableAgents();

  const healthChecks = await Promise.all(
    agents.map(async (name) => {
      const agent = AgentRegistry.get(name);
      return {
        name,
        status: await agent.healthCheck(),
        lastActivity: agent.lastActivityTimestamp
      };
    })
  );

  return {
    totalAgents: agents.length,
    healthyAgents: healthChecks.filter(c => c.status === 'healthy').length,
    checks: healthChecks
  };
}
```

### 14.4 Error Tracking

**Error Types**:
- **UserError**: Invalid input, insufficient credits
- **SystemError**: Database connection, API quota exceeded
- **AgentError**: Agent execution failure, timeout
- **VerificationError**: Independent verification failed

**Error Logging**:
```typescript
try {
  await agent.execute(plan, context);
} catch (error) {
  console.error({
    type: 'AgentError',
    agent: agent.name,
    message: error.message,
    stack: error.stack,
    context: { missionId, userId }
  });

  throw error;
}
```

### 14.5 Success Rate Analytics

**Calculation**:
```typescript
async function calculateSuccessRate(userId: string): Promise<number> {
  const missions = await prisma.mission.findMany({
    where: { userId },
    select: { status: true }
  });

  const completed = missions.filter(m => m.status === 'COMPLETED').length;
  return (completed / missions.length) * 100;
}
```

**Dashboard Display**:
```tsx
<MetricCard title="Success Rate">
  <ProgressBar value={successRate} max={100} />
  <Text>{successRate.toFixed(1)}%</Text>
</MetricCard>
```

---

## PART 15: ROADMAP & FUTURE PHASES

### 15.1 Phase 9.0: Streaming Enhancement (Vercel AI SDK)
**Priority**: HIGH | **Effort**: Medium | **Timeline**: 2-3 weeks

**Goal**: Migrate from custom streaming protocol to Vercel AI SDK standard

**Deliverables**:
1. Install Vercel AI SDK (`ai` package already at v6.0.49)
2. Refactor `/api/agents` to use `streamText()` or `streamUI()`
3. Update `MissionModal.tsx` to use `useChat()` or `useCompletion()` hook
4. Add token-level streaming for LLM calls
5. Implement progress indicators & typing states
6. Update streaming tests

**Benefits**:
- Battle-tested streaming patterns
- Better error handling
- Client hooks for easy integration
- Tool call streaming support
- Token usage tracking

### 15.2 Phase 9.1: Vault Hardening (Key Rotation)
**Priority**: HIGH | **Effort**: Medium | **Timeline**: 2-3 weeks

**Goal**: Implement backend key rotation logic for production readiness

**Deliverables**:
1. Implement `rotateEncryptionKeys()` in Vault service
2. Create API endpoint: `POST /api/vault/rotate`
3. Add `keyVersion` field to UserProfile schema
4. Graceful key migration (old keys decrypt, new keys encrypt)
5. Audit logging for rotation events
6. Connect "Rotate Keys" button in Vault UI
7. Tests for rotation logic

**Benefits**:
- Security compliance (key rotation best practice)
- Zero-downtime key migration
- Audit trail for compliance

### 15.3 Phase 9.2: Granular Telemetry (Per-Agent Cost Tracking)
**Priority**: MEDIUM | **Effort**: Low | **Timeline**: 1-2 weeks

**Goal**: Track cost per agent for transparency and analytics

**Deliverables**:
1. Add `agentCosts` JSON field to Mission model
2. Update MissionOverseer to track per-agent costs
3. Create `getAgentCostBreakdown()` server action
4. Add Fleet Analytics dashboard component with pie chart
5. Update tests for cost tracking

**Benefits**:
- User-facing cost transparency
- Better budget allocation insights
- Identify cost-inefficient agents

**Example**:
```typescript
{
  missionId: 'mission-123',
  agentCosts: {
    'seo-analyst': 200,
    'content-orchestrator': 220
  },
  totalCost: 420
}
```

### 15.4 Phase 9.3: Advanced Orchestration (Parallel Execution)
**Priority**: MEDIUM | **Effort**: High | **Timeline**: 3-4 weeks

**Goal**: Enable parallel agent execution with dependency graphs

**Deliverables**:
1. Extend `PlanStep` with `dependencies` and `condition` fields
2. Implement DAG (Directed Acyclic Graph) executor
3. Add parallel execution with `Promise.all()`
4. Conditional routing (if/else in workflow)
5. Update MissionOverseer.execute() for parallel support
6. Workflow visualization UI
7. Comprehensive tests for parallel scenarios

**Benefits**:
- 2-3x throughput improvement for independent agents
- Complex workflow support (if SEO score > 80, then...)
- Better resource utilization

**Example**:
```typescript
const plan = [
  { agent: 'seo-analyst', dependencies: [] },
  { agent: 'marketing-strategist', dependencies: [] },
  // These two run in parallel ↑
  { agent: 'content-orchestrator', dependencies: ['seo-analyst'] },
  // This waits for SEO analyst ↑
  { agent: 'social-commander', dependencies: ['content-orchestrator'] }
  // This waits for content ↑
];
```

### 15.5 Phase 10.0: Multi-Tenant Architecture (Workspaces)
**Priority**: LOW | **Effort**: Very High | **Timeline**: 4-6 weeks

**Goal**: Support team collaboration with workspace isolation

**Deliverables**:
1. Add `Workspace`, `Team`, `Member` models to schema
2. Migrate UserProfile → WorkspaceMember relationship
3. Implement RBAC (Owner, Admin, Member, Viewer)
4. Isolate missions by workspace
5. Shared vault per workspace
6. Billing per workspace (not per user)
7. Team collaboration UI

**Benefits**:
- Team collaboration (agencies, enterprises)
- Workspace-level billing
- Role-based access control
- Shared resources (agents, vaults)

---

## APPENDICES

### A. Glossary of Terms

- **Agent**: Specialized AI worker with domain expertise
- **Mission**: User-initiated task executed by agents
- **The Loop**: Unified execution protocol (Analyze → Plan → Execute → Verify)
- **The Vault**: Encrypted storage for API keys
- **Fuel**: G-Pilot's credit system (100 credits = $1.00 USD)
- **Independent Verification**: Quality gates by IndependentVerifier agent
- **PlanStep**: Individual step in agent execution plan
- **TaskOutput**: Result object from agent execution
- **Completion Criteria**: Requirements for mission success
- **The Matrix View**: Real-time streaming log display

### B. API Client Examples

**JavaScript/TypeScript**:
```typescript
// Launch mission
const response = await fetch('https://gpilot.com/api/agents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    mission: 'Generate SEO blog post about AI trends',
    config: {
      explicitAgents: ['seo-analyst', 'content-orchestrator'],
      budget: 500
    }
  })
});

// Read streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

**Python**:
```python
import requests

# Launch mission
response = requests.post(
    'https://gpilot.com/api/agents',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'mission': 'Generate SEO blog post about AI trends',
        'config': {
            'explicitAgents': ['seo-analyst', 'content-orchestrator'],
            'budget': 500
        }
    },
    stream=True
)

# Read streaming response
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### C. Migration Guides

**Upgrading from v8.1 to v8.2**:
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run Prisma migration (adds Mission table)
npx prisma migrate deploy

# 4. Update environment variables (no changes required)

# 5. Restart application
npm run build
npm run start
```

### D. Troubleshooting Guide

**Common Issues**:

1. **"INSUFFICIENT_CREDITS" error**
   - Solution: Add credits via dashboard → "Add Credits" button

2. **Agent not found in registry**
   - Check agent name matches registry key
   - Run `npm run dev` to reinitialize agents

3. **Streaming not working**
   - Verify client uses `ReadableStream` API
   - Check for ad blockers blocking stream

4. **Database connection failed**
   - Verify `DATABASE_URL` environment variable
   - Check Cloud SQL is running and accessible

5. **Mission stuck in RUNNING**
   - Check agent logs for errors
   - Verify no quota exceeded on Google AI API
   - Retry mission or contact support

### E. Contributing Guidelines

**For Contributors**:

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/g-pilot.git
   cd g-pilot
   npm ci
   ```

2. **Create Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Follow Code Standards**:
   - Use GTS (Google TypeScript Style): `npm run lint`
   - Write tests for new features
   - Update SPEC.md if adding major features

4. **Test Your Changes**:
   ```bash
   npm run test
   npm run test:e2e
   ```

5. **Submit Pull Request**:
   - Clear description of changes
   - Link to related issue (if any)
   - Ensure CI pipeline passes

---

**END OF SPECIFICATION**

For questions or support, please contact:
**Email**: support@gpilot.com
**GitHub**: https://github.com/g-pilot/g-pilot
**Documentation**: https://docs.gpilot.com

---

*G-Pilot v8.2 "Sovereign Control" - Autonomous AI Orchestration Platform*
*Copyright © 2026 G-Pilot Team. All rights reserved.*
