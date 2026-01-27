# Firebase Deployment Setup Guide

## Overview

This guide provides step-by-step instructions to deploy G-Pilot to Firebase with real-time tracking, CDN hosting, and Cloud Run backend integration.

## 🎯 What's Been Implemented

### ✅ Completed Files
- `firebase.json` - Firebase configuration for Hosting, Firestore, and Storage
- `.firebaserc` - Firebase project association (requires project ID update)
- `firestore.rules` - Security rules for Firestore database
- `storage.rules` - Security rules for Cloud Storage
- `firestore.indexes.json` - Firestore indexes configuration
- `src/tools/firebaseSkills.ts` - Firebase integration module (Firestore, Storage, Messaging)
- `src/agents/mission-overseer.ts` - Enhanced with real-time Firebase tracking
- `scripts/deploy-firebase.sh` - Automated deployment script
- `.github/workflows/deploy.yml` - CI/CD pipeline with Firebase deployment

### 🔥 Firebase Features Integrated
1. **Real-time Mission Tracking** - Live mission status updates in Firestore
2. **File Uploads** - Cloud Storage for generated outputs (PDFs, images)
3. **Push Notifications** - Cloud Messaging for mission completion alerts
4. **Security Rules** - Firestore and Storage rules for data protection
5. **CI/CD Pipeline** - GitHub Actions workflow for automated deployment

---

## 📋 Manual Setup Required

### Phase 1: Firebase Console Setup (30 minutes)

#### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `g-pilot-production` (or your preference)
4. Enable Google Analytics: **Yes** (recommended)
5. Select/create Analytics account
6. Click **"Create project"**
7. Wait for project creation to complete

#### 1.2 Enable Firebase Services

**Enable Firestore:**
```
Console → Build → Firestore Database → Create database
- Mode: Production mode
- Location: us-central (or closest to your users)
- Click "Create"
```

**Enable Cloud Storage:**
```
Console → Build → Storage → Get started
- Mode: Production mode
- Location: us-central (same as Firestore)
- Click "Done"
```

**Enable Cloud Messaging:**
```
Console → Build → Messaging → Get started
- Follow setup wizard
- Note: This is for push notifications (optional but recommended)
```

**Enable Hosting:**
```
Console → Build → Hosting → Get started
- Click "Get started"
- Follow initial setup steps
```

#### 1.3 Get Firebase Credentials

**Client-side Web App Config:**
```
Console → Project Settings (⚙️) → General → Your apps
- Click "Add app" (</> Web icon)
- App nickname: "G-Pilot Web"
- Enable Firebase Hosting: Yes
- Click "Register app"
- Copy the firebaseConfig object
```

You'll get something like:
```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
}
```

**Server-side Admin SDK:**
```
Console → Project Settings → Service accounts → Generate new private key
- Click "Generate new private key"
- Download the JSON file (keep it secure!)
```

---

### Phase 2: Local Configuration (15 minutes)

#### 2.1 Update .firebaserc

Open `.firebaserc` and replace `your-firebase-project-id` with your actual project ID:

```json
{
  "projects": {
    "default": "g-pilot-production"
  }
}
```

#### 2.2 Update .env File

Add Firebase credentials to your `.env` file:

```bash
# Client-side (from Firebase Console → Project Settings → Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Server-side (from downloaded JSON file)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

**⚠️ IMPORTANT:** Never commit the `.env` file or the downloaded JSON file to git!

---

### Phase 3: Firebase CLI Setup (10 minutes)

#### 3.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

#### 3.2 Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

#### 3.3 Test Configuration

```bash
firebase projects:list
```

You should see your project listed.

---

### Phase 4: Set Up GitHub Secrets (20 minutes)

Go to **GitHub Repository → Settings → Secrets and variables → Actions**

#### Required Secrets:

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your API key | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your project ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | Firebase Console → Project Settings |
| `FIREBASE_PROJECT_ID` | Your project ID | Firebase Console → Project Settings |
| `FIREBASE_TOKEN` | CI token | Run `firebase login:ci` and copy token |
| `GOOGLE_CLOUD_PROJECT` | Your GCP project ID | (Existing - for Cloud Run) |
| `WIF_PROVIDER` | Workload Identity Provider | (Existing - for Cloud Run) |
| `WIF_SERVICE_ACCOUNT` | Service account email | (Existing - for Cloud Run) |

#### Generate FIREBASE_TOKEN:

```bash
firebase login:ci
```

Copy the generated token and add it to GitHub Secrets as `FIREBASE_TOKEN`.

---

### Phase 5: Deploy to Production (5 minutes)

#### Option A: Deploy via GitHub (Recommended)

```bash
git add .
git commit -m "feat: Firebase deployment setup complete"
git push origin main
```

GitHub Actions will automatically:
1. Build Next.js with Firebase env vars
2. Deploy to Cloud Run
3. Deploy Firestore rules
4. Deploy Storage rules
5. Deploy to Firebase Hosting

#### Option B: Manual Deployment

```bash
# Make script executable (Linux/Mac only)
chmod +x scripts/deploy-firebase.sh

# Run deployment script
./scripts/deploy-firebase.sh
```

Or deploy individually:
```bash
npm run build
firebase deploy --only firestore
firebase deploy --only storage
firebase deploy --only hosting
```

---

## 🧪 Testing the Setup

### 1. Test Local Development

```bash
npm run dev
```

Visit `http://localhost:4000` and create a test mission. Check Firestore console for real-time updates.

### 2. Test Firestore Console

Go to **Firebase Console → Firestore Database**

