---
name: G-Pilot Google Provisioning
description: Protocol for setting up Google Cloud Projects and Workspace APIs for client-owned infrastructure.
---

# G-Pilot Google Provisioning Protocol

This protocol defines how to configure a Google Cloud Project (GCP) to interface with G-Pilot, whether managed by the platform or owned by a client.

## 1. Required APIs
To power the full G-Pilot "Ability Codex", the following APIs must be enabled in the GCP Console:
- **Generative AI API**: For Gemini-3, Imagen 3, and Video generation.
- **Google Slides API**: For automated presentation building.
- **Google Drive API**: For asset storage and retrieval.
- **Google Search Console API**: For site verification and SEO telemetry.
- **Cloud Run API**: For deploying custom agent runtimes.
- **Secret Manager API**: For secure vaulting of client-provided keys.

## 2. Service Account Setup
G-Pilot operates via a **Service Account** to ensure non-interactive, scheduled mission execution.
- **Role**: `Service Account Token Creator`, `Cloud Run Invoker`, `Storage Object Viewer/Admin`.
- **Key Type**: JSON (Must be stored as Base64 in G-Pilot's secure environment or encrypted in the UserProfile).

## 3. Workspace Delegration (Optional)
For deep integration (e.g., managing a client's specific Google Slides templates):
- **Domain-Wide Delegation**: Enable in the Google Workspace Admin console so the Service Account can impersonate authorized users.

## 4. G-Pilot Vault Integration
When a client pays for a premium tier, they gain access to **The Vault** in their Dashboard.
- **Action**: Client uploads their GCP Service Account JSON.
- **Storage**: G-Pilot encrypts this via AES-256 and stores it in the `UserProfile`.
- **Retrieval**: The `getGoogleAuth` utility automatically detects the client-specific key, allowing them to use their own quotas and project boundaries for mission execution.

## 5. Security Baselines
- **IP Restricted Access**: Ensure GCP firewall rules allow inbound traffic only from G-Pilot's static egress IPs.
- **Audit Logging**: Enable "Data Access" audit logs for Slides and Drive to maintain a full mission ledger on the client side.
