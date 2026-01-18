---
name: G-Pilot Fleet Operations
description: Protocol for orchestrating multi-agent missions using Google Workspace and Gemini reasoning.
---

# G-Pilot Fleet Operations

This protocol governs how the G-Pilot fleet (Architect, Billing, Executor) interacts with Google services to complete user missions.

## 1. The Mission Lifecycle
1.  **Ingestion**: User request is received via the Dashboard.
2.  **Architectural Layout**: The Architect Node (Gemini-3 Thinking) converts the text into a **Mission SPEC**.
3.  **Fuel Check**: The Billing Node deducts credits based on the tool's cost factor.
4.  **Deployment**: The Executor Node initializes the safe Google Auth bridge and triggers the specific tool (Slides, Sheets, Intel).
5.  **Finalization**: Results are beamed back to the user as a secure link (e.g., `docs.google.com/...`).

## 2. Multi-Tool Stacking
G-Pilot supports "Chained Missions":
- **Example**: `Intel Report` -> `Slide Deck`. The output of the research agent is used as the `payload` for the Slides agent.

## 3. High-Security Bridging (The Vault)
- **Credential Isolation**: Tools must never store client credentials in the environment. They must fetch, use, and cleanup (ephemeral).
- **Domain Sovereignty**: If a client uses their own console, all mission assets (Slides, Sheets) are owned by *their* Service Account, not G-Pilot.

## 4. Performance Tuning
- **Gemini Grounding**: Always enable "Google Search Grounding" for `web_intel` tools to ensure accuracy.
- **Batch Processing**: Use `batchUpdate` for Slides and Sheets to reduce API round-trips and handle 50+ slides efficiently.
