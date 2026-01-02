$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Cloudflare Worker Security Deployment (Firebase Auth)..." -ForegroundColor Cyan

# Define Secrets
# Note: You MUST enter your Firebase Web API Key here.
# It usually starts with AIza...
$FirebaseApiKey = Read-Host "Please enter your FIREBASE_API_KEY (from .env or Firebase Console)"

if (-not $FirebaseApiKey) {
    Write-Error "API Key is required!"
}

# Navigate to worker directory
Set-Location "cloudflare-worker"

# 1. Set FIREBASE_API_KEY
Write-Host "`n1. Setting FIREBASE_API_KEY secret..." -ForegroundColor Yellow
$FirebaseApiKey | npx wrangler secret put FIREBASE_API_KEY

# 2. Deploy
Write-Host "`n2. Deploying updated secure worker..." -ForegroundColor Yellow
npx wrangler deploy

Write-Host "`n✅ Security Patch Deployed Successfully!" -ForegroundColor Green
