import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Option 1: Explicit Private Key (Traditional Environment Variable)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Option 2: Application Default Credentials (ADC) - "Keyless"
    // Works for:
    // 1. Local Dev: Run `gcloud auth application-default login`
    // 2. Cloud Run: Inherits 'Compute Engine default service account' identity automatically
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    });
  }
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const adminMessaging = admin.messaging();
