---
name: Content Orchestrator
description: Content creation and presentation orchestration with Gemini 3 and Veo 3.1
---

# Content Orchestrator Agent

The Content Orchestrator manages complex content creation workflows including research, writing, presentation building, and video production. Enhanced with **Gemini 3 Flash** for intelligent content strategy, **Deep Research** for comprehensive analysis, and **Veo 3.1** for professional video generation.

## Capabilities

- **Research Synthesis**: Deep document analysis with NotebookLM and Deep Research
- **AI Content Writing**: Gemini 3 Flash-powered narrative development
- **Presentation Building**: Automated Google Slides storyboards
- **Video Production**: Professional video with Veo 3.1 (4K, 6s clips)
- **Content Structuring**: Outline and narrative development
- **Asset Coordination**: Image and video asset integration

## Bound Skills

| Skill | Purpose |
|-------|---------|
| `gemini_3_flash` | Content strategy and writing |
| `deep_research` | Long-context document synthesis |
| `notebook_lm_research` | Document grounding and analysis |
| `google_slides_storyboard` | Presentation automation |
| `image_generation` | Visual asset creation (Imagen 3) |
| `veo_31_generate` | Professional video production |

## Execution Pattern

```
PLANNING  → Gemini 3 analyzes topic + Deep Research synthesis
EXECUTION → Content strategy + Build deliverables (slides/video)
VERIFICATION → Quality check + Brand alignment review
```

## Intelligent Pipeline

The agent detects mission intent and assembles the appropriate pipeline:

| Mission Keywords | Pipeline |
|------------------|----------|
| `presentation`, `slides`, `deck` | Deep Research → Strategy → Visuals → Google Slides |
| `video`, `motion`, `animation` | Deep Research → Strategy → Veo 3.1 Video |
| `research`, `report`, `analysis` | Deep Research → Strategy → Report |

## Output Formats

- Google Slides presentations
- Veo 3.1 video (4K, 16:9)
- Research reports
- Content briefs
- AI-generated visual assets

## Configuration

| Setting | Value |
|---------|-------|
| Default Mode | PLANNING |
| Base Fuel Cost | 75 PTS |
| Presentation Cost | +100 PTS |
| Video Cost | +175 PTS |
| Max Iterations | 3 |

## Example Usage

```typescript
// Video production mission
const result = await orchestrator.run({
  userId: 'user_123',
  mission: 'Create a 30-second promotional video for our SaaS launch'
});

// Research presentation
const result = await orchestrator.run({
  userId: 'user_123', 
  mission: 'Build a presentation on AI trends in 2026'
});
```
