# G-Pilot Agents Framework

## 🤖 Agent Architecture

G-Pilot uses a **multi-agent orchestration** system where specialized agents collaborate to complete complex missions. Each agent operates in three distinct modes.

## 🔄 Agent Modes

### 1. PLANNING Mode
The agent analyzes the mission requirements and creates a structured execution plan.
- Research and context gathering
- Strategy formulation
- Resource estimation (fuel cost)

### 2. EXECUTION Mode
The agent implements the planned strategy using available tools and skills.
- Tool invocation
- Skill binding and execution
- Real-time adaptation

### 3. VERIFICATION Mode
The agent validates the results and ensures mission objectives are met.
- Output validation
- Quality checks
- Error recovery

## 🧬 Agent Interface

All agents must implement the core interface:

```typescript
interface IGPilotAgent {
  name: string;
  description: string;
  capabilities: string[];
  
  // Mode handlers
  plan(context: AgentContext): Promise<AgentPlan>;
  execute(plan: AgentPlan): Promise<AgentResult>;
  verify(result: AgentResult): Promise<VerificationReport>;
  
  // Skill binding
  bindSkills(skills: Skill[]): void;
  getRequiredSkills(): string[];
}
```

## 🎯 Active Agents

| Agent | Domain | Primary Skills |
|-------|--------|----------------|
| **Mission Overseer** | Orchestration | All agents, quality gates |
| **Marketing Strategist** | Campaign Planning | web_intel, image_generation |
| **SEO Analyst** | Search Optimization | web_mastery_audit, search_console_audit |
| **Social Commander** | Social Distribution | social_blast, web_intel |
| **Content Orchestrator** | Content Creation | google_slides_storyboard, notebook_lm_research |

## 📂 Agent Locations

### Global Agents
Located in `.agent/agents/` - shared across all missions.

### Local Agents
Located in `src/agents/` - project-specific implementations.

## 🔗 Skill Binding Protocol

Agents bind to skills through the registry pattern:

```typescript
// Registration
AgentRegistry.register('seo-analyst', SEOAnalystAgent);

// Skill binding
const agent = AgentRegistry.get('seo-analyst');
agent.bindSkills(['web_mastery_audit', 'search_console_audit']);

// Execution
const result = await agent.execute(plan);
```

## 🛡️ Security Directives

1. **Vault Isolation**: Agents never store credentials - they request from Vault per-execution
2. **Cost Gating**: All agent actions pass through the Billing Node before execution
3. **Audit Trail**: Every agent action is logged with mission context

## 📜 Reference

- `GEMINI.md` - Core protocols and mission statement
- `ARCH.md` - Technical architecture
- `.agent/skills/` - Available skill modules
