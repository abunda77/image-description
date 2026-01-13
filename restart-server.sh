#!/bin/bash

# Script untuk restart server production

echo "🔄 Restarting Image Description Server..."

# Stop existing process
pm2 stop image-desc 2>/dev/null || echo "No existing process found"

# Pull latest code (optional)
# git pull origin main

# Build frontend
echo "📦 Building frontend..."
npm run build

# Start server with PM2
echo "🚀 Starting server..."
pm2 start server.js --name "image-desc" --update-env

# Save PM2 configuration
pm2 save

echo "✅ Server restarted successfully!"
echo ""
pm2 status
