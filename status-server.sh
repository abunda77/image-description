#!/bin/bash

# Script untuk cek status server

PID_FILE="server.pid"
LOG_FILE="server.log"
PORT=${PORT:-3001}

echo "📊 Server Status Check"
echo "====================="

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Status: RUNNING"
        echo "📝 PID: $PID"
        
        # Get process info
        echo "💾 Memory Usage:"
        ps -p $PID -o pid,vsz,rss,comm,args | tail -n +2
        
        # Check port
        echo ""
        echo "🌐 Port Status:"
        lsof -i:$PORT 2>/dev/null || echo "   Port $PORT not found"
        
        # Show last log lines
        if [ -f "$LOG_FILE" ]; then
            echo ""
            echo "📋 Last 10 log lines:"
            tail -n 10 "$LOG_FILE"
        fi
    else
        echo "❌ Status: NOT RUNNING"
        echo "⚠️  PID file exists but process is dead"
    fi
else
    echo "❌ Status: NOT RUNNING"
    echo "ℹ️  No PID file found"
    
    # Check if port is in use by another process
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "⚠️  WARNING: Port $PORT is in use by another process (PID: $PID)"
    fi
fi

echo ""
echo "💡 Useful commands:"
echo "   - Start: ./restart-server.sh"
echo "   - Stop: ./stop-server.sh"
echo "   - View logs: tail -f $LOG_FILE"
