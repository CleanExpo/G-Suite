# GitHub Secrets Configuration Guide

This document lists all required GitHub secrets for CI/CD workflows to function properly.

## 📋 Required Secrets

### 1. Percy (Visual Regression Testing)

**Secret Name**: `PERCY_TOKEN`
**Required For**: Advanced Testing workflow (visual regression)
**How to Get**:
1. Sign up at https://percy.io (free tier available)
2. Create a new project: "NodeJS-Starter-V1"
3. Copy the project token from Settings → Project Settings
4. The token looks like: `aaaa1111bbbb2222cccc3333dddd4444`

**Usage**: `.github/workflows/advanced-testing.yml` (visual-regression job)

---

### 2. Pact Broker (Contract Testing)

**Secret Name**: `PACT_BROKER_BASE_URL`
**Required For**: Advanced Testing workflow (contract tests)
**How to Get**:
1. Option A - Pactflow (Recommended):
   - Sign up at https://pactflow.io (free tier available)
   - Create organization and note the broker URL
   - URL format: `https://YOUR_ORG.pactflow.io`

2. Option B - Self-hosted:
   - Deploy Pact Broker using Docker
   - URL format: `https://your-pact-broker.com`

**Additional Secret**: `PACT_BROKER_TOKEN` (if using Pactflow)
- Get from Pactflow Settings → API Tokens
- Create a "Read/Write" token

**Usage**: `.github/workflows/advanced-testing.yml` (contract-tests job)

---

### 3. Snyk (Security Scanning)

**Secret Name**: `SNYK_TOKEN`
**Required For**: Security workflow (vulnerability scanning)
**How to Get**:
1. Sign up at https://snyk.io (free tier available)
2. Go to Account Settings → General → Auth Token
3. Copy the API token
4. The token looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Usage**: `.github/workflows/security.yml` (snyk-frontend and snyk-backend jobs)

---

### 4. Codecov (Code Coverage Reporting)

**Secret Name**: `CODECOV_TOKEN`
**Required For**: CI workflow (coverage reporting)
**How to Get**:
1. Sign up at https://codecov.io (free for open source)
2. Add your GitHub repository
3. Copy the upload token from Settings
4. The token looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Usage**: `.github/workflows/ci.yml` (backend-tests and frontend-tests jobs)

---

### 5. Deployment Secrets (Optional - For Production)

#### Backend Deployment (DigitalOcean)

**Secret Name**: `DIGITALOCEAN_ACCESS_TOKEN`
**Required For**: Backend deployment workflow
**How to Get**:
1. Login to DigitalOcean
2. Go to API → Tokens/Keys
3. Generate New Token with "Write" scope
4. Copy the token (shown only once)

**Usage**: `.github/workflows/deploy-backend.yml`

#### Frontend Deployment (Vercel)

**Secret Name**: `VERCEL_TOKEN`
**Required For**: Frontend deployment workflow (if not using GitHub integration)
**How to Get**:
1. Login to Vercel
2. Go to Settings → Tokens
3. Create new token
4. Copy the token

**Note**: Vercel GitHub integration handles deployment automatically, so this may not be needed.

**Usage**: `.github/workflows/deploy-frontend.yml`

---

## 🔧 How to Add Secrets to GitHub

### Method 1: GitHub Web Interface (Recommended)

1. **Navigate to Repository Settings**:
   ```
   https://github.com/CleanExpo/NodeJS-Starter-V1/settings/secrets/actions
   ```

2. **Add Each Secret**:
   - Click "New repository secret"
   - Enter the secret name (exactly as shown above)
   - Paste the secret value
   - Click "Add secret"

3. **Verify Secrets**:
   - You should see all secrets listed (values are hidden)
   - Secrets are available immediately to workflows

### Method 2: GitHub CLI (Alternative)

```bash
# Set Percy token
gh secret set PERCY_TOKEN -b "your-percy-token-here"

# Set Pact Broker URL
gh secret set PACT_BROKER_BASE_URL -b "https://your-org.pactflow.io"

# Set Pact Broker token
gh secret set PACT_BROKER_TOKEN -b "your-pact-token-here"

# Set Snyk token
gh secret set SNYK_TOKEN -b "your-snyk-token-here"

# Set Codecov token
gh secret set CODECOV_TOKEN -b "your-codecov-token-here"

# Optional: Deployment secrets
gh secret set DIGITALOCEAN_ACCESS_TOKEN -b "your-do-token-here"
gh secret set VERCEL_TOKEN -b "your-vercel-token-here"
```

