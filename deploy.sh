#!/bin/bash

# Trasealla Backend Deployment Script
# This script deploys the backend to production server

set -e

echo "🚀 Starting Trasealla Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="root"
SERVER_HOST="72.61.177.109"
APP_DIR="/var/www/trasealla-backend"
APP_NAME="trasealla-backend"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if we're on the correct branch
print_info "Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_error "You must be on the main branch to deploy"
    exit 1
fi
print_success "On main branch"

# Check for uncommitted changes
print_info "Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    exit 1
fi
print_success "No uncommitted changes"

# Push to GitHub
print_info "Pushing to GitHub..."
git push origin main
print_success "Pushed to GitHub"

# Deploy to server
print_info "Connecting to server and deploying..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

echo "📦 Pulling latest code from GitHub..."
cd /var/www/trasealla-backend || exit 1
git pull origin main

echo "📥 Installing dependencies..."
npm install --production

echo "🔄 Restarting application with PM2..."
pm2 reload ecosystem.config.js --env production

echo "✅ Deployment completed successfully!"
pm2 status
ENDSSH

print_success "Deployment completed!"
print_info "Check logs with: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs ${APP_NAME}'"