You should see:
- `missions` collection with live mission documents
- Real-time updates as mission progresses

### 3. Test Storage

Go to **Firebase Console → Storage**

Files uploaded during missions should appear in `users/{userId}/outputs/` path.

### 4. Test Production Deployment

Visit your Firebase Hosting URL:
```
https://your-project-id.web.app
```

Or custom domain if configured.

---

## 📊 Monitoring & Debugging

### Firebase Console Dashboards

- **Firestore Usage**: Console → Firestore Database → Usage
- **Storage Usage**: Console → Storage → Usage
- **Hosting Analytics**: Console → Hosting → Usage
- **Performance**: Console → Performance (if enabled)

### View Mission Logs in Firestore

```javascript
// In Firebase Console → Firestore Database
// Navigate to: missions/{missionId}
// You'll see:
{
  missionId: "mission_1234567890_abc123",
  userId: "user-id",
  status: "completed",
  currentStep: "Final verification",
  progress: 100,
  agentLogs: [
    "[2026-01-27T10:30:00.000Z] Execution started",
    "[2026-01-27T10:30:05.000Z] Starting content-orchestrator execution",
    "[2026-01-27T10:30:15.000Z] Completed content-orchestrator: SUCCESS",
    ...
  ],
  startTime: Timestamp,
  endTime: Timestamp
}
```

### Cloud Run Logs

```bash
gcloud run services logs read gpilot --region us-central1 --limit 50
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to git
- ✅ Use GitHub Secrets for CI/CD
- ✅ Use Google Secret Manager for Cloud Run secrets
- ✅ Rotate Firebase private keys periodically

### 2. Firestore Rules
- ✅ Production mode enabled by default
- ✅ User-based access control (users can only read/write their own data)
- ✅ Server-only writes for sensitive collections (MissionLearning)

### 3. Storage Rules
- ✅ User-based access control (users can only access their own files)
- ✅ Public folder for shared assets (read-only)

---

## 💰 Cost Estimation

### Firebase Free Tier (Spark Plan)

| Service | Free Tier | Expected Usage | Overage Cost |
|---------|-----------|----------------|--------------|
| **Firestore** | 50K reads/day, 20K writes/day | ~10K writes, 30K reads | $0.06/100K reads, $0.18/100K writes |
| **Storage** | 5GB stored, 1GB/day download | ~2GB stored, 500MB/day | $0.026/GB/month |
| **Hosting** | 10GB/month bandwidth | ~8GB/month | $0.15/GB |
| **Cloud Messaging** | Unlimited | Push notifications | Free |

**Estimated Cost**: $0-5/month (likely within free tier)

### Combined Infrastructure

- Cloud Run: ~$50/month
- PostgreSQL (Supabase): $25/month
- Firebase: $0-5/month
- **Total**: ~$75-80/month

---

## 🚀 Next Steps

### Immediate (After Deployment)
1. ✅ Test mission execution with Firebase tracking
2. ✅ Verify Firestore documents are being created
3. ✅ Test file uploads to Storage
4. ✅ Check Firebase Hosting URL is accessible

### Short-term (Week 1)
1. Set up Firebase Performance Monitoring
2. Configure custom domain for Firebase Hosting
3. Set up Firebase Analytics events
4. Implement push notification registration in UI

### Long-term (Month 1)
1. Add Firebase Remote Config for feature flags
2. Implement A/B testing with Firebase
3. Set up Firebase Crashlytics for error tracking
4. Consider migrating more features to Firebase if beneficial

---

## 🔧 Troubleshooting

### Issue: "Firebase CLI not authenticated"
**Solution:**
```bash
firebase login --reauth
firebase use --add
```

### Issue: "Permission denied on Firestore"
**Solution:** Check `firestore.rules` and verify user authentication is working.

For testing, temporarily allow all access:
```
allow read, write: if true; // TESTING ONLY - REMOVE AFTER
```

### Issue: "Cloud Run can't access Firestore"
**Solution:** Grant Firestore access to Cloud Run service account:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR-PROJECT-NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"
```

### Issue: "Hosting not routing to Cloud Run"
**Solution:** Check `firebase.json` rewrites section. Ensure `serviceId` matches your Cloud Run service name (`gpilot`).

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting + Cloud Run Integration](https://firebase.google.com/docs/hosting/cloud-run)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## ✅ Implementation Checklist

### Configuration Files
- [x] `firebase.json` created
- [x] `.firebaserc` created
- [x] `firestore.rules` created
- [x] `storage.rules` created
- [x] `firestore.indexes.json` created

### Code Integration
- [x] `src/tools/firebaseSkills.ts` created
- [x] `src/agents/mission-overseer.ts` updated with Firebase tracking
- [x] Real-time status updates implemented
- [x] File upload functionality implemented
- [x] Push notification support implemented

### Deployment
- [x] `scripts/deploy-firebase.sh` created
- [x] `.github/workflows/deploy.yml` updated with Firebase steps
- [x] GitHub Actions workflow configured

### Manual Steps Required
- [ ] Create Firebase project in console
- [ ] Enable Firestore, Storage, Hosting, Messaging
- [ ] Get Firebase credentials
- [ ] Update `.firebaserc` with project ID
- [ ] Add Firebase credentials to `.env`
- [ ] Install Firebase CLI
- [ ] Login to Firebase CLI
- [ ] Add GitHub Secrets
- [ ] Deploy to production

---

**Status**: ✅ **READY FOR DEPLOYMENT**

All code implementation is complete. Follow the manual setup steps above to deploy to Firebase.