---

## ✅ Required Secrets Checklist

### For Testing Workflows to Work (Priority 1)

- [ ] `PERCY_TOKEN` - Visual regression tests
- [ ] `PACT_BROKER_BASE_URL` - Contract tests
- [ ] `PACT_BROKER_TOKEN` - Contract tests (if using Pactflow)
- [ ] `CODECOV_TOKEN` - Code coverage reporting

### For Security Scanning (Priority 2)

- [ ] `SNYK_TOKEN` - Vulnerability scanning (optional but recommended)

### For Deployment (Priority 3 - Only if deploying)

- [ ] `DIGITALOCEAN_ACCESS_TOKEN` - Backend deployment
- [ ] `VERCEL_TOKEN` - Frontend deployment (if not using GitHub integration)

---

## 🔐 Security Best Practices

1. **Never Commit Secrets**:
   - Secrets are stored in GitHub's encrypted vault
   - Never add secrets to code or configuration files
   - Use `.gitignore` for local `.env` files

2. **Rotate Tokens Regularly**:
   - Rotate tokens every 90 days
   - Immediately rotate if exposed
   - Use minimal permission scopes

3. **Use Separate Tokens**:
   - Different token for each environment (dev/staging/prod)
   - Different token for each service
   - Never share tokens across projects

4. **Monitor Usage**:
   - Review workflow logs for suspicious activity
   - Check token usage in service dashboards
   - Set up alerts for failed authentication

---

## 🧪 Testing Secrets Configuration

After adding secrets, test by:

1. **Manual Workflow Trigger**:
   - Go to Actions → Select workflow
   - Click "Run workflow"
   - Check if jobs complete successfully

2. **Check Workflow Logs**:
   - Verify secrets are being used (not exposed in logs)
   - Look for authentication success messages
   - Confirm no "missing secret" errors

3. **Example Test Commands**:
   ```bash
   # Trigger Advanced Testing workflow
   gh workflow run advanced-testing.yml

   # Trigger Security workflow
   gh workflow run security.yml

   # Check workflow status
   gh run list --workflow=advanced-testing.yml --limit 1
   ```

---

## 🚨 Troubleshooting

### Issue: "Secret not found" error

**Solution**:
- Verify secret name matches exactly (case-sensitive)
- Check secret is added to repository (not organization)
- Ensure secret is in "Repository secrets" not "Environment secrets"

### Issue: "Invalid token" error

**Solution**:
- Verify token is copied correctly (no extra spaces)
- Check token hasn't expired
- Ensure token has correct permissions
- Generate new token if needed

### Issue: Workflows still failing after adding secrets

**Solution**:
- Re-run workflow (secrets available immediately but may need retry)
- Check workflow logs for specific error
- Verify service (Percy/Pact/Snyk) is accessible from GitHub Actions
- Check if additional configuration needed in workflow file

---

## 📚 Additional Resources

- **Percy Documentation**: https://docs.percy.io/docs
- **Pact Documentation**: https://docs.pact.io
- **Snyk Documentation**: https://docs.snyk.io
- **Codecov Documentation**: https://docs.codecov.com
- **GitHub Secrets Documentation**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

## 🔄 Secrets Update Log

| Secret | Added Date | Last Rotated | Next Rotation |
|--------|-----------|--------------|---------------|
| PERCY_TOKEN | - | - | - |
| PACT_BROKER_BASE_URL | - | - | N/A (URL) |
| PACT_BROKER_TOKEN | - | - | - |
| SNYK_TOKEN | - | - | - |
| CODECOV_TOKEN | - | - | - |

**Recommendation**: Rotate tokens every 90 days for security.

---

## ⚡ Quick Setup (Free Tier Services)

For fastest setup using free tier services:

1. **Percy.io** (Free tier):
   - 5,000 snapshots/month
   - Unlimited projects
   - Sign up: https://percy.io/signup

2. **Pactflow** (Free tier):
   - 5 integrations
   - Unlimited contracts
   - Sign up: https://pactflow.io/try-for-free/

3. **Snyk** (Free tier):
   - Unlimited tests for open source
   - 200 tests/month for private repos
   - Sign up: https://snyk.io/signup

4. **Codecov** (Free tier):
   - Unlimited for public repos
   - Coverage reports and trends
   - Sign up: https://codecov.io/signup

All services integrate seamlessly with GitHub Actions.

---

**Created**: 2026-01-06
**Updated**: 2026-01-06
**Maintained By**: Development Team
