# Phase 9 Database Schema Changes

## Summary

Successfully completed database schema updates for Phase 9.1 (Vault Hardening) and Phase 9.2 (Granular Telemetry).

**Date**: 2026-01-27
**Status**: ✅ Completed
**Migration**: `20260127082732_phase_9_vault_and_telemetry`

---

## Changes Overview

### 1. Phase 9.1: Vault Hardening (bd-maskaw.1)

**Objective**: Add encryption key versioning and rotation audit trail to support secure key rotation workflow.

**Schema Changes** (`UserProfile` model):

```prisma
model UserProfile {
  // ... existing fields ...

  // Vault Security (Phase 9.1)
  keyVersion          Int      @default(1)  // Current encryption key version
  keyRotationHistory  Json?    // Audit trail of key rotations
}
```

**Fields Added**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `keyVersion` | `Int` | `1` | Current encryption key version in use |
| `keyRotationHistory` | `Json?` | `null` | Array of rotation events: `[{ version, rotatedAt, rotatedBy }]` |

**Purpose**:
- Track which encryption key version is currently protecting vault secrets
- Maintain audit trail of all key rotation events for compliance
- Enable graceful key migration (decrypt with old key, re-encrypt with new key)

---

### 2. Phase 9.2: Granular Telemetry (bd-asmgl6.1)

**Objective**: Enable per-agent cost tracking for detailed usage analytics and budget optimization.

**Schema Changes** (`Mission` model):

```prisma
model Mission {
  // ... existing fields ...
  cost       Int      // Total cost in credits (existing)
  agentCosts Json?    // Phase 9.2: Per-agent cost breakdown
}
```

**Field Added**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `agentCosts` | `Json?` | `null` | Per-agent breakdown: `{ agentName: { tokens, cost, duration } }` |

**Data Structure**:

```typescript
agentCosts: {
  "genesis-architect": {
    tokens: 12450,
    cost: 125,      // in credits
    duration: 2300  // in milliseconds
  },
  "seo-analyst": {
    tokens: 8200,
    cost: 82,
    duration: 1800
  }
  // ... more agents
}
```

**Purpose**:
- Track token usage per agent for cost attribution
- Enable cost distribution pie charts in analytics dashboard
- Optimize budget allocation based on agent performance
- Identify expensive agents for optimization

---

## Migration File

**Location**: `prisma/migrations/20260127082732_phase_9_vault_and_telemetry/migration.sql`

**SQL**:

```sql
-- Phase 9.1: Vault Hardening - Add key versioning and rotation history
-- Phase 9.2: Granular Telemetry - Add per-agent cost tracking

-- AlterTable: Add vault security fields to UserProfile
ALTER TABLE "UserProfile" ADD COLUMN "keyVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "UserProfile" ADD COLUMN "keyRotationHistory" JSONB;

-- AlterTable: Add per-agent cost tracking to Mission
ALTER TABLE "Mission" ADD COLUMN "agentCosts" JSONB;

-- Comments for documentation
COMMENT ON COLUMN "UserProfile"."keyVersion" IS 'Current encryption key version for vault secrets';
COMMENT ON COLUMN "UserProfile"."keyRotationHistory" IS 'Audit trail: [{ version: number, rotatedAt: string, rotatedBy: string }]';
COMMENT ON COLUMN "Mission"."agentCosts" IS 'Per-agent breakdown: { agentName: { tokens: number, cost: number, duration: number } }';
```

---

## Applying the Migration

When the database is available, run:

```bash
# Apply migration to development database
npx prisma migrate deploy

# Or for development with database reset
npx prisma migrate dev
```

**Note**: Migration is currently created but not applied (database not running).

---

## Impact on Existing Data

### Backward Compatibility

✅ **Safe Migration**: All changes are non-breaking:
- `keyVersion` defaults to `1` for existing users (current key)
- `keyRotationHistory` is optional (starts as `null`)
- `agentCosts` is optional (starts as `null`)

### Existing Records

After migration:
- **UserProfile**: All existing records will have `keyVersion = 1` and `keyRotationHistory = null`
- **Mission**: All existing records will have `agentCosts = null`

### Future Records

After Phase 9 implementation:
- **New UserProfile**: `keyVersion = 1`, `keyRotationHistory = []`
- **New Mission**: `agentCosts = { ... }` populated during execution

---

## Next Steps (Implementation)

### Phase 9.1: Vault Hardening

Now that schema is ready, proceed to:

1. **bd-maskaw.2** ✅ READY - Encryption Service Refactor
   - Implement `rotateEncryptionKeys()` in `src/lib/encryption.ts`
   - Add key versioning support to encrypt/decrypt functions
   - Implement graceful decryption (try all versions)

