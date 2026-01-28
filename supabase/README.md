# Supabase Migrations

This folder contains SQL migrations for the G-Pilot Supabase database.

## Quick Start

### Running Migrations

**Option 1: Supabase Dashboard (Recommended)**

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new)
2. Copy the contents of the migration file from `migrations/` folder
3. Paste into the SQL Editor
4. Click "Run" to execute
5. Verify success message in the output panel

**Option 2: Automated Runner (Development)**

```bash
node supabase/run-migration.js 20260128_phase_9_vault_telemetry.sql
```

**Note:** The automated runner provides guidance but requires manual execution in the Supabase Dashboard for security.

## Available Migrations

### Phase 9: Vault Hardening + Granular Telemetry
**File:** `20260128_phase_9_vault_telemetry.sql`
**Status:** Ready to apply

**Changes:**
- Adds `keyVersion` column to `UserProfile` for encryption key versioning
- Adds `keyRotationHistory` JSONB column to `UserProfile` for audit trail
- Adds `agentCosts` JSONB column to `Mission` for per-agent cost tracking

**Purpose:**
- **Phase 9.1 (Vault Hardening):** Enables zero-downtime encryption key rotation with full audit history
- **Phase 9.2 (Granular Telemetry):** Provides transparency into which agents consume the most resources

**Sample Data Structures:**

```json
// UserProfile.keyRotationHistory
[
  {
    "version": 2,
    "rotatedAt": "2026-01-28T05:00:00.000Z",
    "rotatedBy": "user_2abc123",
    "reason": "Scheduled 90-day rotation"
  }
]

// Mission.agentCosts
{
  "marketing-strategist": {
    "tokens": 1250,
    "cost": 125,
    "duration": 3500
  },
  "seo-analyst": {
    "tokens": 800,
    "cost": 80,
    "duration": 2100
  }
}
```

## Migration Workflow

1. **Review:** Check the SQL file for syntax and logic errors
2. **Test:** Run in a development/staging environment first
3. **Backup:** Always backup your database before applying migrations
4. **Apply:** Execute the migration in production
5. **Verify:** Confirm all columns were added and constraints applied
6. **Document:** Update this README with migration status

## Troubleshooting

### "Table does not exist" error
- Ensure you're running migrations in the correct order
- Check that your Prisma schema is up to date
- Run `npx prisma migrate deploy` to sync Prisma migrations first

### "Column already exists" error
- The migration uses `IF NOT EXISTS` checks to be idempotent
- Safe to re-run if needed
- Check if a previous migration already added the column

### Supabase connection issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- Ensure `SUPABASE_SERVICE_ROLE_KEY` has admin privileges
- Check Supabase project status at https://supabase.com/dashboard

## Database Schema

After Phase 9 migrations, your schema will include:

```sql
-- UserProfile
CREATE TABLE "UserProfile" (
  -- ... existing columns ...
  "keyVersion" INTEGER NOT NULL DEFAULT 1,
  "keyRotationHistory" JSONB,
  -- ...
);

-- Mission
CREATE TABLE "Mission" (
  -- ... existing columns ...
  "agentCosts" JSONB,
  -- ...
);
```

## Security Notes

- **Key Rotation:** The `keyRotationHistory` field contains sensitive audit data. Ensure proper access controls.
- **Service Role Key:** Never commit the `SUPABASE_SERVICE_ROLE_KEY` to version control.
- **Production Migrations:** Always test in staging before applying to production.

## Support

For issues or questions:
- Check [Supabase Documentation](https://supabase.com/docs)
- Review [G-Pilot Architecture Docs](../docs/architecture/)
- Create an issue in the project repository
