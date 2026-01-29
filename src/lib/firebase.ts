import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Lazy initialization to prevent build-time errors
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

/**
 * Get Firebase App instance (lazy initialization)
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    // Only initialize if we have a valid API key
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase API key not configured');
    }
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

/**
 * Get Firebase Auth instance (lazy initialization)
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

/**
 * Get Firestore instance (lazy initialization)
 */
export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}

// Legacy exports for backward compatibility (lazy getters)
export { getFirebaseApp as app, getFirebaseAuth as auth, getFirebaseFirestore as firestore };
