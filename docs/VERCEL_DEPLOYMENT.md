# Vercel Deployment Checklist for G-Pilot

## 🚀 Pre-Deployment Verification

### 1. Environment Variables (Vercel Dashboard)
Ensure all required environment variables are configured in the Vercel project settings:

#### Core Google APIs
- `GOOGLE_API_KEY` - Google AI Studio API key
- `GOOGLE_CLOUD_PROJECT` - GCP Project ID
- `VERTEX_AI_LOCATION` - us-central1
- `GOOGLE_CLIENT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key (JSON format)

#### Database
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

#### Optional Services
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase service account
- `FIREBASE_PRIVATE_KEY` - Firebase private key

### 2. Build Configuration
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: **20.x** (specified in package.json engines)

### 3. Domain & DNS
- Production URL: `https://g-pilot.app`
- DNS A Record: Points to Vercel's IP
- SSL Certificate: Auto-provisioned by Vercel

### 4. Routing Configuration
The `vercel.json` file is configured with:
- **Rewrites**: Root (`/`) and `/index.html` redirect to `/en` (default locale)
- **Headers**: Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Framework**: Next.js with clean URLs enabled

### 5. Middleware & Locale Routing
- `src/middleware.ts` handles locale detection and redirection
- Supported locales: `en`, `es`, `fr`, `de`, `ja`, `zh`
- Default locale: `en`
- Locale prefix: `as-needed` (only non-default locales show in URL)

## 🔍 Post-Deployment Verification

### Health Check
```bash
curl https://g-pilot.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "components": [...],
  "agents": { "total": 14, "ready": 14 }
}
```

### Routing Tests
- `https://g-pilot.app/` → Should redirect to `/en`
- `https://g-pilot.app/en` → Landing page (English)
- `https://g-pilot.app/es` → Landing page (Spanish)
- `https://g-pilot.app/en/dashboard` → Dashboard (authenticated)
- `https://g-pilot.app/api/health` → Health check endpoint

### API Endpoints
- `/api/health` - System health
- `/api/mission` - Mission execution
- `/api/webhooks/stripe` - Stripe webhooks
- `/api/vault/rotate` - Key rotation

## 🛡️ Security Checklist
- [x] All secrets stored in Vercel environment variables
- [x] `NEXT_PUBLIC_*` variables are safe for client exposure
- [x] Private keys are properly escaped (newlines as `\n`)
- [x] HTTPS enforced via HSTS header
- [x] CSP headers configured
- [x] API routes protected by authentication

## 🐛 Common Issues & Solutions

### Issue: "Vercel login page appears"
**Solution**: Check that the production domain is correctly configured in Vercel project settings. Ensure no authentication is required for public routes.

### Issue: "404 on locale routes"
**Solution**: Verify `src/middleware.ts` is correctly configured and `next-intl` is installed. Check that `vercel.json` rewrites are in place.

### Issue: "Environment variables not loading"
**Solution**: Ensure variables are set in Vercel dashboard for the correct environment (Production/Preview/Development). Redeploy after adding new variables.

### Issue: "Build fails with module errors"
**Solution**: Check `package.json` dependencies are locked. Run `npm install` locally to verify. Ensure Node version matches Vercel's.

### Issue: "API routes return 500"
**Solution**: Check Vercel function logs. Verify all required environment variables are set. Ensure database connection string is correct.

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals (LCP, FID, CLS)
- Track deployment frequency and success rate

### Application Monitoring
- Health endpoint: `/api/health`
- Agent status: Check `agents.ready` count
- Google product connectivity: Verify all services are "connected"

## 🔄 Deployment Workflow

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Build Test**
   ```bash
   npm run build
   npm start
   ```

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin main
   ```

4. **Automatic Deployment**
   - Vercel automatically deploys on push to `main`
   - Preview deployments created for PRs
   - Production deployment requires manual promotion (optional)

5. **Post-Deployment Verification**
   - Run health check
   - Test critical user flows
   - Verify environment variables are loaded
   - Check Vercel function logs for errors

## 📝 Notes

- The application uses **Next.js 16** with Turbopack for faster builds
- **Standalone output** is configured for optimized Docker deployments
- **Dynamic routes** are handled by Next.js App Router
- **Static assets** are served from `/public` directory
- **API routes** are serverless functions deployed to Vercel Edge Network
