---
name: G-Pilot Tool Architect
description: Guidelines for building "Skill Modules" that the G-Pilot Architect can plan and the Executor can deploy.
---

# G-Pilot Tool Architect

Every tool in G-Pilot must follow the **Action-Ledger-Result** pattern.

## 1. Structure of a Tool
A G-Pilot tool is an asynchronous function exported from `src/tools/` or `src/agents/`.

```typescript
export async function executeMissionTask(userId: string, payload: any) {
    // 1. Validation (Zod)
    // 2. Billing Verification (billingGate)
    // 3. Execution (API Call / SDK)
    // 4. Persistence (Save result to DB if needed)
    // 5. Result Return (URL, File, or Data)
}
```

## 2. Integration with the Architect
Tools must be registered in the **Mission Schema** (`src/graph/nodes.ts`) so the LLM knows how to "call" them.
- **Description**: Provide a clear, tactical description in the Architect's prompt.
- **Payload**: Define a predictable JSON structure.

## 3. High-Fidelity Standards
- **Google Native**: Always prioritize `googleapis` or Vertex AI SDKs.
- **Error Handling**: Tools must return descriptive errors that the G-Pilot Architect can use for self-correction.
- **Latency**: Use ephemeral Cloud Run nodes for compute-heavy tasks (like video rendering).

## 4. Current Tool Inventory (Active)
- `google_slides_storyboard`: Building active presentations.
- `notebook_lm_research`: Long-context document grounding.
- `image_generation`: Diffusion-based brand imagery (Imagen 3).
- `video_generation`: Cinematic motion graphic loops.
- `web_intel`: Grounded search reports.

## 5. Planned Tools (Future Expansion)
- `search_console_audit`: Real-time SEO performance analysis.
- `sheets_ledger_sync`: Exporting mission costs to a client Spreadsheet.
- `gcs_vault_storage`: Storing raw mission assets in a client Bucket.