2. **bd-maskaw.3** - Rotation API Endpoint
   - Create `POST /api/vault/rotate` endpoint
   - Implement rotation workflow with transactions
   - Add audit logging

3. **bd-maskaw.4** - Vault UI Integration
   - Update dashboard to call real rotation API
   - Show rotation history

4. **bd-maskaw.5** - Security Testing
   - Test rotation with existing data
   - Verify audit logging

### Phase 9.2: Granular Telemetry

Now that schema is ready, proceed to:

1. **bd-asmgl6.2** ✅ READY - Mission Overseer Cost Tracking
   - Update `src/agents/mission-overseer.ts` to track per-agent costs
   - Populate `agentCosts` field during execution

2. **bd-asmgl6.3** - Cost Breakdown Query
   - Create `getAgentCostBreakdown()` server action
   - Aggregate statistics

3. **bd-asmgl6.4** - Analytics Dashboard Component
   - Create pie chart component
   - Show per-agent breakdown

4. **bd-asmgl6.5** - Performance Testing
   - Verify tracking overhead <5%

---

## Testing Checklist

### Pre-Deployment Validation

- [ ] Migration file syntax is valid (PostgreSQL)
- [ ] Default values are set correctly
- [ ] Comments are clear and accurate
- [ ] No data loss in migration
- [ ] Schema matches Prisma models

### Post-Deployment Validation

- [ ] Migration applies successfully
- [ ] Existing records have correct defaults
- [ ] New records can be created
- [ ] Prisma Client regenerated
- [ ] Type safety maintained in TypeScript

### Integration Testing

- [ ] Key rotation workflow (Phase 9.1)
- [ ] Cost tracking workflow (Phase 9.2)
- [ ] Dashboard displays data correctly
- [ ] API endpoints work with new fields

---

## Beads-Lite Task Updates

### Completed Tasks

✅ **bd-maskaw.1** - Task 9.1.1: Database Schema Migration
✅ **bd-asmgl6.1** - Task 9.2.1: Database Schema Extension

### Newly Ready Tasks

🎯 **bd-maskaw.2** - Task 9.1.2: Encryption Service Refactor (Priority 0)
🎯 **bd-asmgl6.2** - Task 9.2.2: Mission Overseer Cost Tracking (Priority 1)

### Project Statistics

- **Total Tasks**: 25
- **Completed**: 2 (8%)
- **Ready**: 5 (20%)
- **Blocked**: 18 (72%)

---

## Security Considerations

### Key Versioning

- **Immutable History**: Once a key version is rotated out, it should remain available for decryption of old data
- **Audit Trail**: All rotation events must be logged with timestamp and user ID
- **Compliance**: Rotation history supports SOC2, GDPR, and HIPAA requirements

### Per-Agent Costs

- **Data Privacy**: Agent costs are tied to missions, not individual users
- **Aggregation**: Cost data can be aggregated for analytics without PII
- **Retention**: Consider data retention policy for old mission costs

---

## Performance Considerations

### Database Impact

- **keyVersion**: Integer index (minimal overhead)
- **keyRotationHistory**: JSONB field (small size, ~200 bytes per rotation)
- **agentCosts**: JSONB field (varies by agent count, ~500 bytes average)

**Estimated Storage**:
- Per user: +208 bytes (keyVersion + rotation history for 10 rotations)
- Per mission: +500 bytes (agentCosts for 5 agents)

### Query Performance

- All new fields are optional and don't affect existing queries
- JSONB fields support GIN indexes if needed for complex queries
- No impact on critical path queries (authentication, mission execution)

---

## Rollback Plan

If issues arise, rollback migration:

```sql
-- Rollback Phase 9 migration
ALTER TABLE "UserProfile" DROP COLUMN "keyVersion";
ALTER TABLE "UserProfile" DROP COLUMN "keyRotationHistory";
ALTER TABLE "Mission" DROP COLUMN "agentCosts";
```

**Note**: Only rollback before production deployment. After production use, coordinate with data team.

---

## References

- **SPEC.md**: Part 5 - Database Schema
- **PHASE_9_SPEC.md**: Requirements 9.1.1 and 9.2.1
- **IMPLEMENTATION_PLAN.md**: Tasks 9.1.1 and 9.2.1
- **BEADS_LITE_GUIDE.md**: Task tracking documentation

---

**Migration Status**: ✅ Created
**Database Status**: ⏳ Pending deployment
**Next Action**: Implement Encryption Service Refactor (bd-maskaw.2)
