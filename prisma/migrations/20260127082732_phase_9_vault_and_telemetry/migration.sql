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
