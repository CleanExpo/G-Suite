---
name: advanced-tool-use
version: "1.0"
triggers:
  - tool use
  - context optimization
  - token efficiency
  - tool search
  - programmatic calling
priority: 8
---

# Advanced Tool Use System

Implements Anthropic's advanced tool use features for maximum context window efficiency.

## Features

### 1. Tool Search Tool (85% Context Reduction)

Instead of loading all 50+ tool definitions upfront (~55K tokens), Claude searches for relevant tools on-demand.

```python
# Example: Search for verification tools
results = orchestrator.search_tools("verify task outputs")

# Returns top matches with relevance scores
# [
#   {"name": "verification.verify_task", "score": 0.95, ...},
#   {"name": "verification.collect_evidence", "score": 0.78, ...}
# ]
```

**API Format:**
```json
{
  "type": "tool_search_tool_regex_20251119",
  "name": "tool_search"
}
```

### 2. Programmatic Tool Calling (37% Token Reduction)

Enable Claude to invoke tools from code execution, keeping intermediate results out of context.

```python
# Instead of 20 individual tool calls with results in context:
context = orchestrator.create_execution_context()

# Claude writes code that orchestrates tools
# Only final summary enters context window

results = await orchestrator.execute_programmatic_calls(context)
```

**Allowed Callers:**
```python
config = ToolConfig(
    allowed_callers=["code_execution_20250825"]
)
```

### 3. Tool Use Examples (72% → 90% Accuracy)

Provide usage examples to improve parameter accuracy.

```python
examples = [
    ToolExample(
        description="Verify file creation",
        input={
            "task_id": "task_123",
            "criteria": [
                {"type": "file_exists", "target": "/src/component.tsx"}
            ]
        },
        expected_behavior="Returns verification result with evidence"
    )
]
```

## Configuration

### Tool Categories

| Category | Loading | Description |
|----------|---------|-------------|
| CORE | Always | High-frequency tools (health_check, get_task_status) |
| VERIFICATION | Deferred | Independent verification tools |
| AUDIT | Deferred | User journey and route auditing |
| DATABASE | Deferred | Query and insert operations |
| FILE_SYSTEM | Deferred | File read/write/list operations |

### Tool Config Options

```python
@dataclass
class ToolConfig:
    defer_loading: bool = False      # Load on-demand via search
    allowed_callers: List[str] = []  # Enable programmatic calling
    parallel_safe: bool = True       # Can run in parallel
    retry_safe: bool = True          # Safe to retry on failure
    cache_results: bool = False      # Cache results
    cache_ttl_seconds: int = 300     # Cache TTL
```

## Usage

### Python Backend

```python
from src.tools import register_all_tools, get_registry
from src.tools.search import ToolSearcher
from src.tools.programmatic import ProgrammaticToolCaller

# Initialize
registry = register_all_tools()
searcher = ToolSearcher(registry)
caller = ProgrammaticToolCaller(registry)

# Get API-ready tools (with deferred loading)
api_tools = registry.to_api_format(
    include_search_tool=True,
    include_code_execution=True,
    include_deferred=False
)

# Use beta header
headers = {"anthropic-beta": "advanced-tool-use-2025-11-20"}
```

### TypeScript Frontend

```typescript
import { createAdvancedToolClient, PROGRAMMATIC_TOOL_CONFIG } from '@/lib/tools';

// Create client
const client = createAdvancedToolClient({
  tools: myTools,
  enableSearch: true,
  enableCodeExecution: true,
});

// Get API tools
const apiTools = client.getAPITools();

// Use with Anthropic SDK
const response = await anthropic.beta.messages.create({
  betas: [client.getBetaHeader()],
  model: "claude-sonnet-4-5-20250929",
  tools: apiTools,
  messages: [...],
});
```

### Via Orchestrator

```python
from src.agents.orchestrator import OrchestratorAgent

orchestrator = OrchestratorAgent()

# Get tools for API
tools = orchestrator.get_api_tools()
beta_header = orchestrator.get_beta_header()

# Search for tools
results = orchestrator.search_tools("database query", limit=5)

# Load a specific tool
tool = orchestrator.load_tool("database.query")

# Execute with programmatic calling
context = orchestrator.create_execution_context()
results = await orchestrator.execute_programmatic_calls(context)

# Get context statistics
stats = orchestrator.get_context_stats()
# {
#   "total_tools": 15,
#   "loaded_tools": 2,
#   "deferred_tools": 13,
#   "estimated_saved_tokens": 6500,
#   "context_reduction_percent": 87
# }
```

## Context Savings

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Upfront tokens | 55,000 | 8,000 | 85% |
| Per-call tokens | 1,200 | 760 | 37% |
| Parameter accuracy | 72% | 90% | +18% |

## Best Practices

1. **Mark infrequently used tools as deferred**
   ```python
   config = ToolConfig(defer_loading=True)
   ```

2. **Enable programmatic calling for batch operations**
   ```python
   config = ToolConfig(
       allowed_callers=["code_execution_20250825"]
   )
   ```

3. **Add examples for complex parameters**
   ```python
   examples = [
       ToolExample(
           description="Complex query",
           input={"filters": {"status": "active", "role": "admin"}}
       )
   ]
   ```

4. **Use categories and keywords for better search**
   ```python
   categories = [ToolCategory.DATABASE, ToolCategory.API]
   keywords = ["query", "select", "filter", "database"]
   ```

5. **Monitor context usage**
   ```python
   stats = orchestrator.get_context_stats()
   logger.info(f"Saved {stats['estimated_saved_tokens']} tokens")
   ```

## API Reference

### Tool Search Response

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_xxx",
  "content": {
    "matchedTools": [
      {
        "name": "database.query",
        "description": "Execute a database query",
        "score": 0.95,
        "categories": ["database"],
        "keywords": ["query", "select", "sql"]
      }
    ],
    "totalMatches": 3
  }
}
```

### Code Execution Tool Call

```json
{
  "type": "tool_use",
  "id": "toolu_xxx",
  "name": "database.query",
  "input": {"table": "users", "limit": 10},
  "caller": {
    "type": "code_execution_20250825",
    "tool_id": "srvtoolu_xxx"
  }
}
```

## Error Handling

```python
try:
    result = await orchestrator.search_tools(query)
except Exception as e:
    logger.error("Tool search failed", error=str(e))
    # Fallback to loading all tools
    tools = orchestrator.get_api_tools(include_deferred=True)
```

## Related Skills

- `core/VERIFICATION.md` - Independent verification system
- `backend/LANGGRAPH.md` - LangGraph workflow integration
- `ORCHESTRATOR.md` - Master orchestration routing
