# Google Cloud Deployment Automation Script for Swaramayi Real Estate CRM

param (
    [string]$GcpProjectId = "",
    [string]$Region = "asia-south1",
    [string]$MongoUri = "",
    [string]$GoogleMapsApiKey = ""
)

if (-not $GcpProjectId) {
    $GcpProjectId = Read-Host "Enter your Google Cloud Project ID (e.g., swaramayi-crm-prod)"
}

# Auto-add Google Cloud SDK to PATH if present
$GcloudPaths = @(
    "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin",
    "C:\Program Files\Google\Cloud SDK\google-cloud-sdk\bin",
    "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"
)
foreach ($p in $GcloudPaths) {
    if ((Test-Path $p) -and ($env:PATH -notlike "*$p*")) {
        $env:PATH = "$p;$env:PATH"
    }
}

if (-not $GcpProjectId) {
    Write-Error "GCP Project ID is required."
    exit 1
}

# Check if gcloud CLI is installed
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host "❌ ERROR: Google Cloud SDK ('gcloud' CLI) is not installed!" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host "To deploy to Google Cloud, please install the Google Cloud SDK:" -ForegroundColor Yellow
    Write-Host "👉 Download: https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing Google Cloud SDK:" -ForegroundColor Yellow
    Write-Host "1. Restart VS Code / Terminal" -ForegroundColor Yellow
    Write-Host "2. Run: gcloud auth login" -ForegroundColor Yellow
    Write-Host "3. Run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting GCP Deployment for $GcpProjectId" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Set Active GCP Project
Write-Host "1. Setting active GCP project to $GcpProjectId..." -ForegroundColor Yellow
gcloud config set project $GcpProjectId

# 2. Enable Required APIs
Write-Host "2. Enabling required GCP APIs (Cloud Run, Cloud Build, Secret Manager, Artifact Registry)..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# 3. Create Artifact Registry Repository if not exists
Write-Host "3. Ensuring Artifact Registry repository 'swaramayi-repo' exists in region $Region..." -ForegroundColor Yellow
gcloud artifacts repositories describe swaramayi-repo --location=$Region 2>$null
if ($LASTEXITCODE -ne 0) {
    gcloud artifacts repositories create swaramayi-repo --repository-format=docker --location=$Region --description="Swaramayi Real Estate CRM Containers"
}

# 4. Deploy Backend Container to Google Cloud Run
Write-Host "4. Building and deploying Backend API to Cloud Run..." -ForegroundColor Yellow
$BackendRepo = "$Region-docker.pkg.dev/$GcpProjectId/swaramayi-repo/backend:latest"

Set-Location "$PSScriptRoot/backend"
gcloud builds submit --tag $BackendRepo

gcloud run deploy swaramayi-backend `
    --image $BackendRepo `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars "NODE_ENV=production,PORT=5000"

$BackendUrl = (gcloud run services describe swaramayi-backend --region $Region --format "value(status.url)")
Write-Host "✅ Backend Deployed Successfully: $BackendUrl" -ForegroundColor Green

# 5. Build and Deploy Frontend Container to Google Cloud Run
Write-Host "5. Building and deploying Frontend UI to Cloud Run..." -ForegroundColor Yellow
$FrontendRepo = "$Region-docker.pkg.dev/$GcpProjectId/swaramayi-repo/frontend:latest"
$ApiBaseUrl = "$BackendUrl/api/v1"

Set-Location "$PSScriptRoot/frontend"
gcloud builds submit --tag $FrontendRepo --substitutions "_VITE_API_BASE_URL=$ApiBaseUrl,_VITE_GOOGLE_MAPS_API_KEY=$GoogleMapsApiKey"

gcloud run deploy swaramayi-frontend `
    --image $FrontendRepo `
    --region $Region `
    --allow-unauthenticated `
    --port 80

$FrontendUrl = (gcloud run services describe swaramayi-frontend --region $Region --format "value(status.url)")
Write-Host "=========================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Cyan
Write-Host "Backend URL:  $BackendUrl" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
Set-Location $PSScriptRoot
