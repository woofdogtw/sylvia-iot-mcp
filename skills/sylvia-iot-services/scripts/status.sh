#!/bin/bash

# Sylvia-IoT Services Status Script
# This script checks the status of all Sylvia-IoT services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/sylvia-iot-core.pid"

echo "======================================"
echo "Sylvia-IoT Services Status"
echo "======================================"

# Check sylvia-iot-core
echo ""
echo "sylvia-iot-core:"
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "  ✅ Running (PID: $PID)"

        # Check if API is responding
        if curl -s http://localhost:1080/version > /dev/null 2>&1; then
            echo "  ✅ API responding"
            echo "     URL: http://localhost:1080"
        else
            echo "  ⚠️  Process running but API not responding"
        fi
    else
        echo "  ❌ Not running (PID file exists but process is dead)"
    fi
else
    echo "  ❌ Not running (no PID file)"
fi

# Check Docker
echo ""
echo "Docker:"
if docker info > /dev/null 2>&1; then
    echo "  ✅ Docker is running"
else
    echo "  ❌ Docker is not running"
fi

# Check RabbitMQ
echo ""
echo "RabbitMQ:"
if docker ps --format '{{.Names}}' | grep -q '^sylvia-rabbitmq$'; then
    echo "  ✅ Running"
    echo "     Management UI: http://localhost:15672"
    echo "     Credentials: guest/guest"
else
    if docker ps -a --format '{{.Names}}' | grep -q '^sylvia-rabbitmq$'; then
        echo "  ⚠️  Container exists but stopped"
    else
        echo "  ❌ Not running"
    fi
fi

# Check EMQX
echo ""
echo "EMQX:"
if docker ps --format '{{.Names}}' | grep -q '^sylvia-emqx$'; then
    echo "  ✅ Running"
    echo "     Dashboard: http://localhost:18083"
else
    if docker ps -a --format '{{.Names}}' | grep -q '^sylvia-emqx$'; then
        echo "  ⚠️  Container exists but stopped"
    else
        echo "  ❌ Not running"
    fi
fi

# Summary
echo ""
echo "======================================"
if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null &&
   docker ps --format '{{.Names}}' | grep -q '^sylvia-rabbitmq$' &&
   docker ps --format '{{.Names}}' | grep -q '^sylvia-emqx$'; then
    echo "✅ All services are running"
    echo ""
    echo "Service endpoints:"
    echo "  - Auth:     http://localhost:1080/auth"
    echo "  - Broker:   http://localhost:1080/broker"
    echo "  - Coremgr:  http://localhost:1080/coremgr"
    echo "  - Data:     http://localhost:1080/data"
    echo ""
    echo "Test credentials:"
    echo "  - Username: admin"
    echo "  - Password: admin"
else
    echo "⚠️  Some services are not running"
    echo ""
    echo "To start all services: ./start.sh"
fi
echo "======================================"
echo ""
