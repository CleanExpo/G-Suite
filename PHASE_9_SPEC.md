# PHASE 9 SPECIFICATION
**G-Pilot v9.0-9.3 Technical Requirements**

> Detailed technical specification for Phase 9 implementation: Streaming, Vault, Telemetry, and Advanced Orchestration

**Version**: 9.0.0
**Status**: PRE-IMPLEMENTATION
**Approval Required**: YES
**Start Date**: TBD (After approval)
**Target Completion**: 10-12 weeks

---

## DOCUMENT PURPOSE

This specification defines the **technical requirements, architecture decisions, and acceptance criteria** for Phase 9 implementation. All stakeholders must review and approve this document before any code is written.

**This document answers**:
- ✅ What exactly needs to be built?
- ✅ Why are we building it this way?
- ✅ How will we verify it works?
- ✅ What are the risks and mitigations?
- ✅ What are the dependencies and blockers?

---

## TABLE OF CONTENTS

1. [Phase 9.0: Streaming Sovereignty - Technical Spec](#phase-90-streaming-sovereignty---technical-spec)
2. [Phase 9.1: Vault Hardening - Technical Spec](#phase-91-vault-hardening---technical-spec)
3. [Phase 9.2: Granular Telemetry - Technical Spec](#phase-92-granular-telemetry---technical-spec)
4. [Phase 9.3: Advanced Orchestration - Technical Spec](#phase-93-advanced-orchestration---technical-spec)
5. [Cross-Phase Technical Decisions](#cross-phase-technical-decisions)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Strategy](#deployment-strategy)
8. [Rollback Procedures](#rollback-procedures)
9. [Approval & Sign-Off](#approval--sign-off)

---

## PHASE 9.0: STREAMING SOVEREIGNTY - TECHNICAL SPEC

### 9.0.1 Problem Statement

**Current State**:
- Custom streaming protocol using `ReadableStream` with `LOG:/RESULT:/ERROR:` prefixes
- Manual stream parsing on client (`MissionModal.tsx` has 50+ lines of stream handling)
- No standardized error recovery or reconnection logic
- No token usage tracking
- No support for tool call streaming

**Issues**:
1. **Non-standard protocol**: Custom format not compatible with AI tooling ecosystem
2. **Client complexity**: Each client must implement custom parser
3. **No resilience**: Network errors cause stream failure with no recovery
4. **Limited observability**: Cannot track token usage or cost in real-time
5. **Maintenance burden**: Must maintain custom streaming logic

**Business Impact**:
- Developer friction when integrating with G-Pilot API
- Higher support costs due to streaming issues
- Cannot leverage ecosystem tools (Vercel AI SDK UI components)
- Limited analytics on token consumption

### 9.0.2 Proposed Solution

**Adopt Vercel AI SDK** as the streaming standard for all agent interactions.

**Why Vercel AI SDK?**
1. **Industry Standard**: Used by thousands of production apps
2. **Battle-Tested**: Proven error handling, reconnection, retry logic
3. **Rich Ecosystem**: UI components (`useChat`, `useCompletion`, `useAssistant`)
4. **Token Tracking**: Built-in usage monitoring
5. **Tool Streaming**: Native support for streaming tool calls
6. **TypeScript Native**: Full type safety

**Architecture Decision**:
```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  useCompletion() Hook (Vercel AI SDK)                 │  │
│  │  • Handles streaming                                  │  │
│  │  • Auto-reconnect on failure                          │  │
│  │  • Loading states                                     │  │
│  │  • Error boundaries                                   │  │
│  └─────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTPS/SSE
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Next.js API)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  POST /api/agents                                     │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  streamText() or streamObject()                  │ │  │
│  │  │  • Model: Gemini 2.0 Flash                       │ │  │
│  │  │  • Stream Mission Overseer logs                  │ │  │
│  │  │  • Track token usage                             │ │  │
│  │  │  • Return structured response                    │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └─────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              MISSION OVERSEER (Orchestrator)                 │
│  • Execute agent plan                                        │
│  • Stream logs via context.onStream()                        │
│  • Return structured TaskOutput                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.0.3 Technical Requirements

#### Requirement 9.0.1: Server-Side Streaming API
**Priority**: P0 (Blocking)
**Assignee**: Backend Developer

**Specification**:
```typescript
// src/app/api/agents/route.ts

import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export async function POST(request: NextRequest) {
  const { mission, config } = await request.json();

  // Initialize agents
  await initializeAgents();
  const overseer = AgentRegistry.get('mission-overseer');

  // Collect logs from overseer
  const logs: string[] = [];
  const context: AgentContext = {
    userId: user.id,
    mission,
    config,
    onStream: (log) => logs.push(log)
  };

  // Execute mission in background
  const executionPromise = (async () => {
    const plan = await overseer.plan(context);
    const result = await overseer.execute(plan, context);
    return { plan, result };
  })();

  // Stream using Vercel AI SDK
  const result = await streamText({
    model: createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY
    })('gemini-2.0-flash'),

    prompt: mission,

    experimental_transform(stream) {
      return stream.pipeThrough(
        new TransformStream({
          async transform(chunk, controller) {
            // Inject overseer logs
            while (logs.length > 0) {
              const log = logs.shift();
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ type: 'log', content: log })}\n\n`)
              );
            }

            // Forward LLM chunk
            controller.enqueue(chunk);
          }
        })
      );
    },

    onFinish: async ({ usage, text }) => {
      // Wait for mission to complete
      const { plan, result } = await executionPromise;

      // Persist to database
      await prisma.mission.create({
        data: {
          userId: user.id,
          status: 'COMPLETED',
          plan,
          result,
          cost: usage.totalTokens, // Convert to credits
          createdAt: new Date()
        }
      });

      console.log('Mission completed:', {
        usage,
        cost: usage.totalTokens
      });
    }
  });

  return result.toDataStreamResponse();
}
```

**Acceptance Criteria**:
- [ ] API endpoint uses `streamText()` from Vercel AI SDK
- [ ] Mission Overseer logs injected into stream
- [ ] Token usage tracked via `onFinish` callback
- [ ] Mission persisted to database on completion
- [ ] Response format compatible with `useCompletion()` hook
- [ ] Error handling for network failures
- [ ] Unit tests pass with 90% coverage

**Testing**:
```typescript
// tests/unit/api/agents.test.ts
describe('POST /api/agents (Vercel AI SDK)', () => {
  it('should stream mission logs and LLM response', async () => {
    const response = await fetch('/api/agents', {
      method: 'POST',
      body: JSON.stringify({
        mission: 'Generate blog post',
        config: {}
      })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');

    const reader = response.body.getReader();
    const { value } = await reader.read();

    expect(value).toBeDefined();
  });

  it('should track token usage', async () => {
    const response = await makeRequest();
    const result = await parseStream(response);

    expect(result.usage).toBeDefined();
    expect(result.usage.totalTokens).toBeGreaterThan(0);
  });
});
```

---

#### Requirement 9.0.2: Client-Side Hook Integration
**Priority**: P0 (Blocking)
**Assignee**: Frontend Developer

**Specification**:
```typescript
// src/components/MissionModal.tsx

'use client';

import { useCompletion } from 'ai/react';
import { useState } from 'react';

export function MissionModal() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    completion,      // Streamed text
    isLoading,       // Loading state
    error,           // Error object
    complete,        // Function to trigger completion
    stop,            // Function to stop streaming
  } = useCompletion({
    api: '/api/agents',
    onResponse: (response) => {
      console.log('Stream started:', response.status);
    },
    onFinish: (prompt, completion) => {
      console.log('Stream finished');
      toast.success('Mission completed!');
    },
    onError: (error) => {
      console.error('Stream error:', error);
      toast.error(`Mission failed: ${error.message}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mission = formData.get('mission') as string;

    await complete(mission);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Launch Mission</Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Mission Control</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Textarea
            name="mission"
            placeholder="Describe your mission..."
            disabled={isLoading}
            className="min-h-[100px]"
          />

          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Executing...' : 'Launch'}
            </Button>
            {isLoading && (
              <Button variant="outline" onClick={stop}>
                Stop
              </Button>
            )}
          </div>
        </form>

        {/* Streaming Output */}
        <div className="mt-6 border rounded-lg p-4 bg-slate-900">
          <div className="font-mono text-sm text-slate-100 whitespace-pre-wrap">
            {completion}
            {isLoading && (
              <span className="inline-block animate-pulse ml-1">▊</span>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

**Acceptance Criteria**:
- [ ] Component uses `useCompletion()` hook
- [ ] Loading state shows spinner + "Executing..."
- [ ] Stop button terminates stream
- [ ] Typing indicator animates during streaming
- [ ] Error messages display in alert
- [ ] Auto-scroll to bottom of logs
- [ ] Responsive design (mobile + desktop)
- [ ] Accessibility: keyboard navigation works

**Testing**:
```typescript
// tests/e2e/mission-streaming.spec.ts
import { test, expect } from '@playwright/test';

test('should stream mission logs in real-time', async ({ page }) => {
  await page.goto('/dashboard');

  // Open mission modal
  await page.click('button:has-text("Launch Mission")');

  // Enter mission
  await page.fill('textarea[name="mission"]', 'Generate test blog post');
  await page.click('button:has-text("Launch")');

  // Verify streaming starts
  await expect(page.locator('text=Executing...')).toBeVisible();

  // Verify log output appears
  await expect(page.locator('.font-mono').first()).toBeVisible({ timeout: 5000 });

  // Verify completion
  await expect(page.locator('text=Mission completed')).toBeVisible({ timeout: 30000 });
});
```

---

#### Requirement 9.0.3: Performance Requirements
**Priority**: P0 (Blocking)

**Metrics**:
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **First Byte Latency** | <100ms (p95) | Time to first stream chunk |
| **Streaming Throughput** | >10 KB/s | Bytes per second average |
| **Token Accuracy** | >99% | Actual tokens vs. reported tokens |
| **Error Rate** | <0.1% | Failed streams / total streams |
| **Reconnection Time** | <2s | Time to reconnect after failure |

**Load Testing**:
```bash
# Artillery load test config
artillery run load-test.yml

# load-test.yml
config:
  target: "https://gpilot.com"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requests/second
      name: "Warm up"
    - duration: 300
      arrivalRate: 50  # 50 requests/second
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100 # 100 requests/second
      name: "Peak load"

scenarios:
  - name: "Stream mission"
    flow:
      - post:
          url: "/api/agents"
          json:
            mission: "Test mission"
            config: {}
          expect:
            - statusCode: 200
            - contentType: "text/event-stream"
```

**Acceptance Criteria**:
- [ ] p95 latency <100ms under normal load (10 RPS)
- [ ] p95 latency <500ms under peak load (100 RPS)
- [ ] Zero stream failures under sustained load (300s)
- [ ] Automatic reconnection within 2s of network failure
- [ ] Memory usage stable (<500MB per API instance)

---

#### Requirement 9.0.4: Backward Compatibility
**Priority**: P1 (Important)

**Constraint**: Existing integrations must continue working during transition period.

**Solution**: Feature flag with dual protocol support

```typescript
// src/app/api/agents/route.ts

export async function POST(request: NextRequest) {
  const { mission, config, protocol } = await request.json();

  // Check protocol preference
  const useVercelAI = protocol === 'vercel-ai' ||
                      process.env.FEATURE_VERCEL_AI === 'true';

  if (useVercelAI) {
    // New Vercel AI SDK implementation
    return await streamWithVercelAI(mission, config);
  } else {
    // Legacy custom protocol
    return await streamWithCustomProtocol(mission, config);
  }
}
```

**Migration Strategy**:
1. **Week 1-2**: Deploy dual protocol support (flag OFF)
2. **Week 3**: Enable flag for 10% of users (canary)
3. **Week 4**: Enable flag for 50% of users
4. **Week 5**: Enable flag for 100% of users
5. **Week 6**: Remove legacy protocol code

**Acceptance Criteria**:
- [ ] Both protocols work simultaneously
- [ ] Feature flag toggles between protocols
- [ ] No breaking changes for existing clients
- [ ] Migration guide published
- [ ] Legacy protocol deprecation notice sent

---

### 9.0.5 Risks & Mitigations

#### Risk 1: Vercel AI SDK Incompatibility with Gemini
**Probability**: Low | **Impact**: High

**Mitigation**:
- [x] Week 0: Prototype integration with Gemini model
- [ ] Test all streaming features (text, tools, usage tracking)
- [ ] Fallback plan: Enhance custom protocol with retry logic

**Validation**:
```typescript
// Prototype test
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY
});

const result = await streamText({
  model: google('gemini-2.0-flash'),
  prompt: 'Test prompt'
});

console.log('Streaming works:', result);
```

#### Risk 2: Performance Regression
**Probability**: Medium | **Impact**: Medium

**Mitigation**:
- [ ] Benchmark current streaming performance (baseline)
- [ ] Load test Vercel AI SDK implementation
- [ ] Compare p95 latency before/after
- [ ] Rollback if latency increases >20%

#### Risk 3: Client Breaking Changes
**Probability**: Low | **Impact**: High

**Mitigation**:
- [ ] Maintain backward compatibility via feature flag
- [ ] Publish migration guide 2 weeks before cutover
- [ ] Provide code examples for all client types
- [ ] Monitor error rates during rollout

---

### 9.0.6 Dependencies

**External**:
- `ai` npm package (already installed: v6.0.49 ✅)
- `@ai-sdk/google` (needs installation)
- Google AI API key (configured ✅)

**Internal**:
- Mission Overseer must support streaming via `context.onStream()` ✅
- PrismaMissionAdapter for persistence ✅
- User authentication for API access ✅

**Blocked By**: None (ready to start)

**Blocks**: Phase 9.3 (parallel execution needs reliable streaming)

---

### 9.0.7 Success Criteria

**Must Have (P0)**:
- ✅ API uses Vercel AI SDK `streamText()`
- ✅ Client uses `useCompletion()` hook
- ✅ Token usage tracked
- ✅ p95 latency <100ms
- ✅ Zero protocol errors in 100 missions

**Should Have (P1)**:
- ✅ Backward compatibility maintained
- ✅ Migration guide published
- ✅ Performance benchmarks documented

**Nice to Have (P2)**:
- ⭕ Tool call streaming (Phase 9.3+)
- ⭕ Streaming UI components (chat bubbles, etc.)
- ⭕ Real-time cost display during streaming

---

## PHASE 9.1: VAULT HARDENING - TECHNICAL SPEC

### 9.1.1 Problem Statement

**Current State**:
- Vault UI exists at `/dashboard/vault`
- "Rotate Keys" button is non-functional (UI only)
- No backend key rotation logic
- Single encryption key version (v1)
- No key rotation audit trail

**Issues**:
1. **Security Risk**: Cannot rotate compromised keys
2. **Compliance Gap**: Key rotation required for SOC 2, ISO 27001
3. **Operational Risk**: No recovery if master key is compromised
4. **User Trust**: "Military-Grade Encryption" claim not fully operational

**Business Impact**:
- Cannot pass enterprise security audits
- Risk of credential exposure if key compromised
- Customer churn if security breach occurs
- Legal liability for data exposure

### 9.1.2 Proposed Solution

**Implement versioned key rotation** with zero-downtime migration.

**Architecture Decision**:
```
┌─────────────────────────────────────────────────────────────┐
│                    USER INITIATES ROTATION                   │
│         (Clicks "Rotate Keys" in Vault UI)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ POST /api/vault/rotate
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              VAULT ROTATION SERVICE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Generate new master key (32 bytes)               │  │
│  │  2. Fetch user profile with encrypted data           │  │
│  │  3. Decrypt ALL keys using OLD master key            │  │
│  │  4. Re-encrypt ALL keys using NEW master key         │  │
│  │  5. Update keyVersion (v1 → v2)                      │  │
│  │  6. Store new master key in Firebase                 │  │
│  │  7. Log rotation event (audit trail)                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    RESULT                                    │
│  • All keys re-encrypted with new master key                │
│  • KeyVersion incremented                                   │
│  • Rotation logged in keyRotationHistory                    │
│  • Old master key retained for 30 days (recovery)           │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Principles**:
1. **Zero Downtime**: Old keys decrypt existing data, new keys encrypt new data
2. **Versioning**: Track key version in database
3. **Audit Trail**: Log every rotation event
4. **Graceful Degradation**: If rotation fails, rollback automatically
5. **Rate Limiting**: Prevent abuse (1 rotation per hour per user)

### 9.1.3 Technical Requirements

#### Requirement 9.1.1: Database Schema Changes
**Priority**: P0 (Blocking)

**Schema Migration**:
```prisma
// prisma/schema.prisma

model UserProfile {
  id                  String   @id @default(uuid())
  clerkId             String   @unique

  // Existing encrypted fields
  googleApiKey        String?
  shopifyAccessToken  String?
  redditApiKey        String?
  socialApiKeys       Json?

  // NEW: Key rotation support
  keyVersion          Int      @default(1)
  keyRotationHistory  Json?    // [{ version, rotatedAt, rotatedBy, reason }]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Migration Command**:
```bash
npx prisma migrate dev --name add_key_rotation_fields
```

**Acceptance Criteria**:
- [ ] `keyVersion` field added (integer, default 1)
- [ ] `keyRotationHistory` field added (JSON array)
- [ ] Migration runs without errors
- [ ] Existing data preserved
- [ ] Schema documented

**Testing**:
```typescript
// tests/unit/prisma/schema.test.ts
describe('UserProfile schema', () => {
  it('should have keyVersion field with default 1', async () => {
    const profile = await prisma.userProfile.create({
      data: { clerkId: 'test-user' }
    });

    expect(profile.keyVersion).toBe(1);
  });

  it('should support keyRotationHistory as JSON', async () => {
    const profile = await prisma.userProfile.create({
      data: {
        clerkId: 'test-user',
        keyRotationHistory: [
          { version: 1, rotatedAt: new Date().toISOString() }
        ]
      }
    });

    expect(Array.isArray(profile.keyRotationHistory)).toBe(true);
  });
});
```

---

#### Requirement 9.1.2: Encryption Service Enhancement
**Priority**: P0 (Blocking)

**New Functions**:
1. `rotateEncryptionKeys(userId: string): Promise<RotationResult>`
2. `encrypt(plaintext: string, masterKey: Buffer, version: number): EncryptedData`
3. `decrypt(ciphertext: EncryptedData, masterKey: Buffer): string`
4. `getMasterKey(userId: string, version: number): Promise<Buffer>`
5. `storeVersionedKey(userId: string, version: number, key: Buffer): Promise<void>`

**Type Definitions**:
```typescript
// src/lib/encryption.ts

interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: number;
}

interface RotationResult {
  success: boolean;
  newVersion: number;
  rotatedAt: string;
  keysRotated: string[];  // List of field names
  duration: number;       // Milliseconds
}

interface MasterKeyStorage {
  userId: string;
  version: number;
  encryptedKey: string;  // Master key encrypted with HSM key
  createdAt: string;
  expiresAt: string;     // 30 days from creation
}
```

**Implementation**:
```typescript
// src/lib/encryption.ts

import crypto from 'crypto';
import { prisma } from './prisma';
import admin from 'firebase-admin';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

/**
 * Rotate all encryption keys for a user
 */
export async function rotateEncryptionKeys(
  userId: string
): Promise<RotationResult> {
  const startTime = Date.now();

  // 1. Generate new master key
  const newMasterKey = crypto.randomBytes(KEY_LENGTH);

  // 2. Fetch user profile
  const profile = await prisma.userProfile.findUnique({
    where: { clerkId: userId }
  });

  if (!profile) {
    throw new Error('User profile not found');
  }

  const currentVersion = profile.keyVersion;
  const newVersion = currentVersion + 1;

  // 3. Get old master key
  const oldMasterKey = await getMasterKey(userId, currentVersion);

  // 4. Decrypt all encrypted fields
  const decryptedData: Record<string, string | null> = {};
  const fieldsToRotate = [
    'googleApiKey',
    'shopifyAccessToken',
    'redditApiKey',
    'socialApiKeys'
  ];

  for (const field of fieldsToRotate) {
    const encryptedValue = profile[field];
    if (encryptedValue) {
      try {
        decryptedData[field] = decrypt(
          JSON.parse(encryptedValue),
          oldMasterKey
        );
      } catch (error) {
        console.error(`Failed to decrypt ${field}:`, error);
        throw new Error(`Key rotation failed: cannot decrypt ${field}`);
      }
    } else {
      decryptedData[field] = null;
    }
  }

  // 5. Re-encrypt all fields with new key
  const reencryptedData: Record<string, string | null> = {};
  for (const field of fieldsToRotate) {
    const plaintext = decryptedData[field];
    if (plaintext) {
      const encrypted = encrypt(plaintext, newMasterKey, newVersion);
      reencryptedData[field] = JSON.stringify(encrypted);
    } else {
      reencryptedData[field] = null;
    }
  }

  // 6. Store new master key
  await storeVersionedKey(userId, newVersion, newMasterKey);

  // 7. Update database
  const rotationRecord = {
    version: newVersion,
    rotatedAt: new Date().toISOString(),
    rotatedBy: userId,
    reason: 'manual_rotation'
  };

  await prisma.userProfile.update({
    where: { clerkId: userId },
    data: {
      ...reencryptedData,
      keyVersion: newVersion,
      keyRotationHistory: {
        push: rotationRecord
      }
    }
  });

  // 8. Schedule old key deletion (30 days)
  await scheduleKeyDeletion(userId, currentVersion, 30);

  const duration = Date.now() - startTime;

  return {
    success: true,
    newVersion,
    rotatedAt: rotationRecord.rotatedAt,
    keysRotated: fieldsToRotate,
    duration
  };
}

/**
 * Encrypt plaintext with versioned key
 */
export function encrypt(
  plaintext: string,
  masterKey: Buffer,
  version: number
): EncryptedData {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    version
  };
}

/**
 * Decrypt ciphertext using versioned key
 */
export function decrypt(
  data: EncryptedData,
  masterKey: Buffer
): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    masterKey,
    Buffer.from(data.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

  let plaintext = decipher.update(data.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Get master key from Firebase for specific version
 */
export async function getMasterKey(
  userId: string,
  version: number
): Promise<Buffer> {
  const db = admin.firestore();
  const doc = await db
    .collection('master_keys')
    .doc(`${userId}_v${version}`)
    .get();

  if (!doc.exists) {
    throw new Error(`Master key v${version} not found for user ${userId}`);
  }

  const data = doc.data() as MasterKeyStorage;

  // Decrypt master key using HSM key (from env)
  const hsmKey = Buffer.from(process.env.HSM_KEY!, 'hex');
  const encryptedKeyData: EncryptedData = JSON.parse(data.encryptedKey);

  return Buffer.from(decrypt(encryptedKeyData, hsmKey), 'hex');
}

/**
 * Store versioned master key in Firebase
 */
export async function storeVersionedKey(
  userId: string,
  version: number,
  masterKey: Buffer
): Promise<void> {
  const db = admin.firestore();

  // Encrypt master key with HSM key
  const hsmKey = Buffer.from(process.env.HSM_KEY!, 'hex');
  const encryptedKey = encrypt(
    masterKey.toString('hex'),
    hsmKey,
    version
  );

  const keyData: MasterKeyStorage = {
    userId,
    version,
    encryptedKey: JSON.stringify(encryptedKey),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  await db
    .collection('master_keys')
    .doc(`${userId}_v${version}`)
    .set(keyData);
}

/**
 * Schedule old key deletion after grace period
 */
async function scheduleKeyDeletion(
  userId: string,
  version: number,
  daysFromNow: number
): Promise<void> {
  // Use Cloud Tasks or similar for scheduled deletion
  // For now, just log
  console.log(`Scheduled deletion of key v${version} for ${userId} in ${daysFromNow} days`);
}
```

**Acceptance Criteria**:
- [ ] `rotateEncryptionKeys()` completes in <5 seconds
- [ ] All encrypted fields re-encrypted successfully
- [ ] Old keys can decrypt existing data (test with pre-rotation data)
- [ ] New keys encrypt new data
- [ ] Key version incremented correctly
- [ ] Rotation history logged
- [ ] Unit tests pass (>90% coverage)
- [ ] Integration tests pass (full rotation flow)

**Testing**:
```typescript
// tests/unit/lib/encryption.test.ts

describe('Key Rotation', () => {
  it('should rotate keys without data loss', async () => {
    // Setup: Store data with v1 key
    const userId = 'test-user';
    const originalData = 'sk-test-api-key-12345';

    await storeApiKey(userId, 'googleApiKey', originalData);

    // Action: Rotate keys
    const result = await rotateEncryptionKeys(userId);

    // Assertions
    expect(result.success).toBe(true);
    expect(result.newVersion).toBe(2);
    expect(result.duration).toBeLessThan(5000);

    // Verify data still accessible
    const retrievedData = await getApiKey(userId, 'googleApiKey');
    expect(retrievedData).toBe(originalData);
  });

  it('should support multi-version decryption', async () => {
    // Encrypt with v1 key
    const v1Key = crypto.randomBytes(32);
    const data = encrypt('secret', v1Key, 1);

    // Can decrypt with v1 key
    const decrypted = decrypt(data, v1Key);
    expect(decrypted).toBe('secret');
  });

  it('should fail gracefully on corruption', async () => {
    const corrupted: EncryptedData = {
      ciphertext: 'invalid',
      iv: 'invalid',
      authTag: 'invalid',
      version: 1
    };

    await expect(async () => {
      decrypt(corrupted, crypto.randomBytes(32));
    }).rejects.toThrow();
  });
});
```

---

#### Requirement 9.1.3: API Endpoint
**Priority**: P0 (Blocking)

**Specification**:
```typescript
// src/app/api/vault/rotate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { rotateEncryptionKeys } from '@/lib/encryption';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Rate limit check (1 rotation per hour)
    const rateLimitKey = `key-rotation:${user.id}`;
    const allowed = await checkRateLimit(rateLimitKey, {
      maxRequests: 1,
      windowMs: 60 * 60 * 1000 // 1 hour
    });

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'You can only rotate keys once per hour. Please try again later.',
          retryAfter: 3600 // seconds
        },
        { status: 429 }
      );
    }

    // 3. Perform rotation
    const result = await rotateEncryptionKeys(user.id);

    // 4. Log audit event
    console.log('Key rotation completed:', {
      userId: user.id,
      version: result.newVersion,
      duration: result.duration
    });

    // 5. Return success response
    return NextResponse.json({
      success: true,
      newVersion: result.newVersion,
      rotatedAt: result.rotatedAt,
      keysRotated: result.keysRotated.length,
      duration: result.duration,
      message: 'Encryption keys rotated successfully'
    });

  } catch (error: any) {
    console.error('Key rotation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Key rotation failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
```

**Rate Limiting Implementation**:
```typescript
// src/lib/rate-limit.ts

import { kv } from '@vercel/kv'; // or use Redis

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<boolean> {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / config.windowMs)}`;

  const count = await kv.incr(windowKey);
  await kv.expire(windowKey, Math.ceil(config.windowMs / 1000));

  return count <= config.maxRequests;
}
```

**Acceptance Criteria**:
- [ ] Endpoint returns 200 on success
- [ ] Endpoint returns 429 if rate limit exceeded
- [ ] Endpoint returns 401 if unauthorized
- [ ] Endpoint returns 500 on rotation failure with details
- [ ] Response includes new key version
- [ ] Response includes rotation timestamp
- [ ] Audit log entry created
- [ ] API documented in SPEC.md

**Testing**:
```typescript
// tests/integration/api/vault.test.ts

describe('POST /api/vault/rotate', () => {
  it('should rotate keys successfully', async () => {
    const response = await fetch('/api/vault/rotate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.newVersion).toBe(2);
    expect(data.duration).toBeLessThan(5000);
  });

  it('should enforce rate limit', async () => {
    // First request succeeds
    const r1 = await fetch('/api/vault/rotate', { method: 'POST' });
    expect(r1.status).toBe(200);

    // Second request within 1 hour fails
    const r2 = await fetch('/api/vault/rotate', { method: 'POST' });
    expect(r2.status).toBe(429);

    const data = await r2.json();
    expect(data.retryAfter).toBe(3600);
  });

  it('should return 401 if unauthorized', async () => {
    const response = await fetch('/api/vault/rotate', {
      method: 'POST'
      // No auth header
    });

    expect(response.status).toBe(401);
  });
});
```

---

#### Requirement 9.1.4: Vault UI Integration
**Priority**: P0 (Blocking)

**Updates to Existing UI**:
```typescript
// src/app/dashboard/vault/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RotationHistory {
  version: number;
  rotatedAt: string;
  rotatedBy: string;
  reason: string;
}

export default function VaultPage() {
  const [keyVersion, setKeyVersion] = useState(1);
  const [rotating, setRotating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rotationHistory, setRotationHistory] = useState<RotationHistory[]>([]);

  useEffect(() => {
    // Fetch current key version and history
    async function loadVaultData() {
      const response = await fetch('/api/vault/status');
      const data = await response.json();

      setKeyVersion(data.keyVersion);
      setRotationHistory(data.rotationHistory || []);
    }

    loadVaultData();
  }, []);

  const handleRotate = async () => {
    setShowConfirm(false);
    setRotating(true);

    try {
      const response = await fetch('/api/vault/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();

        if (response.status === 429) {
          throw new Error(`Rate limit exceeded. ${error.message}`);
        }

        throw new Error(error.details || 'Rotation failed');
      }

      const result = await response.json();
      setKeyVersion(result.newVersion);

      toast.success(
        `Keys rotated successfully! New version: v${result.newVersion}`,
        { duration: 5000 }
      );

      // Reload history
      const statusResponse = await fetch('/api/vault/status');
      const statusData = await statusResponse.json();
      setRotationHistory(statusData.rotationHistory || []);

    } catch (error: any) {
      toast.error(`Rotation failed: ${error.message}`, {
        duration: 10000
      });
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">The Vault</h1>

      {/* Key Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Encryption Keys</CardTitle>
          <CardDescription>
            Military-Grade AES-256-GCM Encryption
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Key Version</p>
                <p className="text-2xl font-mono font-bold">v{keyVersion}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Last Rotated</p>
                <p className="text-sm">
                  {rotationHistory[0]?.rotatedAt
                    ? new Date(rotationHistory[0].rotatedAt).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={rotating}
                variant="destructive"
                size="lg"
              >
                {rotating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rotating Keys...
                  </>
                ) : (
                  'Rotate Keys'
                )}
              </Button>

              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ Key rotation can only be performed once per hour
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rotation History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Rotation History</CardTitle>
          <CardDescription>
            Audit trail of all key rotations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Rotated At</TableHead>
                <TableHead>Rotated By</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rotationHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No rotation history yet
                  </TableCell>
                </TableRow>
              ) : (
                rotationHistory.map((record) => (
                  <TableRow key={record.version}>
                    <TableCell className="font-mono">v{record.version}</TableCell>
                    <TableCell>
                      {new Date(record.rotatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{record.rotatedBy}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.reason}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate Encryption Keys?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate new encryption keys and re-encrypt all your stored API keys.
              This process is <strong>irreversible</strong> and may take up to 5 seconds.

              <br /><br />

              <strong>What happens:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All encrypted credentials will be re-encrypted</li>
                <li>Key version will increment (v{keyVersion} → v{keyVersion + 1})</li>
                <li>Old keys retained for 30 days (recovery period)</li>
                <li>This action will be logged in the audit trail</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRotate}>
              Rotate Keys
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] "Rotate Keys" button triggers confirmation dialog
- [ ] Confirmation dialog explains consequences clearly
- [ ] Loading state shows during rotation (spinner + disabled button)
- [ ] Success toast displays new key version
- [ ] Error toast displays clear error message
- [ ] Key version updates in UI after rotation
- [ ] Rotation history table updates automatically
- [ ] Rate limit message shown clearly
- [ ] Responsive design works on mobile

---

### 9.1.5 Success Criteria

**Must Have (P0)**:
- ✅ Key rotation completes in <5 seconds
- ✅ Zero data loss during rotation (100% success rate)
- ✅ Old keys decrypt existing data (backward compatibility)
- ✅ New keys encrypt new data (forward progress)
- ✅ Audit log captures all rotation events
- ✅ Rate limit enforced (1/hour per user)

**Should Have (P1)**:
- ✅ Rotation history displayed in UI
- ✅ Confirmation dialog before rotation
- ✅ Error messages user-friendly
- ✅ Documentation updated

**Nice to Have (P2)**:
- ⭕ Automatic rotation scheduling (e.g., every 90 days)
- ⭕ Email notification on rotation
- ⭕ Export rotation audit trail to CSV

---

## PHASE 9.2: GRANULAR TELEMETRY - TECHNICAL SPEC

### 9.2.1 Problem Statement

**Current State**:
- Mission cost tracked as single integer (`cost` field in Mission table)
- No breakdown by agent
- Cannot identify which agents are cost-inefficient
- No visibility into cost distribution

**Issues**:
1. **Lack of Transparency**: Users don't know which agents consume most credits
2. **No Optimization**: Cannot identify expensive agents
3. **Limited Analytics**: No cost trending or forecasting
4. **Budget Planning**: Hard to allocate budgets per agent type

**Business Impact**:
- User complaints about unexpected costs
- Cannot optimize agent selection
- No data for pricing decisions
- Limited upsell opportunities (no usage insights)

### 9.2.2 Proposed Solution

**Add per-agent cost tracking** with analytics dashboard.

**Data Model**:
```json
{
  "missionId": "mission-123",
  "totalCost": 420,
  "agentCosts": {
    "seo-analyst": 200,
    "content-orchestrator": 220
  },
  "breakdown": [
    {
      "agent": "seo-analyst",
      "cost": 200,
      "percentage": 47.6,
      "duration": 12000,
      "tokens": {
        "prompt": 1500,
        "completion": 3500,
        "total": 5000
      }
    },
    {
      "agent": "content-orchestrator",
      "cost": 220,
      "percentage": 52.4,
      "duration": 15000,
      "tokens": {
        "prompt": 2000,
        "completion": 4000,
        "total": 6000
      }
    }
  ]
}
```

### 9.2.3 Technical Requirements

#### Requirement 9.2.1: Database Schema Extension
**Priority**: P0 (Blocking)

**Schema Changes**:
```prisma
// prisma/schema.prisma

model Mission {
  id         String   @id @default(uuid())
  status     String
  plan       Json?
  result     Json?
  audit      Json?
  cost       Int      // Total cost (sum of agentCosts)

  // NEW: Per-agent cost tracking
  agentCosts Json?    // { "agent-name": cost, ... }

  userId     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Migration**:
```bash
npx prisma migrate dev --name add_agent_costs_tracking
```

**Acceptance Criteria**:
- [ ] `agentCosts` field added (JSON object)
- [ ] Migration runs without errors
- [ ] Existing missions unaffected
- [ ] Schema documented

---

#### Requirement 9.2.2: Mission Overseer Cost Tracking
**Priority**: P0 (Blocking)

**Implementation**:
```typescript
// src/agents/mission-overseer.ts

async execute(plan: Plan, context: AgentContext): Promise<TaskOutput> {
  const agentCosts: Record<string, number> = {};
  const agentBreakdown: AgentCostBreakdown[] = [];
  let totalCost = 0;

  for (const step of plan.steps) {
    const agent = AgentRegistry.get(step.agentName);
    const stepStart = Date.now();

    // Execute step
    const output = await agent.execute(step, context);
    const stepDuration = Date.now() - stepStart;

    // Calculate cost (from token usage)
    const stepCost = this.calculateCost(output.usage || {});

    // Accumulate by agent name
    agentCosts[step.agentName] = (agentCosts[step.agentName] || 0) + stepCost;
    totalCost += stepCost;

    // Track breakdown
    agentBreakdown.push({
      agent: step.agentName,
      cost: stepCost,
      percentage: 0, // Will calculate after total known
      duration: stepDuration,
      tokens: output.usage || {}
    });

    context.onStream?.(`💰 ${step.agentName}: ${stepCost} credits`);
  }

  // Calculate percentages
  for (const item of agentBreakdown) {
    item.percentage = (item.cost / totalCost) * 100;
  }

  // Persist to database
  await this.adapter.recordMission({
    id: context.missionId,
    status: 'COMPLETED',
    plan,
    result: outputs,
    audit: verificationReport,
    cost: totalCost,
    agentCosts, // NEW: Per-agent costs
    userId: context.userId
  });

  return {
    success: true,
    cost: totalCost,
    agentCosts,
    breakdown: agentBreakdown,
    artifacts: outputs
  };
}

private calculateCost(usage: TokenUsage): number {
  // Pricing: $0.10 per 1M tokens (input + output)
  // 1 credit = $0.01
  // So 1M tokens = 10 credits
  const totalTokens = (usage.promptTokens || 0) + (usage.completionTokens || 0);
  return Math.ceil(totalTokens / 100000); // 100k tokens = 1 credit
}
```

**Acceptance Criteria**:
- [ ] `agentCosts` object populated correctly
- [ ] Total cost equals sum of agent costs
- [ ] Breakdown includes percentages
- [ ] Token usage tracked per agent
- [ ] Duration tracked per agent
- [ ] Cost calculation accurate (<1% error)

**Testing**:
```typescript
// tests/unit/agents/mission-overseer.test.ts

describe('Mission Overseer Cost Tracking', () => {
  it('should track per-agent costs', async () => {
    const overseer = new MissionOverseerAgent();
    const context = {
      userId: 'test-user',
      mission: 'Test mission',
      config: {
        explicitAgents: ['seo-analyst', 'content-orchestrator']
      }
    };

    const plan = await overseer.plan(context);
    const result = await overseer.execute(plan, context);

    expect(result.agentCosts).toBeDefined();
    expect(result.agentCosts['seo-analyst']).toBeGreaterThan(0);
    expect(result.agentCosts['content-orchestrator']).toBeGreaterThan(0);

    // Total cost should equal sum
    const sum = Object.values(result.agentCosts).reduce((a, b) => a + b, 0);
    expect(result.cost).toBe(sum);
  });

  it('should calculate cost from token usage', () => {
    const overseer = new MissionOverseerAgent();
    const cost = overseer['calculateCost']({
      promptTokens: 50000,
      completionTokens: 50000,
      totalTokens: 100000
    });

    expect(cost).toBe(1); // 100k tokens = 1 credit
  });
});
```

---

#### Requirement 9.2.3: Analytics Server Action
**Priority**: P0 (Blocking)

**Implementation**:
```typescript
// src/actions/analytics.ts

'use server';

import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export interface AgentCostBreakdown {
  agent: string;
  totalCost: number;
  missions: number;
  percentage: number;
  avgCostPerMission: number;
}

/**
 * Get cost breakdown by agent for a user
 * Cached for 5 minutes
 */
export const getAgentCostBreakdown = cache(async function(
  userId: string,
  dateRange?: { from: Date; to: Date }
): Promise<AgentCostBreakdown[]> {
  // Query missions
  const where: any = { userId };
  if (dateRange) {
    where.createdAt = {
      gte: dateRange.from,
      lte: dateRange.to
    };
  }

  const missions = await prisma.mission.findMany({
    where,
    select: {
      agentCosts: true,
      cost: true
    }
  });

  // Aggregate by agent
  const costByAgent: Record<string, { total: number; count: number }> = {};
  let totalCost = 0;

  for (const mission of missions) {
    if (!mission.agentCosts) continue;

    const agentCosts = mission.agentCosts as Record<string, number>;
    for (const [agent, cost] of Object.entries(agentCosts)) {
      if (!costByAgent[agent]) {
        costByAgent[agent] = { total: 0, count: 0 };
      }
      costByAgent[agent].total += cost;
      costByAgent[agent].count += 1;
      totalCost += cost;
    }
  }

  // Convert to array and calculate stats
  const breakdown: AgentCostBreakdown[] = Object.entries(costByAgent).map(
    ([agent, { total, count }]) => ({
      agent,
      totalCost: total,
      missions: count,
      percentage: (total / totalCost) * 100,
      avgCostPerMission: total / count
    })
  );

  // Sort by total cost (descending)
  breakdown.sort((a, b) => b.totalCost - a.totalCost);

  return breakdown;
});

/**
 * Get cost trend over time
 */
export async function getCostTrend(
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; cost: number }>> {
  const missions = await prisma.mission.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    },
    select: {
      cost: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  // Group by date
  const costByDate: Record<string, number> = {};
  for (const mission of missions) {
    const date = mission.createdAt.toISOString().split('T')[0];
    costByDate[date] = (costByDate[date] || 0) + mission.cost;
  }

  return Object.entries(costByDate).map(([date, cost]) => ({
    date,
    cost
  }));
}
```

**Acceptance Criteria**:
- [ ] `getAgentCostBreakdown()` returns correct data
- [ ] Results sorted by cost (descending)
- [ ] Percentages sum to 100%
- [ ] Average cost calculated correctly
- [ ] Date range filtering works
- [ ] Caching works (5-minute TTL)
- [ ] Performance: <500ms for 1000 missions

---

#### Requirement 9.2.4: Analytics Dashboard Component
**Priority**: P0 (Blocking)

**Implementation**:
```typescript
// src/components/FleetAnalytics.tsx

'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getAgentCostBreakdown, getCostTrend } from '@/actions/analytics';

const COLORS = ['#1E40AF', '#9333EA', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

interface Props {
  userId: string;
  dateRange?: { from: Date; to: Date };
}

export function FleetAnalytics({ userId, dateRange }: Props) {
  const [breakdown, setBreakdown] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [breakdownData, trendData] = await Promise.all([
        getAgentCostBreakdown(userId, dateRange),
        getCostTrend(userId, 30)
      ]);
      setBreakdown(breakdownData);
      setTrend(trendData);
      setLoading(false);
    }
    load();
  }, [userId, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const chartData = breakdown.map((item, index) => ({
    name: item.agent,
    value: item.totalCost,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {breakdown.reduce((sum, item) => sum + item.totalCost, 0)} credits
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {breakdown.reduce((sum, item) => sum + item.missions, 0)} missions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Used Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {breakdown[0]?.agent || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {breakdown[0]?.missions || 0} missions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {breakdown.length > 0
                ? Math.round(
                    breakdown.reduce((sum, item) => sum + item.totalCost, 0) /
                    breakdown.reduce((sum, item) => sum + item.missions, 0)
                  )
                : 0} credits
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>By agent</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
            <CardDescription>Cost breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Missions</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((item, index) => (
                  <TableRow key={item.agent}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {item.agent}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.missions}</TableCell>
                    <TableCell className="text-right">
                      {item.totalCost} credits
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(item.avgCostPerMission)} credits
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Cost Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#1E40AF" name="Cost (credits)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={() => exportToCSV(breakdown)}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>
    </div>
  );
}

function exportToCSV(data: any[]) {
  const csv = [
    ['Agent', 'Missions', 'Total Cost', 'Avg Cost', 'Percentage'].join(','),
    ...data.map(item =>
      [
        item.agent,
        item.missions,
        item.totalCost,
        item.avgCostPerMission.toFixed(2),
        item.percentage.toFixed(2)
      ].join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agent-costs-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
```

**Acceptance Criteria**:
- [ ] Pie chart displays cost distribution
- [ ] Table shows detailed breakdown
- [ ] Summary cards show key metrics
- [ ] Cost trend chart shows 30-day history
- [ ] Export to CSV works
- [ ] Loading states work
- [ ] Responsive design (mobile + desktop)
- [ ] Real-time data (5-min cache)

---

### 9.2.5 Success Criteria

**Must Have (P0)**:
- ✅ Per-agent cost tracking with <5% overhead
- ✅ Analytics dashboard loads in <1 second
- ✅ Cost accuracy >95% (validated against billing)
- ✅ Export to CSV works

**Should Have (P1)**:
- ✅ Date range filtering
- ✅ Cost trend visualization
- ✅ Summary cards with key metrics

**Nice to Have (P2)**:
- ⭕ Cost forecasting (predict next month)
- ⭕ Budget alerts (notify when approaching limit)
- ⭕ Agent efficiency scoring (value per credit)

---

## PHASE 9.3: ADVANCED ORCHESTRATION - TECHNICAL SPEC

### 9.3.1 Problem Statement

**Current State**:
- Sequential agent execution (one at a time)
- No parallelization
- No conditional logic (if/else)
- Fixed execution order

**Issues**:
1. **Slow Execution**: Missions take longer than necessary
2. **Inefficient Resource Use**: CPU idle while waiting for I/O
3. **No Flexibility**: Cannot implement complex workflows
4. **Limited Scalability**: Cannot handle high-throughput scenarios

**Business Impact**:
- Poor user experience (long wait times)
- Higher costs (paying for idle time)
- Cannot support enterprise use cases (complex workflows)
- Competitive disadvantage (competitors have parallel execution)

### 9.3.2 Proposed Solution

**Implement DAG (Directed Acyclic Graph) executor** with parallel execution and conditional logic.

**Example Workflow**:
```
┌──────────────┐     ┌──────────────────┐
│ SEO Analyst  │     │ Market Strategist│
└──────┬───────┘     └────────┬─────────┘
       │                      │
       └──────────┬───────────┘
                  │ (parallel)
         ┌────────▼────────┐
         │ Content Orch    │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │ Social Commander│  (condition: if content.length > 1000)
         └─────────────────┘
```

**Architecture**:
```typescript
const plan: Plan = {
  steps: [
    {
      agentName: 'seo-analyst',
      action: 'Research keywords',
      dependencies: []  // No deps = runs immediately
    },
    {
      agentName: 'marketing-strategist',
      action: 'Analyze audience',
      dependencies: []  // Runs in parallel with SEO
    },
    {
      agentName: 'content-orchestrator',
      action: 'Generate content',
      dependencies: ['seo-analyst', 'marketing-strategist']  // Waits for both
    },
    {
      agentName: 'social-commander',
      action: 'Create posts',
      dependencies: ['content-orchestrator'],
      condition: 'content.length > 1000'  // Conditional execution
    }
  ]
};
```

### 9.3.3 Technical Requirements

#### Requirement 9.3.1: PlanStep Interface Extension
**Priority**: P0 (Blocking)

**Type Changes**:
```typescript
// src/agents/base/agent-interface.ts

export interface PlanStep {
  agentName: string;
  action: string;
  parameters?: Record<string, any>;
  estimatedCost?: number;

  // Phase 9.3: Parallel execution
  dependencies?: string[];    // Agent names this step depends on
  condition?: string;          // Optional condition expression
  parallel?: boolean;          // Hint: can run in parallel
}

export interface Plan {
  steps: PlanStep[];
  estimatedCost: number;
  reasoning?: string;

  // Phase 9.3: Execution metadata
  parallelizable?: boolean;    // Plan supports parallel execution
  criticalPath?: string[];     // Longest dependency chain
}
```

**Acceptance Criteria**:
- [ ] Types compile without errors
- [ ] Backward compatible (existing code works)
- [ ] Documentation updated

---

#### Requirement 9.3.2: DAG Executor Implementation
**Priority**: P0 (Blocking)

**Full Implementation** (see IMPLEMENTATION_PLAN.md Task 9.3.2 for complete code - ~300 lines)

**Key Methods**:
1. `execute(plan, context): Promise<Map<string, TaskOutput>>`
2. `buildGraph(steps): Map<string, string[]>`
3. `topologicalSort(graph): string[]`
4. `groupByLevel(sorted, graph): PlanStep[][]`
5. `evaluateCondition(condition, results): boolean`
6. `waitForDependencies(step, results): Promise<void>`

**Acceptance Criteria**:
- [ ] DAG executor handles dependencies correctly
- [ ] Topological sort works (no cycles)
- [ ] Parallel steps execute concurrently
- [ ] Conditional logic evaluates correctly
- [ ] Error handling (fail fast mode)
- [ ] Unit tests pass (>90% coverage)
- [ ] Performance: 2-3x faster than sequential

**Testing**:
```typescript
// tests/unit/lib/dag-executor.test.ts

describe('DAG Executor', () => {
  it('should execute independent steps in parallel', async () => {
    const plan: Plan = {
      steps: [
        { agentName: 'agent1', dependencies: [] },
        { agentName: 'agent2', dependencies: [] }
      ]
    };

    const start = Date.now();
    await executor.execute(plan, context);
    const duration = Date.now() - start;

    // Should take ~1s (parallel), not 2s (sequential)
    expect(duration).toBeLessThan(1500);
  });

  it('should respect dependencies', async () => {
    const executionOrder: string[] = [];

    const plan: Plan = {
      steps: [
        { agentName: 'B', dependencies: ['A'] },
        { agentName: 'A', dependencies: [] }
      ]
    };

    await executor.execute(plan, {
      ...context,
      onStream: (log) => {
        if (log.includes('Executing')) {
          executionOrder.push(log.split(' ')[1]);
        }
      }
    });

    expect(executionOrder).toEqual(['A', 'B']);
  });

  it('should evaluate conditions', async () => {
    const results = new Map();
    results.set('agent1', {
      artifacts: { score: 85 }
    });

    const shouldRun = executor['evaluateCondition']('score > 80', results);
    expect(shouldRun).toBe(true);

    const shouldNotRun = executor['evaluateCondition']('score < 80', results);
    expect(shouldNotRun).toBe(false);
  });

  it('should detect cycles', () => {
    const plan: Plan = {
      steps: [
        { agentName: 'A', dependencies: ['B'] },
        { agentName: 'B', dependencies: ['A'] }  // Cycle!
      ]
    };

    expect(() => executor.execute(plan, context)).rejects.toThrow('Cycle detected');
  });
});
```

---

#### Requirement 9.3.3: Mission Overseer Integration
**Priority**: P0 (Blocking)

**Implementation**:
```typescript
// src/agents/mission-overseer.ts

import { DAGExecutor } from '@/lib/dag-executor';

async execute(plan: Plan, context: AgentContext): Promise<TaskOutput> {
  const parallelEnabled = process.env.FEATURE_PARALLEL_AGENTS === 'true';

  if (parallelEnabled && plan.parallelizable) {
    context.onStream?.('⚡ Parallel execution mode enabled');

    const executor = new DAGExecutor();
    const results = await executor.execute(plan, context);

    // Aggregate results
    return this.aggregateParallelResults(results, plan);
  } else {
    // Fallback to sequential execution
    context.onStream?.('🔄 Sequential execution mode');
    return this.executeSequential(plan, context);
  }
}

private async aggregateParallelResults(
  results: Map<string, TaskOutput>,
  plan: Plan
): Promise<TaskOutput> {
  const artifacts: Record<string, any> = {};
  let totalCost = 0;

  for (const [agentName, output] of results.entries()) {
    artifacts[agentName] = output.artifacts;
    totalCost += output.cost || 0;
  }

  return {
    success: true,
    cost: totalCost,
    artifacts,
    executionMode: 'parallel',
    parallelSteps: results.size
  };
}
```

**Feature Flag**:
```bash
# .env
FEATURE_PARALLEL_AGENTS=true  # Enable parallel execution
```

**Acceptance Criteria**:
- [ ] Overseer uses DAG executor when flag enabled
- [ ] Falls back to sequential when flag disabled
- [ ] Logs indicate execution mode
- [ ] Aggregates results correctly
- [ ] Tests pass in both modes

---

#### Requirement 9.3.4: Workflow Visualization
**Priority**: P1 (Important)

**Implementation** (React Flow):
```typescript
// src/components/WorkflowVisualization.tsx

'use client';

import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

interface Props {
  plan: Plan;
  results?: Map<string, TaskOutput>;
}

export function WorkflowVisualization({ plan, results }: Props) {
  // Build nodes and edges from plan
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create nodes for each agent
    for (const step of plan.steps) {
      const isCompleted = results?.has(step.agentName);
      const isRunning = false; // TODO: track running state

      nodes.push({
        id: step.agentName,
        data: {
          label: (
            <div className="flex flex-col items-center p-2">
              <div className="font-semibold">{step.agentName}</div>
              <div className="text-xs text-muted-foreground">{step.action}</div>
              {isCompleted && <CheckCircle className="h-4 w-4 text-green-500 mt-1" />}
              {isRunning && <Loader2 className="h-4 w-4 animate-spin mt-1" />}
            </div>
          )
        },
        position: { x: 0, y: 0 }, // Will be auto-layouted
        type: 'default',
        style: {
          background: isCompleted ? '#10B981' : isRunning ? '#F59E0B' : '#1E40AF',
          color: '#fff',
          border: '2px solid #fff',
          borderRadius: 8,
          padding: 10
        }
      });

      // Create edges for dependencies
      if (step.dependencies) {
        for (const dep of step.dependencies) {
          edges.push({
            id: `${dep}-${step.agentName}`,
            source: dep,
            target: step.agentName,
            animated: true,
            style: { stroke: '#9333EA', strokeWidth: 2 }
          });
        }
      }
    }

    // Auto-layout using dagre
    const layouted = getLayoutedElements(nodes, edges);

    return { nodes: layouted.nodes, edges: layouted.edges };
  }, [plan, results]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' }); // Top to bottom

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 40
      }
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

**Dependencies**:
```bash
npm install reactflow dagre @types/dagre
```

**Acceptance Criteria**:
- [ ] Workflow renders as flowchart
- [ ] Parallel paths shown side-by-side
- [ ] Dependencies shown as arrows
- [ ] Completed nodes highlighted green
- [ ] Running nodes show spinner
- [ ] Zoom and pan work
- [ ] Responsive design

---

### 9.3.5 Success Criteria

**Must Have (P0)**:
- ✅ Parallel execution: 2-3x throughput improvement
- ✅ DAG executor handles dependencies correctly
- ✅ Conditional logic works (if/else)
- ✅ Zero race conditions (30-day observation)

**Should Have (P1)**:
- ✅ Workflow visualization in UI
- ✅ Feature flag for gradual rollout
- ✅ Performance benchmarks documented

**Nice to Have (P2)**:
- ⭕ Real-time progress updates in visualization
- ⭕ Critical path highlighting
- ⭕ Workflow templates (save/load)

---

## CROSS-PHASE TECHNICAL DECISIONS

### Database Strategy
- **PostgreSQL** for structured data (missions, wallets)
- **Firebase Firestore** for versioned master keys
- **Redis** for rate limiting and caching

### Monitoring Strategy
- **Logging**: Structured JSON logs
- **Metrics**: Prometheus + Grafana
- **APM**: Vercel Analytics or Datadog
- **Alerting**: PagerDuty for critical issues

### Security Standards
- **Encryption**: AES-256-GCM for data at rest
- **TLS 1.3** for data in transit
- **Key Management**: Firebase Admin SDK
- **Rate Limiting**: 1 rotation/hour (Vault), 100 req/min (API)

---

## TESTING STRATEGY

### Unit Testing
- **Coverage Target**: >85%
- **Framework**: Vitest
- **Mocking**: vi.mock() for external dependencies

### Integration Testing
- **Scope**: API endpoints, database operations
- **Framework**: Vitest + Supertest
- **Environment**: In-memory database

### E2E Testing
- **Framework**: Playwright
- **Browsers**: Chrome, Firefox, Safari
- **Scenarios**: Critical user flows

### Performance Testing
- **Tool**: Artillery
- **Metrics**: p95 latency, throughput, error rate
- **Load**: 100 concurrent users

---

## DEPLOYMENT STRATEGY

### Environments
1. **Development**: Local (localhost:4000)
2. **Staging**: Vercel Preview (pr-*.vercel.app)
3. **Production**: Vercel Production (gpilot.com)

### Deployment Flow
```
Feature Branch → PR → CI Tests → Staging → QA → Production
```

### Feature Flags
- `FEATURE_VERCEL_AI` (Phase 9.0)
- `FEATURE_PARALLEL_AGENTS` (Phase 9.3)

### Rollout Strategy
1. **Week 1**: Deploy to staging
2. **Week 2**: Canary (10% traffic)
3. **Week 3**: Ramp to 50% traffic
4. **Week 4**: Full rollout (100%)

---

## ROLLBACK PROCEDURES

### Phase 9.0 Rollback
```bash
# Disable feature flag
FEATURE_VERCEL_AI=false

# Redeploy previous version
vercel rollback
```

### Phase 9.1 Rollback
```bash
# Revert database migration
npx prisma migrate reset --skip-seed

# Restore from backup
pg_restore -d gpilot_production backup.sql
```

### Phase 9.3 Rollback
```bash
# Disable parallel execution
FEATURE_PARALLEL_AGENTS=false

# No database changes to revert
```

---

## APPROVAL & SIGN-OFF

### Stakeholders
- [ ] **Product Owner**: Approve business requirements
- [ ] **Tech Lead**: Approve technical design
- [ ] **Backend Team**: Review backend requirements
- [ ] **Frontend Team**: Review UI/UX requirements
- [ ] **QA Lead**: Review testing strategy
- [ ] **DevOps**: Review deployment strategy
- [ ] **Security Team**: Review security requirements

### Sign-Off Date
**Target**: ___________

### Approval Status
- [ ] Requirements reviewed
- [ ] Technical design approved
- [ ] Risks acknowledged
- [ ] Timeline accepted
- [ ] Budget allocated

---

## DOCUMENT REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Mission Overseer | Initial specification |

---

**END OF PHASE 9 SPECIFICATION**

For questions or clarifications:
- **Technical Questions**: tech-lead@gpilot.com
- **Requirements Questions**: product@gpilot.com
- **Approval Process**: pm@gpilot.com

---

*This specification must be approved before any Phase 9 implementation begins.*
