#!/bin/bash

# Configuration - UPDATE THESE
PROJECT_ID="suitepilot-484603-484603"
REGION="australia-southeast1"
SERVICE_NAME="suitepilot"

echo "🚀 Starting SuitePilot Deployment to Google Cloud Run..."

# 1. Build and Submit to Google Cloud Build
echo "📦 Building container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --config=Dockerfile.prod .

# 2. Deploy to Cloud Run
echo "🌍 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 1 \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="DATABASE_URL=${DATABASE_URL}" \
    --set-env-vars="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}" \
    --set-env-vars="CLERK_SECRET_KEY=${CLERK_SECRET_KEY}" \
    --set-env-vars="STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" \
    --set-env-vars="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}" \
    --set-env-vars="STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}" \
    --set-env-vars="GOOGLE_API_KEY=${GOOGLE_API_KEY}" \
    --set-env-vars="GOOGLE_CLIENT_EMAIL=${GOOGLE_CLIENT_EMAIL}" \
    --set-env-vars="GOOGLE_PRIVATE_KEY=${GOOGLE_PRIVATE_KEY}" \
    --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}" \
    --set-env-vars="NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}" \
    --set-env-vars="NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}" \
    --set-env-vars="NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}" \
    --set-env-vars="NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}" \
    --set-env-vars="NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}" \
    --set-env-vars="NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}" \
    --set-env-vars="FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}"

echo "✅ Deployment Complete!"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
