#!/bin/bash

# Script untuk stop server

PID_FILE="server.pid"
PORT=${PORT:-3001}

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⏹️  Stopping server (PID: $PID)..."
        kill $PID
        sleep 2
        
        if ps -p $PID > /dev/null 2>&1; then
            echo "⚠️  Force killing..."
            kill -9 $PID
        fi
        
        echo "✅ Server stopped"
    else
        echo "❌ Process not running"
    fi
    rm -f "$PID_FILE"
else
    # Try to find by port
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "⏹️  Killing process on port $PORT (PID: $PID)..."
        kill -9 $PID
        echo "✅ Server stopped"
    else
        echo "❌ No server process found"
    fi
fi
