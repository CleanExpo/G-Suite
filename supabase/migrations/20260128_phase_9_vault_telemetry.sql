-- ================================================================
-- Phase 9.1 & 9.2: Vault Hardening + Granular Telemetry
-- ================================================================
-- Created: 2026-01-28
-- Description: Adds encryption key versioning, rotation history,
--              and per-agent cost tracking for transparency.
-- ================================================================

-- ─── Phase 9.1: Vault Hardening ─────────────────────────────────

-- Add key versioning and rotation history to UserProfile
-- This enables zero-downtime encryption key rotation with full audit trail

DO $$
BEGIN
    -- Add keyVersion column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'UserProfile'
        AND column_name = 'keyVersion'
    ) THEN
        ALTER TABLE "UserProfile"
        ADD COLUMN "keyVersion" INTEGER NOT NULL DEFAULT 1;
    END IF;

    -- Add keyRotationHistory column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'UserProfile'
        AND column_name = 'keyRotationHistory'
    ) THEN
        ALTER TABLE "UserProfile"
        ADD COLUMN "keyRotationHistory" JSONB;
    END IF;
END $$;

-- Add helpful comments for documentation
COMMENT ON COLUMN "UserProfile"."keyVersion" IS
    'Current encryption key version for vault secrets (Phase 9.1)';

COMMENT ON COLUMN "UserProfile"."keyRotationHistory" IS
    'Audit trail for key rotations: [{ version: number, rotatedAt: string, rotatedBy: string, reason: string }] (Phase 9.1)';

-- ─── Phase 9.2: Granular Telemetry ──────────────────────────────

-- Add per-agent cost breakdown to Mission table
-- This provides transparency into which agents consume the most resources

DO $$
BEGIN
    -- Add agentCosts column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Mission'
        AND column_name = 'agentCosts'
    ) THEN
        ALTER TABLE "Mission"
        ADD COLUMN "agentCosts" JSONB;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN "Mission"."agentCosts" IS
    'Per-agent resource breakdown: { "agent-name": { tokens: number, cost: number, duration: number } } (Phase 9.2)';

-- ─── Verification ───────────────────────────────────────────────

-- Verify columns were added successfully
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check UserProfile.keyVersion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'UserProfile' AND column_name = 'keyVersion'
    ) THEN
        missing_columns := array_append(missing_columns, 'UserProfile.keyVersion');
    END IF;

    -- Check UserProfile.keyRotationHistory
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'UserProfile' AND column_name = 'keyRotationHistory'
    ) THEN
        missing_columns := array_append(missing_columns, 'UserProfile.keyRotationHistory');
    END IF;

    -- Check Mission.agentCosts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Mission' AND column_name = 'agentCosts'
    ) THEN
        missing_columns := array_append(missing_columns, 'Mission.agentCosts');
    END IF;

    -- Report results
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Migration failed! Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✅ Phase 9 migration completed successfully';
        RAISE NOTICE '   - Added UserProfile.keyVersion';
        RAISE NOTICE '   - Added UserProfile.keyRotationHistory';
        RAISE NOTICE '   - Added Mission.agentCosts';
    END IF;
END $$;

-- ================================================================
-- End of Phase 9 Migration
-- ================================================================
