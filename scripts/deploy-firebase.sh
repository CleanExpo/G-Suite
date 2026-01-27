#!/bin/bash
# Firebase Deployment Script for G-Pilot

set -e

echo "🔥 Starting Firebase Deployment..."

# Step 1: Build Next.js production bundle
echo "📦 Building Next.js production bundle..."
npm run build

# Step 2: Deploy Firestore rules and indexes
echo "🔐 Deploying Firestore rules..."
firebase deploy --only firestore

# Step 3: Deploy Storage rules
echo "📁 Deploying Storage rules..."
firebase deploy --only storage

# Step 4: Deploy to Firebase Hosting (static assets)
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Firebase deployment complete!"
echo "🔗 Your app is live at: https://your-project.firebaseapp.com"
