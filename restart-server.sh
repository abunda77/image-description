#!/bin/bash

# Script untuk restart server production (tanpa PM2)
# Menggunakan nohup untuk background process

PID_FILE="server.pid"
LOG_FILE="server.log"
PORT=${PORT:-3001}

echo "🔄 Restarting Image Description Server..."

# Function: Stop existing server
stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "⏹️  Stopping existing server (PID: $PID)..."
            kill $PID
            sleep 2
            
            # Force kill if still running
            if ps -p $PID > /dev/null 2>&1; then
                echo "⚠️  Force killing process..."
                kill -9 $PID
            fi
        fi
        rm -f "$PID_FILE"
    else
        # Try to find and kill process by port
        echo "🔍 Checking if port $PORT is in use..."
        PID=$(lsof -ti:$PORT 2>/dev/null)
        if [ ! -z "$PID" ]; then
            echo "⏹️  Killing process on port $PORT (PID: $PID)..."
            kill -9 $PID
            sleep 1
        fi
    fi
}

# Function: Start server
start_server() {
    echo "📦 Building frontend..."
    npm run build
    
    echo "🚀 Starting server in background..."
    
    # Start server dengan nohup
    nohup node server.js > "$LOG_FILE" 2>&1 &
    
    # Save PID
    echo $! > "$PID_FILE"
    
    sleep 2
    
    # Verify server started
    if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
        echo "✅ Server started successfully!"
        echo "📝 PID: $(cat $PID_FILE)"
        echo "📋 Log file: $LOG_FILE"
        echo "🌐 URL: http://localhost:$PORT"
        echo ""
        echo "💡 Useful commands:"
        echo "   - View logs: tail -f $LOG_FILE"
        echo "   - Stop server: ./stop-server.sh"
        echo "   - Check status: ./status-server.sh"
    else
        echo "❌ Failed to start server!"
        echo "Check logs: cat $LOG_FILE"
        exit 1
    fi
}

# Main execution
stop_server
start_server
