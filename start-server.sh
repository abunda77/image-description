#!/bin/bash

# Script untuk start server (tanpa rebuild)

PID_FILE="server.pid"
LOG_FILE="server.log"
PORT=${PORT:-3001}

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Server already running (PID: $PID)"
        echo "Use './restart-server.sh' to restart or './stop-server.sh' to stop"
        exit 1
    fi
fi

echo "🚀 Starting server..."

# Start server dengan nohup
nohup node server.js > "$LOG_FILE" 2>&1 &

# Save PID
echo $! > "$PID_FILE"

sleep 2

# Verify
if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
    echo "✅ Server started successfully!"
    echo "📝 PID: $(cat $PID_FILE)"
    echo "📋 Log: $LOG_FILE"
    echo "🌐 URL: http://localhost:$PORT"
else
    echo "❌ Failed to start server"
    echo "Check logs: cat $LOG_FILE"
    exit 1
fi
