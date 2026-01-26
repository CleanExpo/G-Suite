# G-PILOT IMPLEMENTATION PLAN
**From SPEC.md v8.2 to Production Excellence**

> Comprehensive execution plan for Phases 9.0-10.0, orchestrated by Mission Overseer

**Created**: 2026-01-27
**Status**: ACTIVE
**Total Duration**: 16-20 weeks
**Priority Phases**: 9.0 (Streaming), 9.1 (Vault), 9.2 (Telemetry)

---

## EXECUTIVE SUMMARY

This implementation plan translates the G-Pilot SPEC.md roadmap into actionable tasks with clear priorities, dependencies, timelines, and success metrics. The plan is structured around 5 major phases, with Mission Overseer acting as the orchestration layer for execution and quality assurance.

**Key Objectives**:
1. ✅ **Phase 9.0**: Production-grade streaming with Vercel AI SDK
2. 🔐 **Phase 9.1**: Operational Vault key rotation
3. 📊 **Phase 9.2**: Granular cost analytics
4. ⚡ **Phase 9.3**: Parallel agent execution
5. 🏢 **Phase 10.0**: Multi-tenant architecture (future)

---

## TABLE OF CONTENTS
1. [Phase 9.0: Streaming Sovereignty](#phase-90-streaming-sovereignty)
2. [Phase 9.1: Vault Hardening](#phase-91-vault-hardening)
3. [Phase 9.2: Granular Telemetry](#phase-92-granular-telemetry)
4. [Phase 9.3: Advanced Orchestration](#phase-93-advanced-orchestration)
5. [Phase 10.0: Multi-Tenant Architecture](#phase-100-multi-tenant-architecture)
6. [Cross-Phase Resources](#cross-phase-resources)
7. [Risk Management](#risk-management)
8. [Success Metrics](#success-metrics)
9. [Mission Overseer Coordination](#mission-overseer-coordination)

---

## PHASE 9.0: STREAMING SOVEREIGNTY
**Priority**: 🔴 HIGH | **Effort**: Medium | **Timeline**: 2-3 weeks | **Status**: READY TO START

### Overview
Migrate from custom streaming protocol (`LOG:/RESULT:/ERROR:`) to Vercel AI SDK standard for production-grade real-time updates, better error handling, and tool call streaming support.

### Business Value
- **User Experience**: Smoother streaming with built-in loading states
- **Developer Experience**: Standard hooks (`useChat`, `useCompletion`) instead of custom parser
- **Extensibility**: Native support for tool streaming, token usage tracking
- **Reliability**: Battle-tested error recovery and reconnection logic

---

### TASK BREAKDOWN

#### Task 9.0.1: Vercel AI SDK Integration
**Assignee**: Backend Developer | **Duration**: 2 days | **Dependencies**: None

**Objectives**:
1. Verify `ai` package is installed (currently v6.0.49 in package.json ✅)
2. Import Vercel AI SDK in API route
3. Test basic `streamText()` functionality with Gemini model
4. Document SDK configuration

**Acceptance Criteria**:
- [ ] `ai` package imported in `/api/agents/route.ts`
- [ ] Basic `streamText()` call returns data
- [ ] No breaking changes to existing functionality
- [ ] Documentation updated

**Files to Modify**:
- `src/app/api/agents/route.ts` (primary implementation)
- `package.json` (verify dependencies)

**Implementation Snippet**:
```typescript
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { mission, config } = await request.json();

  const result = await streamText({
    model: google('gemini-2.0-flash'),
    prompt: mission,
    onFinish: async (result) => {
      // Log completion
      console.log('Stream finished:', result.usage);
    }
  });

  return result.toDataStreamResponse();
}
```

---

#### Task 9.0.2: API Route Refactoring
**Assignee**: Backend Developer | **Duration**: 3 days | **Dependencies**: 9.0.1

**Objectives**:
1. Replace custom `ReadableStream` with Vercel AI SDK response
2. Integrate Mission Overseer streaming with `onStream` callback
3. Map Overseer logs to AI SDK stream format
4. Preserve RESULT:/ERROR: semantics for backward compatibility (if needed)
5. Add token usage tracking

**Acceptance Criteria**:
- [ ] API route uses `streamText()` or `streamObject()`
- [ ] Mission Overseer logs streamed via SDK
- [ ] Token usage captured and returned
- [ ] Existing integration tests pass
- [ ] No breaking changes to response format

**Files to Modify**:
- `src/app/api/agents/route.ts` (replace stream implementation)
- `src/agents/mission-overseer.ts` (ensure onStream compatibility)

**Implementation Approach**:
```typescript
export async function POST(request: NextRequest) {
  const { mission, config } = await request.json();

  await initializeAgents();
  const overseer = AgentRegistry.get('mission-overseer');

  const result = await streamText({
    model: google('gemini-2.0-flash'),
    prompt: mission,
    experimental_transform: (stream) => {
      return stream.pipeThrough(
        new TransformStream({
          async transform(chunk, controller) {
            // Inject Mission Overseer logs
            const context = {
              userId: 'user',
              mission,
              config,
              onStream: (log) => controller.enqueue(log)
            };

            // Execute overseer in parallel
            const plan = await overseer.plan(context);
            const output = await overseer.execute(plan, context);

            controller.enqueue(chunk);
          }
        })
      );
    }
  });

  return result.toDataStreamResponse();
}
```

---

#### Task 9.0.3: Client Component Migration
**Assignee**: Frontend Developer | **Duration**: 3 days | **Dependencies**: 9.0.2

**Objectives**:
1. Replace custom streaming parser in `MissionModal.tsx`
2. Integrate `useChat()` or `useCompletion()` hook
3. Add loading states and typing indicators
4. Handle errors with toast notifications
5. Test streaming UI responsiveness

**Acceptance Criteria**:
- [ ] `MissionModal.tsx` uses Vercel AI SDK hooks
- [ ] Loading spinner shows during streaming
- [ ] Typing indicator animates during response
- [ ] Errors display in toast notifications
- [ ] Smooth auto-scroll to bottom
- [ ] Copy-to-clipboard button works

**Files to Modify**:
- `src/components/MissionModal.tsx` (replace streaming logic)

**Implementation Approach**:
```typescript
'use client';

import { useCompletion } from 'ai/react';

export function MissionModal() {
  const { completion, isLoading, error, complete } = useCompletion({
    api: '/api/agents',
  });

  const handleSubmit = async (mission: string) => {
    await complete(mission);
  };

  return (
    <Dialog>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e.currentTarget.mission.value);
      }}>
        <Textarea name="mission" placeholder="Describe your mission..." />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Executing...' : 'Launch Mission'}
        </Button>
      </form>

      <StreamingLogs>
        {completion}
        {isLoading && <TypingIndicator />}
      </StreamingLogs>

      {error && <Toast variant="error">{error.message}</Toast>}
    </Dialog>
  );
}
```

---

#### Task 9.0.4: Testing & Validation
**Assignee**: QA Engineer | **Duration**: 2 days | **Dependencies**: 9.0.3

**Objectives**:
1. Update unit tests for API route
2. Add integration tests for streaming flow
3. Test streaming latency (<100ms target)
4. Validate token usage tracking accuracy
5. Test error scenarios (network failure, timeout)
6. Performance testing (100 concurrent streams)

**Acceptance Criteria**:
- [ ] All existing tests pass
- [ ] New streaming tests added and passing
- [ ] Latency <100ms (p95)
- [ ] Zero protocol errors in 100 test missions
- [ ] Error handling tested (network, timeout, auth)
- [ ] Performance test: 100 concurrent streams

**Test Files to Create/Update**:
- `tests/unit/api/agents.test.ts`
- `tests/integration/streaming.test.ts`
- `tests/e2e/mission-streaming.spec.ts`

**Test Example**:
```typescript
describe('Streaming API (Vercel AI SDK)', () => {
  it('should stream mission logs with <100ms latency', async () => {
    const start = Date.now();
    const response = await fetch('/api/agents', {
      method: 'POST',
      body: JSON.stringify({ mission: 'Test mission', config: {} })
    });

    const reader = response.body.getReader();
    const { value } = await reader.read();
    const latency = Date.now() - start;

    expect(latency).toBeLessThan(100);
    expect(value).toBeDefined();
  });

  it('should track token usage', async () => {
    const { usage } = await complete('Test mission');

    expect(usage.promptTokens).toBeGreaterThan(0);
    expect(usage.completionTokens).toBeGreaterThan(0);
    expect(usage.totalTokens).toBe(usage.promptTokens + usage.completionTokens);
  });
});
```

---

#### Task 9.0.5: Documentation & Rollout
**Assignee**: Technical Writer + DevOps | **Duration**: 2 days | **Dependencies**: 9.0.4

**Objectives**:
1. Update SPEC.md with new streaming protocol
2. Create migration guide for custom clients
3. Update API documentation with examples
4. Deploy to staging environment
5. Monitor for issues (7-day bake period)
6. Deploy to production with feature flag

**Acceptance Criteria**:
- [ ] SPEC.md Section 4.2 updated
- [ ] Migration guide published
- [ ] API docs include Vercel AI SDK examples
- [ ] Staging deployment successful
- [ ] 7-day monitoring period completed
- [ ] Production rollout with flag `FEATURE_VERCEL_AI=true`

**Files to Update**:
- `SPEC.md` (Section 4.2 Streaming Protocol)
- `MIGRATION_9.0.md` (new file)
- `README.md` (streaming examples)

---

### Phase 9.0 Timeline

```
Week 1:
  Mon-Tue:  Task 9.0.1 (SDK Integration)
  Wed-Fri:  Task 9.0.2 (API Refactoring)

Week 2:
  Mon-Wed:  Task 9.0.3 (Client Migration)
  Thu-Fri:  Task 9.0.4 (Testing)

Week 3:
  Mon-Tue:  Task 9.0.5 (Documentation)
  Wed:      Staging deployment
  Thu-Fri:  Monitoring & validation

Week 3+ (Optional):
  7-day bake period in staging
  Production rollout
```

### Phase 9.0 Success Metrics
- ✅ Streaming latency <100ms (p95)
- ✅ Zero protocol errors in 100 production missions
- ✅ Token usage tracking accuracy >99%
- ✅ Developer satisfaction score >4.5/5 (internal survey)
- ✅ Client migration completed with zero breaking changes

---

## PHASE 9.1: VAULT HARDENING
**Priority**: 🔴 HIGH | **Effort**: Medium | **Timeline**: 2-3 weeks | **Status**: BLOCKED BY 9.0

### Overview
Implement backend key rotation logic for The Vault to enable production-grade security compliance. The Vault UI already exists; this phase connects it to real Firebase Admin SDK key rotation.

### Business Value
- **Security Compliance**: Key rotation is industry best practice (SOC 2, ISO 27001)
- **Zero-Downtime Migration**: Old keys decrypt existing data, new keys encrypt new data
- **Audit Trail**: Full logging for compliance and forensics
- **Customer Trust**: "Military-Grade Encryption" becomes fully operational

---

### TASK BREAKDOWN

#### Task 9.1.1: Database Schema Migration
**Assignee**: Backend Developer | **Duration**: 1 day | **Dependencies**: None

**Objectives**:
1. Add `keyVersion` field to `UserProfile` model
2. Add `keyRotationHistory` JSON field for audit trail
3. Create Prisma migration
4. Test migration on dev database
5. Document schema changes

**Acceptance Criteria**:
- [ ] `keyVersion` field added (integer, default 1)
- [ ] `keyRotationHistory` field added (JSON array)
- [ ] Migration runs without errors
- [ ] Existing data preserved
- [ ] Schema documented in SPEC.md

**Files to Modify**:
- `prisma/schema.prisma`

**Schema Changes**:
```prisma
model UserProfile {
  id                  String   @id @default(uuid())
  clerkId             String   @unique

  // Encrypted Keys (The Vault)
  googleApiKey        String?
  shopifyAccessToken  String?
  redditApiKey        String?
  socialApiKeys       Json?

  // Key Rotation (Phase 9.1)
  keyVersion          Int      @default(1)
  keyRotationHistory  Json?    // Array of { version, rotatedAt, rotatedBy }

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Migration Command**:
```bash
npx prisma migrate dev --name add_key_rotation_fields
```

---

#### Task 9.1.2: Encryption Service Enhancement
**Assignee**: Backend Developer | **Duration**: 3 days | **Dependencies**: 9.1.1

**Objectives**:
1. Create `rotateEncryptionKeys()` function
2. Implement key versioning logic
3. Support multi-version decryption (backward compatibility)
4. Add audit logging
5. Write unit tests for rotation logic

**Acceptance Criteria**:
- [ ] `rotateEncryptionKeys(userId)` function implemented
- [ ] Old keys can decrypt existing data
- [ ] New keys encrypt new data
- [ ] Key version tracked in database
- [ ] Audit log records rotation events
- [ ] Unit tests pass (>90% coverage)

**Files to Modify**:
- `src/lib/encryption.ts` (add rotation functions)
- `src/lib/vault-service.ts` (new file for Vault operations)

**Implementation**:
```typescript
// src/lib/encryption.ts

interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: number;
}

export async function rotateEncryptionKeys(
  userId: string
): Promise<void> {
  // 1. Generate new master key
  const newMasterKey = crypto.randomBytes(32);
  const newVersion = await getNextKeyVersion(userId);

  // 2. Fetch user profile with encrypted keys
  const profile = await prisma.userProfile.findUnique({
    where: { clerkId: userId }
  });

  if (!profile) throw new Error('User not found');

  // 3. Decrypt all keys with old master key
  const oldMasterKey = await getMasterKey(userId, profile.keyVersion);
  const decryptedKeys = {
    googleApiKey: profile.googleApiKey
      ? decrypt(profile.googleApiKey, oldMasterKey)
      : null,
    shopifyAccessToken: profile.shopifyAccessToken
      ? decrypt(profile.shopifyAccessToken, oldMasterKey)
      : null,
    redditApiKey: profile.redditApiKey
      ? decrypt(profile.redditApiKey, oldMasterKey)
      : null,
    socialApiKeys: profile.socialApiKeys
      ? JSON.parse(decrypt(JSON.stringify(profile.socialApiKeys), oldMasterKey))
      : null
  };

  // 4. Re-encrypt all keys with new master key
  const reencryptedKeys = {
    googleApiKey: decryptedKeys.googleApiKey
      ? encrypt(decryptedKeys.googleApiKey, newMasterKey, newVersion)
      : null,
    shopifyAccessToken: decryptedKeys.shopifyAccessToken
      ? encrypt(decryptedKeys.shopifyAccessToken, newMasterKey, newVersion)
      : null,
    redditApiKey: decryptedKeys.redditApiKey
      ? encrypt(decryptedKeys.redditApiKey, newMasterKey, newVersion)
      : null,
    socialApiKeys: decryptedKeys.socialApiKeys
      ? encrypt(JSON.stringify(decryptedKeys.socialApiKeys), newMasterKey, newVersion)
      : null
  };

  // 5. Update profile with new keys and version
  const rotationRecord = {
    version: newVersion,
    rotatedAt: new Date().toISOString(),
    rotatedBy: userId
  };

  await prisma.userProfile.update({
    where: { clerkId: userId },
    data: {
      ...reencryptedKeys,
      keyVersion: newVersion,
      keyRotationHistory: {
        push: rotationRecord
      }
    }
  });

  // 6. Store new master key in Firebase
  await storeVersionedKey(userId, newVersion, newMasterKey);

  // 7. Log rotation event
  console.log(`Key rotation completed for user ${userId}. Version: ${newVersion}`);
}

export function encrypt(
  plaintext: string,
  masterKey: Buffer,
  version: number
): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  const encryptedData: EncryptedData = {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    version
  };

  return JSON.stringify(encryptedData);
}

export function decrypt(
  ciphertext: string,
  masterKey: Buffer
): string {
  const encryptedData: EncryptedData = JSON.parse(ciphertext);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    masterKey,
    Buffer.from(encryptedData.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decrypted = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

#### Task 9.1.3: API Endpoint Implementation
**Assignee**: Backend Developer | **Duration**: 2 days | **Dependencies**: 9.1.2

**Objectives**:
1. Create `POST /api/vault/rotate` endpoint
2. Implement authentication and authorization
3. Add rate limiting (max 1 rotation per hour per user)
4. Return rotation status and new key version
5. Handle errors gracefully

**Acceptance Criteria**:
- [ ] Endpoint `/api/vault/rotate` created
- [ ] Auth middleware enforces user ownership
- [ ] Rate limit: 1 rotation/hour per user
- [ ] Returns `{ success, newVersion, rotatedAt }`
- [ ] Error handling with clear messages
- [ ] API documented in SPEC.md

**Files to Create**:
- `src/app/api/vault/rotate/route.ts`

**Implementation**:
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
    const allowed = await checkRateLimit(user.id, 'key-rotation', {
      maxRequests: 1,
      windowMs: 60 * 60 * 1000 // 1 hour
    });

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait 1 hour between rotations.' },
        { status: 429 }
      );
    }

    // 3. Perform rotation
    const result = await rotateEncryptionKeys(user.id);

    // 4. Return success response
    return NextResponse.json({
      success: true,
      newVersion: result.version,
      rotatedAt: result.rotatedAt,
      message: 'Encryption keys rotated successfully'
    });

  } catch (error: any) {
    console.error('Key rotation error:', error);

    return NextResponse.json(
      {
        error: 'Key rotation failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
```

---

#### Task 9.1.4: Vault UI Integration
**Assignee**: Frontend Developer | **Duration**: 2 days | **Dependencies**: 9.1.3

**Objectives**:
1. Connect "Rotate Keys" button to API endpoint
2. Add confirmation dialog
3. Show loading state during rotation
4. Display success/error toast notifications
5. Update UI with new key version
6. Add rotation history table

**Acceptance Criteria**:
- [ ] "Rotate Keys" button triggers API call
- [ ] Confirmation dialog shows before rotation
- [ ] Loading spinner during rotation
- [ ] Success toast: "Keys rotated successfully"
- [ ] Error toast with clear message
- [ ] Key version updates in UI
- [ ] Rotation history table populated

**Files to Modify**:
- `src/app/dashboard/vault/page.tsx`

**Implementation**:
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export default function VaultPage() {
  const [rotating, setRotating] = useState(false);
  const [keyVersion, setKeyVersion] = useState(1);

  const handleRotate = async () => {
    if (!confirm('Are you sure you want to rotate encryption keys? This is irreversible.')) {
      return;
    }

    setRotating(true);

    try {
      const response = await fetch('/api/vault/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Rotation failed');
      }

      const result = await response.json();
      setKeyVersion(result.newVersion);

      toast.success(`Keys rotated successfully. New version: ${result.newVersion}`);
    } catch (error: any) {
      toast.error(`Rotation failed: ${error.message}`);
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="vault-page">
      <h1>The Vault</h1>

      <Card>
        <CardHeader>
          <CardTitle>Encryption Keys</CardTitle>
          <CardDescription>
            Military-Grade AES-256-GCM Encryption
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="key-info">
            <p>Current Key Version: <strong>v{keyVersion}</strong></p>
            <p>Last Rotated: <strong>2026-01-20</strong></p>
          </div>

          <Button
            onClick={handleRotate}
            disabled={rotating}
            variant="destructive"
          >
            {rotating ? 'Rotating...' : 'Rotate Keys'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rotation History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Rotated At</TableHead>
                <TableHead>Rotated By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Populate from keyRotationHistory */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

#### Task 9.1.5: Testing & Documentation
**Assignee**: QA Engineer + Technical Writer | **Duration**: 2 days | **Dependencies**: 9.1.4

**Objectives**:
1. Unit tests for rotation logic
2. Integration tests for API endpoint
3. E2E test: Full rotation workflow
4. Performance test: Rotation completes <5s
5. Update SPEC.md Section 11 (Security)
6. Create Vault operation guide

**Acceptance Criteria**:
- [ ] Unit tests pass (>90% coverage on encryption.ts)
- [ ] Integration tests pass (API endpoint)
- [ ] E2E test: Click button → keys rotated
- [ ] Rotation completes in <5 seconds
- [ ] Old keys decrypt existing data ✓
- [ ] New keys encrypt new data ✓
- [ ] SPEC.md Section 11.4 updated
- [ ] Vault guide published

**Test Files**:
- `tests/unit/lib/encryption.test.ts`
- `tests/integration/api/vault.test.ts`
- `tests/e2e/vault-rotation.spec.ts`

**Test Example**:
```typescript
describe('Key Rotation', () => {
  it('should rotate keys without data loss', async () => {
    // Setup: Store encrypted data with v1 key
    const originalData = 'secret-api-key';
    await storeApiKey(userId, originalData);

    // Action: Rotate keys
    await rotateEncryptionKeys(userId);

    // Assertion: Can still retrieve original data
    const retrievedData = await getApiKey(userId);
    expect(retrievedData).toBe(originalData);
  });

  it('should complete rotation in <5 seconds', async () => {
    const start = Date.now();
    await rotateEncryptionKeys(userId);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000);
  });
});
```

---

### Phase 9.1 Timeline

```
Week 1:
  Mon:      Task 9.1.1 (Schema Migration)
  Tue-Thu:  Task 9.1.2 (Encryption Service)
  Fri:      Task 9.1.3 (API Endpoint) - Start

Week 2:
  Mon:      Task 9.1.3 (API Endpoint) - Complete
  Tue-Wed:  Task 9.1.4 (Vault UI)
  Thu-Fri:  Task 9.1.5 (Testing)

Week 3:
  Mon-Tue:  Documentation & staging deployment
  Wed:      Production rollout
  Thu-Fri:  Monitoring & validation
```

### Phase 9.1 Success Metrics
- ✅ Key rotation completes in <5 seconds
- ✅ Zero data loss during rotation
- ✅ Old keys decrypt existing data (backward compatibility)
- ✅ New data uses new keys (forward progress)
- ✅ Audit log captures 100% of rotations
- ✅ Rate limit prevents abuse (1/hour per user)

---

## PHASE 9.2: GRANULAR TELEMETRY
**Priority**: 🟡 MEDIUM | **Effort**: Low | **Timeline**: 1-2 weeks | **Status**: BLOCKED BY 9.0

### Overview
Add per-agent cost tracking to provide transparency and enable advanced analytics. Current "Fuel Consumed" is aggregated; this phase breaks it down by agent for better budget allocation insights.

### Business Value
- **User Transparency**: Users see exactly which agents consume most credits
- **Budget Optimization**: Identify cost-inefficient agents
- **Analytics Dashboard**: Visualize cost distribution with pie charts
- **ROI Analysis**: Measure agent value vs. cost

---

### TASK BREAKDOWN

#### Task 9.2.1: Database Schema Extension
**Assignee**: Backend Developer | **Duration**: 1 day | **Dependencies**: None

**Objectives**:
1. Add `agentCosts` JSON field to `Mission` model
2. Create Prisma migration
3. Test migration on dev database
4. Document schema changes

**Acceptance Criteria**:
- [ ] `agentCosts` field added (JSON object)
- [ ] Migration runs without errors
- [ ] Schema documented in SPEC.md Section 5.2.5

**Schema Changes**:
```prisma
model Mission {
  id         String   @id @default(uuid())
  status     String
  plan       Json?
  result     Json?
  audit      Json?
  cost       Int
  agentCosts Json?    // { "seo-analyst": 200, "content-orchestrator": 220 }
  userId     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Migration Command**:
```bash
npx prisma migrate dev --name add_agent_costs_tracking
```

---

#### Task 9.2.2: Mission Overseer Cost Tracking
**Assignee**: Backend Developer | **Duration**: 2 days | **Dependencies**: 9.2.1

**Objectives**:
1. Modify `MissionOverseer.execute()` to track per-agent costs
2. Aggregate costs by agent name
3. Store in `agentCosts` field during persistence
4. Update PrismaMissionAdapter to save agentCosts
5. Add unit tests for cost tracking logic

**Acceptance Criteria**:
- [ ] `execute()` tracks cost per agent
- [ ] `agentCosts` object populated: `{ "agent-name": cost }`
- [ ] Total cost matches sum of agentCosts
- [ ] PrismaMissionAdapter saves agentCosts
- [ ] Unit tests pass (>85% coverage)

**Files to Modify**:
- `src/agents/mission-overseer.ts`
- `src/lib/prisma-mission-adapter.ts`

**Implementation**:
```typescript
// src/agents/mission-overseer.ts

async execute(plan: Plan, context: AgentContext): Promise<TaskOutput> {
  const agentCosts: Record<string, number> = {};
  let totalCost = 0;

  for (const step of plan.steps) {
    const agent = AgentRegistry.get(step.agentName);

    // Track cost for this agent
    const stepStart = Date.now();
    const output = await agent.execute(step.plan, context);
    const stepCost = output.cost || estimateCost(output);

    // Accumulate
    agentCosts[step.agentName] = (agentCosts[step.agentName] || 0) + stepCost;
    totalCost += stepCost;

    context.onStream?.(`💰 ${step.agentName} cost: ${stepCost} credits`);
  }

  // Persist to database
  await this.adapter.recordMission({
    id: context.missionId,
    status: 'COMPLETED',
    plan,
    result: outputs,
    audit: verificationReport,
    cost: totalCost,
    agentCosts, // NEW: Per-agent breakdown
    userId: context.userId
  });

  return {
    success: true,
    cost: totalCost,
    agentCosts, // Return for client display
    artifacts: outputs
  };
}
```

---

#### Task 9.2.3: Server Action for Cost Breakdown
**Assignee**: Backend Developer | **Duration**: 1 day | **Dependencies**: 9.2.2

**Objectives**:
1. Create `getAgentCostBreakdown(userId)` server action
2. Query missions for user
3. Aggregate costs by agent across all missions
4. Return sorted array for visualization
5. Add caching (5-minute TTL)

**Acceptance Criteria**:
- [ ] Server action `getAgentCostBreakdown()` created
- [ ] Returns array: `[{ agent, totalCost, percentage }]`
- [ ] Sorted by cost (descending)
- [ ] Cached for 5 minutes
- [ ] Unit tests pass

**Files to Create**:
- `src/actions/analytics.ts`

**Implementation**:
```typescript
// src/actions/analytics.ts

'use server';

import { prisma } from '@/lib/prisma';

export async function getAgentCostBreakdown(userId: string) {
  const missions = await prisma.mission.findMany({
    where: { userId },
    select: { agentCosts: true, cost: true }
  });

  const costByAgent: Record<string, number> = {};
  let totalCost = 0;

  for (const mission of missions) {
    if (!mission.agentCosts) continue;

    const agentCosts = mission.agentCosts as Record<string, number>;
    for (const [agent, cost] of Object.entries(agentCosts)) {
      costByAgent[agent] = (costByAgent[agent] || 0) + cost;
      totalCost += cost;
    }
  }

  // Convert to array and calculate percentages
  const breakdown = Object.entries(costByAgent).map(([agent, cost]) => ({
    agent,
    totalCost: cost,
    percentage: (cost / totalCost) * 100
  }));

  // Sort by cost (descending)
  breakdown.sort((a, b) => b.totalCost - a.totalCost);

  return breakdown;
}
```

---

#### Task 9.2.4: Analytics Dashboard Component
**Assignee**: Frontend Developer | **Duration**: 2 days | **Dependencies**: 9.2.3

**Objectives**:
1. Create `FleetAnalytics` component with pie chart
2. Integrate Chart.js or Recharts for visualization
3. Display cost breakdown by agent
4. Add filters (date range, agent type)
5. Show top 3 most expensive agents
6. Add export to CSV button

**Acceptance Criteria**:
- [ ] `FleetAnalytics` component created
- [ ] Pie chart visualizes cost distribution
- [ ] Table shows detailed breakdown
- [ ] Date range filter works
- [ ] Top 3 agents highlighted
- [ ] Export to CSV works
- [ ] Responsive design (mobile + desktop)

**Files to Create**:
- `src/components/FleetAnalytics.tsx`

**Implementation**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { getAgentCostBreakdown } from '@/actions/analytics';

const COLORS = ['#1E40AF', '#9333EA', '#F59E0B', '#10B981', '#EF4444'];

export function FleetAnalytics({ userId }: { userId: string }) {
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAgentCostBreakdown(userId);
      setBreakdown(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <Spinner />;

  const chartData = breakdown.map((item, index) => ({
    name: item.agent,
    value: item.totalCost,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Cost Analytics</CardTitle>
        <CardDescription>Cost breakdown by agent</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex gap-6">
          <div className="chart">
            <PieChart width={300} height={300}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="table flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((item) => (
                  <TableRow key={item.agent}>
                    <TableCell>{item.agent}</TableCell>
                    <TableCell>{item.totalCost} credits</TableCell>
                    <TableCell>{item.percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Button onClick={exportToCSV}>Export to CSV</Button>
      </CardContent>
    </Card>
  );
}
```

---

#### Task 9.2.5: Testing & Rollout
**Assignee**: QA Engineer | **Duration**: 1 day | **Dependencies**: 9.2.4

**Objectives**:
1. Unit tests for cost tracking logic
2. Integration tests for server action
3. E2E test: Launch mission → view analytics
4. Validate cost accuracy (<5% error margin)
5. Deploy to production

**Acceptance Criteria**:
- [ ] Unit tests pass (cost tracking)
- [ ] Integration tests pass (server action)
- [ ] E2E test passes (full workflow)
- [ ] Cost accuracy validated (<5% error)
- [ ] Production deployment successful

---

### Phase 9.2 Timeline

```
Week 1:
  Mon:      Task 9.2.1 (Schema Extension)
  Tue-Wed:  Task 9.2.2 (Overseer Cost Tracking)
  Thu:      Task 9.2.3 (Server Action)
  Fri:      Task 9.2.4 (Analytics Dashboard) - Start

Week 2:
  Mon-Tue:  Task 9.2.4 (Analytics Dashboard) - Complete
  Wed:      Task 9.2.5 (Testing)
  Thu:      Documentation
  Fri:      Production rollout
```

### Phase 9.2 Success Metrics
- ✅ Per-agent cost tracking with <5% overhead
- ✅ Analytics dashboard loads in <1 second
- ✅ Cost accuracy >95% (validated against billing)
- ✅ Export to CSV works for all users
- ✅ User engagement with analytics >30% (first 30 days)

---

## PHASE 9.3: ADVANCED ORCHESTRATION
**Priority**: 🟡 MEDIUM | **Effort**: High | **Timeline**: 3-4 weeks | **Status**: BLOCKED BY 9.0, 9.2

### Overview
Enable parallel agent execution with dependency graphs and conditional workflows. Current execution is sequential; this phase enables 2-3x throughput improvement for independent agents.

### Business Value
- **Performance**: 2-3x faster mission completion for parallel-capable tasks
- **Complex Workflows**: Support if/else logic (e.g., "if SEO score > 80, then...")
- **Resource Efficiency**: Better utilization of compute resources
- **Competitive Advantage**: Industry-leading orchestration capabilities

---

### TASK BREAKDOWN

#### Task 9.3.1: PlanStep Interface Extension
**Assignee**: Backend Developer | **Duration**: 1 day | **Dependencies**: None

**Objectives**:
1. Add `dependencies` field to `PlanStep` interface
2. Add `condition` field for conditional execution
3. Update TypeScript types
4. Document new fields in SPEC.md

**Acceptance Criteria**:
- [ ] `dependencies: string[]` field added
- [ ] `condition?: string` field added (optional)
- [ ] Types compile without errors
- [ ] SPEC.md Section 3.2 updated

**Files to Modify**:
- `src/agents/base/agent-interface.ts`

**Implementation**:
```typescript
// src/agents/base/agent-interface.ts

export interface PlanStep {
  agentName: string;
  action: string;
  parameters?: Record<string, any>;
  estimatedCost?: number;

  // Phase 9.3: Parallel execution support
  dependencies?: string[];  // Agent names this step depends on
  condition?: string;       // Optional condition (e.g., "seoScore > 80")
}

export interface Plan {
  steps: PlanStep[];
  estimatedCost: number;
  reasoning?: string;
}
```

---

#### Task 9.3.2: DAG Executor Implementation
**Assignee**: Backend Developer | **Duration**: 5 days | **Dependencies**: 9.3.1

**Objectives**:
1. Implement Directed Acyclic Graph (DAG) executor
2. Topological sort for execution order
3. Parallel execution with `Promise.all()` for independent steps
4. Dependency resolution
5. Conditional logic evaluation
6. Error handling (fail fast vs. continue)

**Acceptance Criteria**:
- [ ] DAG executor implemented
- [ ] Topological sort works correctly
- [ ] Parallel steps execute concurrently
- [ ] Dependencies enforced (step waits for dependencies)
- [ ] Conditional logic evaluates correctly
- [ ] Errors handled gracefully
- [ ] Unit tests pass (>90% coverage)

**Files to Create**:
- `src/lib/dag-executor.ts`

**Implementation**:
```typescript
// src/lib/dag-executor.ts

export class DAGExecutor {
  /**
   * Execute plan steps in parallel where possible
   */
  async execute(
    plan: Plan,
    context: AgentContext
  ): Promise<Map<string, TaskOutput>> {
    const results = new Map<string, TaskOutput>();
    const graph = this.buildGraph(plan.steps);
    const sortedSteps = this.topologicalSort(graph);

    // Group steps by execution level (parallel batches)
    const levels = this.groupByLevel(sortedSteps, graph);

    for (const level of levels) {
      // Execute all steps in this level concurrently
      const promises = level.map(async (step) => {
        // Check condition
        if (step.condition && !this.evaluateCondition(step.condition, results)) {
          context.onStream?.(`⏭️ Skipping ${step.agentName} (condition not met)`);
          return null;
        }

        // Wait for dependencies
        await this.waitForDependencies(step, results);

        // Execute step
        context.onStream?.(`▶️ Executing ${step.agentName}...`);
        const agent = AgentRegistry.get(step.agentName);
        const output = await agent.execute(step, context);

        return { step: step.agentName, output };
      });

      // Wait for all steps in this level to complete
      const levelResults = await Promise.allSettled(promises);

      // Collect results
      for (const result of levelResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.set(result.value.step, result.value.output);
        } else if (result.status === 'rejected') {
          // Handle error
          context.onStream?.(`❌ Error: ${result.reason.message}`);
          throw new Error(`Execution failed: ${result.reason.message}`);
        }
      }
    }

    return results;
  }

  /**
   * Build dependency graph
   */
  private buildGraph(steps: PlanStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const step of steps) {
      graph.set(step.agentName, step.dependencies || []);
    }

    return graph;
  }

  /**
   * Topological sort (Kahn's algorithm)
   */
  private topologicalSort(graph: Map<string, string[]>): string[] {
    const sorted: string[] = [];
    const inDegree = new Map<string, number>();

    // Calculate in-degrees
    for (const [node, deps] of graph.entries()) {
      if (!inDegree.has(node)) inDegree.set(node, 0);
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Queue nodes with in-degree 0
    const queue: string[] = [];
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(node);
    }

    while (queue.length > 0) {
      const node = queue.shift()!;
      sorted.push(node);

      for (const dependent of graph.get(node) || []) {
        const newDegree = inDegree.get(dependent)! - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) queue.push(dependent);
      }
    }

    // Check for cycles
    if (sorted.length !== graph.size) {
      throw new Error('Cycle detected in dependency graph');
    }

    return sorted;
  }

  /**
   * Group steps into execution levels (parallel batches)
   */
  private groupByLevel(
    sorted: string[],
    graph: Map<string, string[]>
  ): PlanStep[][] {
    const levels: PlanStep[][] = [];
    const nodeToLevel = new Map<string, number>();

    for (const node of sorted) {
      const deps = graph.get(node) || [];
      const maxDepLevel = Math.max(
        -1,
        ...deps.map(dep => nodeToLevel.get(dep) || 0)
      );
      const level = maxDepLevel + 1;
      nodeToLevel.set(node, level);

      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    }

    return levels;
  }

  /**
   * Evaluate conditional logic
   */
  private evaluateCondition(
    condition: string,
    results: Map<string, TaskOutput>
  ): boolean {
    // Simple evaluation (can be enhanced with expression parser)
    // Example: "seoScore > 80"
    const match = condition.match(/(\w+)\s*([><=]+)\s*(\d+)/);
    if (!match) return true;

    const [, variable, operator, value] = match;
    const actualValue = this.extractVariable(variable, results);

    switch (operator) {
      case '>': return actualValue > parseFloat(value);
      case '<': return actualValue < parseFloat(value);
      case '>=': return actualValue >= parseFloat(value);
      case '<=': return actualValue <= parseFloat(value);
      case '==': return actualValue == parseFloat(value);
      default: return true;
    }
  }

  private extractVariable(
    variable: string,
    results: Map<string, TaskOutput>
  ): any {
    // Extract variable from results
    // Example: "seoScore" from seo-analyst output
    for (const output of results.values()) {
      if (output.artifacts?.[variable] !== undefined) {
        return output.artifacts[variable];
      }
    }
    return 0;
  }

  private async waitForDependencies(
    step: PlanStep,
    results: Map<string, TaskOutput>
  ): Promise<void> {
    if (!step.dependencies) return;

    // Wait for all dependencies to be in results map
    const maxWait = 60000; // 60 seconds
    const start = Date.now();

    while (true) {
      const allResolved = step.dependencies.every(dep => results.has(dep));
      if (allResolved) return;

      if (Date.now() - start > maxWait) {
        throw new Error(`Timeout waiting for dependencies: ${step.dependencies.join(', ')}`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
```

---

#### Task 9.3.3: Mission Overseer Integration
**Assignee**: Backend Developer | **Duration**: 3 days | **Dependencies**: 9.3.2

**Objectives**:
1. Update `MissionOverseer.execute()` to use DAG executor
2. Feature flag for parallel execution (`FEATURE_PARALLEL_AGENTS`)
3. Fallback to sequential execution if disabled
4. Stream parallel execution logs
5. Update tests

**Acceptance Criteria**:
- [ ] Overseer uses DAG executor when flag enabled
- [ ] Parallel steps execute concurrently
- [ ] Logs show parallel execution clearly
- [ ] Feature flag works (on/off toggle)
- [ ] Tests pass with both modes

**Files to Modify**:
- `src/agents/mission-overseer.ts`

**Implementation**:
```typescript
// src/agents/mission-overseer.ts

import { DAGExecutor } from '@/lib/dag-executor';

async execute(plan: Plan, context: AgentContext): Promise<TaskOutput> {
  const parallelEnabled = process.env.FEATURE_PARALLEL_AGENTS === 'true';

  if (parallelEnabled) {
    context.onStream?.('⚡ Parallel execution enabled');

    const executor = new DAGExecutor();
    const results = await executor.execute(plan, context);

    // Aggregate results
    return this.aggregateResults(results);
  } else {
    // Fallback to sequential execution
    context.onStream?.('🔄 Sequential execution (legacy mode)');
    return this.executeSequential(plan, context);
  }
}
```

---

#### Task 9.3.4: Workflow Visualization UI
**Assignee**: Frontend Developer | **Duration**: 4 days | **Dependencies**: 9.3.3

**Objectives**:
1. Create `WorkflowVisualization` component
2. Render DAG as flowchart (React Flow or similar)
3. Show parallel paths visually
4. Highlight active nodes during execution
5. Show dependencies as arrows
6. Add zoom and pan controls

**Acceptance Criteria**:
- [ ] Workflow rendered as flowchart
- [ ] Parallel paths shown side-by-side
- [ ] Active nodes highlighted in real-time
- [ ] Dependencies shown as arrows
- [ ] Zoom and pan work
- [ ] Responsive design

**Files to Create**:
- `src/components/WorkflowVisualization.tsx`

**Implementation**:
```typescript
'use client';

import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

export function WorkflowVisualization({ plan }: { plan: Plan }) {
  const nodes: Node[] = plan.steps.map((step, index) => ({
    id: step.agentName,
    data: { label: step.agentName },
    position: { x: index * 200, y: 0 }, // Will be auto-layouted
    type: 'default'
  }));

  const edges: Edge[] = [];
  for (const step of plan.steps) {
    if (step.dependencies) {
      for (const dep of step.dependencies) {
        edges.push({
          id: `${dep}-${step.agentName}`,
          source: dep,
          target: step.agentName,
          animated: true
        });
      }
    }
  }

  return (
    <div style={{ height: 400 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView />
    </div>
  );
}
```

---

#### Task 9.3.5: Testing & Performance Validation
**Assignee**: QA Engineer | **Duration**: 3 days | **Dependencies**: 9.3.4

**Objectives**:
1. Unit tests for DAG executor
2. Integration tests for parallel execution
3. Performance benchmarks (sequential vs. parallel)
4. Load testing (100 concurrent missions)
5. Validate 2-3x throughput improvement

**Acceptance Criteria**:
- [ ] Unit tests pass (DAG executor)
- [ ] Integration tests pass (parallel execution)
- [ ] Throughput improvement: 2-3x for parallel tasks
- [ ] Load test: 100 concurrent missions
- [ ] Zero race conditions detected
- [ ] Documentation updated

---

### Phase 9.3 Timeline

```
Week 1:
  Mon:      Task 9.3.1 (PlanStep Extension)
  Tue-Fri:  Task 9.3.2 (DAG Executor) - 4 days

Week 2:
  Mon-Wed:  Task 9.3.3 (Overseer Integration)
  Thu-Fri:  Task 9.3.4 (Workflow Visualization) - Start

Week 3:
  Mon-Tue:  Task 9.3.4 (Workflow Visualization) - Continue
  Wed:      Task 9.3.4 (Workflow Visualization) - Complete
  Thu-Fri:  Task 9.3.5 (Testing) - Start

Week 4:
  Mon:      Task 9.3.5 (Testing) - Complete
  Tue:      Documentation
  Wed:      Staging deployment
  Thu-Fri:  Performance validation & production rollout
```

### Phase 9.3 Success Metrics
- ✅ Parallel execution: 2-3x throughput improvement
- ✅ DAG executor handles dependencies correctly
- ✅ Conditional logic works (if/else)
- ✅ Workflow visualization clear and intuitive
- ✅ Zero race conditions in production (30-day observation)

---

## PHASE 10.0: MULTI-TENANT ARCHITECTURE
**Priority**: 🟢 LOW | **Effort**: Very High | **Timeline**: 4-6 weeks | **Status**: FUTURE

### Overview
Support team collaboration with workspace isolation, role-based access control, and workspace-level billing. Current single-user model is sufficient for MVP; this phase enables enterprise adoption.

### Business Value
- **Enterprise Sales**: Unlock team/agency market segment
- **Revenue Growth**: Workspace-level subscriptions ($100-500/month)
- **Collaboration**: Teams work together on missions
- **Administration**: Centralized billing and user management

---

### HIGH-LEVEL TASK BREAKDOWN

1. **Database Schema Refactor** (1 week)
   - Add Workspace, Team, Member models
   - Migrate UserProfile → WorkspaceMember relationship
   - Foreign key constraints

2. **RBAC Implementation** (1 week)
   - Role definitions (Owner, Admin, Member, Viewer)
   - Permission middleware
   - Authorization checks on all routes

3. **Mission Isolation** (1 week)
   - Workspace-scoped queries
   - Shared vault per workspace
   - Team mission history

4. **Billing Migration** (1 week)
   - Workspace-level wallets
   - Team subscription plans
   - Usage allocation

5. **UI Updates** (1-2 weeks)
   - Workspace selector
   - Team management dashboard
   - Invitation flow
   - Member directory

---

## CROSS-PHASE RESOURCES

### Critical Files Across All Phases

**Backend**:
- `src/app/api/agents/route.ts` (9.0, 9.3)
- `src/agents/mission-overseer.ts` (9.0, 9.2, 9.3)
- `src/agents/base/agent-interface.ts` (9.3)
- `src/lib/encryption.ts` (9.1)
- `src/lib/prisma-mission-adapter.ts` (9.1, 9.2)
- `prisma/schema.prisma` (9.1, 9.2, 10.0)

**Frontend**:
- `src/components/MissionModal.tsx` (9.0)
- `src/app/dashboard/page.tsx` (9.2)
- `src/app/dashboard/vault/page.tsx` (9.1)

**Testing**:
- `tests/unit/agents/mission-overseer.test.ts` (9.0, 9.2, 9.3)
- `tests/integration/streaming.test.ts` (9.0)
- `tests/e2e/mission-lifecycle.spec.ts` (9.0, 9.3)

### Team Roles & Responsibilities

**Backend Developers** (2):
- Mission Overseer enhancements
- API route refactoring
- Database migrations
- Encryption services
- DAG executor

**Frontend Developers** (1):
- Client component updates
- Dashboard components
- Workflow visualization
- Analytics charts

**QA Engineer** (1):
- Test suite maintenance
- Performance testing
- E2E test authoring
- Load testing

**DevOps Engineer** (1):
- CI/CD pipeline maintenance
- Staging/production deployments
- Monitoring setup
- Performance optimization

**Technical Writer** (0.5):
- SPEC.md updates
- API documentation
- Migration guides
- User guides

---

## RISK MANAGEMENT

### High-Risk Items

#### Risk 1: Vercel AI SDK Compatibility
**Severity**: Medium | **Probability**: Low
**Impact**: Phase 9.0 blocked
**Mitigation**:
- Prototype integration in Week 0 (pre-phase)
- Test with Gemini model specifically
- Fallback plan: Enhance custom protocol instead

#### Risk 2: Key Rotation Data Loss
**Severity**: High | **Probability**: Very Low
**Impact**: Customer trust destroyed
**Mitigation**:
- Extensive testing (unit + integration + E2E)
- Staging validation with real encrypted data
- Database backups before rotation
- Rollback plan ready

#### Risk 3: Parallel Execution Race Conditions
**Severity**: Medium | **Probability**: Medium
**Impact**: Intermittent failures, data corruption
**Mitigation**:
- Comprehensive concurrency testing
- Mutex locks for shared resources
- Transaction isolation levels
- 7-day staging observation period

#### Risk 4: Performance Degradation
**Severity**: Medium | **Probability**: Low
**Impact**: Slower missions, user complaints
**Mitigation**:
- Benchmark before/after each phase
- Load testing before production
- Rollback plan for each deployment
- Monitoring alerts (p95 latency >500ms)

---

## SUCCESS METRICS

### Phase 9.0 (Streaming)
- ✅ Streaming latency <100ms (p95)
- ✅ Zero protocol errors (100 missions)
- ✅ Developer satisfaction >4.5/5

### Phase 9.1 (Vault)
- ✅ Rotation time <5 seconds
- ✅ Zero data loss (100% success rate)
- ✅ Audit log completeness 100%

### Phase 9.2 (Telemetry)
- ✅ Cost accuracy >95%
- ✅ Tracking overhead <5%
- ✅ User engagement with analytics >30%

### Phase 9.3 (Orchestration)
- ✅ Throughput improvement 2-3x
- ✅ Zero race conditions (30 days)
- ✅ Workflow visualization usage >40%

### Overall Project Health
- 📊 Test coverage >85%
- 🐛 Zero critical bugs in production
- 📈 User satisfaction >4.3/5 (NPS)
- ⚡ API uptime >99.9%
- 💰 Cost per mission optimized (10% reduction)

---

## MISSION OVERSEER COORDINATION

### Using Mission Overseer for Project Management

The Mission Overseer can be invoked to assist with implementation tasks:

#### 1. **Daily Stand-Up Analysis**
```bash
POST /api/agents
{
  "agentName": "mission-overseer",
  "mission": "Analyze project status for Phase 9.0. Report blockers, progress, and next actions.",
  "config": {
    "explicitAgents": ["genesis-architect", "agent-scout"]
  }
}
```

#### 2. **QA Coordination**
```bash
POST /api/agents
{
  "agentName": "mission-overseer",
  "mission": "Run comprehensive QA on Phase 9.0 streaming implementation. Verify latency, protocol correctness, and error handling.",
  "config": {
    "explicitAgents": ["independent-verifier", "ui-auditor"]
  }
}
```

#### 3. **Performance Optimization**
```bash
POST /api/agents
{
  "agentName": "mission-overseer",
  "mission": "Analyze performance bottlenecks in parallel execution (Phase 9.3). Recommend optimizations.",
  "config": {
    "explicitAgents": ["genesis-architect"]
  }
}
```

#### 4. **Documentation Generation**
```bash
POST /api/agents
{
  "agentName": "mission-overseer",
  "mission": "Generate API migration guide for Phase 9.0 (custom protocol → Vercel AI SDK).",
  "config": {
    "explicitAgents": ["content-orchestrator"]
  }
}
```

---

## NEXT STEPS (Week 1)

### Immediate Actions
1. ✅ Review this implementation plan with team
2. 📅 Schedule kick-off meeting for Phase 9.0
3. 🛠️ Set up project tracking (Jira, Linear, or GitHub Projects)
4. 📊 Create task tickets for Phase 9.0 (Tasks 9.0.1-9.0.5)
5. 🔧 Assign tasks to backend/frontend developers
6. 🧪 Set up staging environment for Phase 9.0 testing
7. 📈 Configure monitoring dashboards (latency, errors, throughput)

### Week 1 Focus
**Phase 9.0 Launch**:
- Mon-Tue: Task 9.0.1 (Vercel AI SDK Integration)
- Wed-Fri: Task 9.0.2 (API Route Refactoring)
- Weekend: Code review and testing

---

**END OF IMPLEMENTATION PLAN**

For questions or clarifications, contact:
- **Project Lead**: TBD
- **Tech Lead**: TBD
- **Support**: support@gpilot.com

---

*G-Pilot Implementation Plan v1.0*
*Generated by Mission Overseer on 2026-01-27*
*Next Update: Weekly (Every Monday)*
