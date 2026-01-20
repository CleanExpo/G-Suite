---
name: NotebookLM Research
description: Deep research synthesis with audio overview generation
---

# NotebookLM Research Skill

NotebookLM-style research synthesis from multiple sources.

## Functions

### `createResearchNotebook`
Create a new research notebook from sources.

### `notebookLMResearch`
Perform deep research synthesis.

| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | string | Research topic |
| `sources` | ResearchSource[] | Source documents |
| `depth` | quick/standard/comprehensive | Analysis depth |
| `outputFormat` | summary/outline/detailed/podcast-script | Output format |
| `includeAudioOverview` | boolean | Generate audio summary |

### `notebookLMQuery`
Ask questions about a research corpus.

### `notebookLMAudioOverview`
Generate podcast-style audio overview.

## Usage

```typescript
const result = await notebookLMResearch('user_id', 'AI Agent Trends 2026', sources, {
  depth: 'comprehensive',
  outputFormat: 'detailed',
  includeAudioOverview: true
});
```

## Billing

| Operation | Cost |
|-----------|------|
| Quick Research | 25 PTS |
| Standard Research | 50 PTS |
| Comprehensive | 100 PTS |
| Audio Overview | +25 PTS |
