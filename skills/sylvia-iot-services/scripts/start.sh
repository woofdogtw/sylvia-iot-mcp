#!/bin/bash

# Sylvia-IoT Services Startup Script
# This script starts RabbitMQ, EMQX, and sylvia-iot-core for integration testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY_NAME="sylvia-iot-core"
BINARY_URL="https://github.com/woofdogtw/sylvia-iot-core/releases/latest/download/sylvia-iot-core-x86_64.tar.xz"
CONFIG_FILE="$SCRIPT_DIR/config.json5"
RUNTIME_CONFIG="$SCRIPT_DIR/config.runtime.json5"
DB_FILE="$SCRIPT_DIR/test.db"
SQL_FILE="$SCRIPT_DIR/test.db.sql"
PID_FILE="$SCRIPT_DIR/sylvia-iot-core.pid"

echo "======================================"
echo "Starting Sylvia-IoT Services"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Start RabbitMQ
echo ""
echo "Starting RabbitMQ..."
if docker ps -a --format '{{.Names}}' | grep -q '^sylvia-rabbitmq$'; then
    if docker ps --format '{{.Names}}' | grep -q '^sylvia-rabbitmq$'; then
        echo "✅ RabbitMQ is already running"
    else
        echo "🔄 Starting existing RabbitMQ container..."
        docker start sylvia-rabbitmq
        echo "✅ RabbitMQ started"
    fi
else
    echo "🔄 Creating and starting RabbitMQ container..."
    docker run -d \
        --name sylvia-rabbitmq \
        -p 5671:5671 \
        -p 5672:5672 \
        -p 15672:15672 \
        rabbitmq:4.2.1-management-alpine
    echo "✅ RabbitMQ created and started"
fi

# Start EMQX (always fresh with --rm to ensure clean state)
echo ""
echo "Starting EMQX..."
if docker ps --format '{{.Names}}' | grep -q '^sylvia-emqx$'; then
    echo "🔄 Removing existing EMQX container for clean start..."
    docker stop sylvia-emqx >/dev/null 2>&1 || true
    # --rm will auto-remove, but wait a moment for cleanup
    sleep 2
fi
# Remove stopped container if it exists (in case it wasn't started with --rm)
docker rm sylvia-emqx >/dev/null 2>&1 || true

echo "🔄 Creating EMQX container..."
docker run -d --rm \
    --name sylvia-emqx \
    -p 1883:1883 \
    -p 8883:8883 \
    -p 18083:18083 \
    -v "$SCRIPT_DIR/emqx.conf":"/opt/emqx/etc/emqx.conf" \
    emqx/emqx:6.1.0
echo "✅ EMQX created and started"

# Wait for EMQX dashboard to be ready
echo ""
echo "⏳ Waiting for EMQX to be ready..."
for i in {1..30}; do
    if curl -sf http://localhost:18083/api/v5/status > /dev/null 2>&1; then
        echo "✅ EMQX is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Error: EMQX did not become ready in time"
        echo "   Check logs: docker logs sylvia-emqx"
        exit 1
    fi
    sleep 1
done

# Setup EMQX API key for coremgr via emqx eval
# (EMQX 6.x HTTP API has a bug in POST /api/v5/api_key — badmatch on role field)
echo ""
echo "Setting up EMQX API key..."
docker exec sylvia-emqx emqx eval 'emqx_mgmt_auth:delete(<<"coremgr">>).' > /dev/null 2>&1 || true
EMQX_EVAL_RESULT=$(docker exec sylvia-emqx emqx eval \
    'emqx_mgmt_auth:create(<<"coremgr">>, true, infinity, #{}, <<"administrator">>).' 2>&1)

EMQX_API_KEY=$(echo "$EMQX_EVAL_RESULT" | grep -oP 'api_key => <<"\K[^"]+')
EMQX_API_SECRET=$(echo "$EMQX_EVAL_RESULT" | grep -oP 'api_secret => <<"\K[^"]+')

if [ -z "$EMQX_API_KEY" ] || [ -z "$EMQX_API_SECRET" ]; then
    echo "❌ Error: Could not create EMQX API key"
    echo "   Result: $EMQX_EVAL_RESULT"
    exit 1
fi
echo "✅ EMQX API key created"

# Generate runtime config with EMQX credentials injected
echo ""
echo "Generating runtime config..."
sed -e "s/\"apiKey\": \"\"/\"apiKey\": \"$EMQX_API_KEY\"/" \
    -e "s/\"apiSecret\": \"\"/\"apiSecret\": \"$EMQX_API_SECRET\"/" \
    "$CONFIG_FILE" > "$RUNTIME_CONFIG"
echo "✅ Runtime config generated at $RUNTIME_CONFIG"

# Download sylvia-iot-core binary if not present
echo ""
if [ -f "$SCRIPT_DIR/$BINARY_NAME" ]; then
    echo "✅ $BINARY_NAME binary already exists"
else
    echo "📥 Downloading $BINARY_NAME binary..."
    cd "$SCRIPT_DIR"
    curl -LO "$BINARY_URL"
    echo "📦 Extracting binary..."
    tar xf sylvia-iot-core-x86_64.tar.xz
    chmod +x "$BINARY_NAME"
    rm sylvia-iot-core-x86_64.tar.xz
    echo "✅ Binary downloaded and extracted"
fi

# Check if SQLite is installed
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ Error: sqlite3 is not installed. Please install it first."
    echo "   Ubuntu/Debian: sudo apt-get install sqlite3"
    echo "   macOS: brew install sqlite3"
    exit 1
fi

# Setup database
echo ""
if [ -f "$DB_FILE" ]; then
    echo "ℹ️  Database already exists at $DB_FILE"
    read -p "Do you want to reset it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Resetting database..."
        rm "$DB_FILE"
        sqlite3 "$DB_FILE" < "$SQL_FILE"
        echo "✅ Database reset"
    fi
else
    echo "🔄 Creating database..."
    sqlite3 "$DB_FILE" < "$SQL_FILE"
    echo "✅ Database created"
fi

# Stop existing sylvia-iot-core if running
if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo ""
    echo "🔄 Stopping existing sylvia-iot-core (PID: $(cat "$PID_FILE"))..."
    kill $(cat "$PID_FILE") 2>/dev/null || true
    sleep 1
fi

# Start sylvia-iot-core with runtime config
echo ""
echo "🔄 Starting sylvia-iot-core..."
cd "$SCRIPT_DIR"
nohup ./"$BINARY_NAME" -f "$RUNTIME_CONFIG" > sylvia-iot-core.log 2>&1 &
echo $! > "$PID_FILE"
echo "✅ sylvia-iot-core started (PID: $(cat "$PID_FILE"))"
echo "   Log file: $SCRIPT_DIR/sylvia-iot-core.log"

# Wait for sylvia-iot-core to be ready
echo ""
echo "⏳ Waiting for sylvia-iot-core to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:1080/version > /dev/null 2>&1; then
        echo "✅ sylvia-iot-core is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Warning: sylvia-iot-core may not be ready yet"
        echo "   Check logs: tail -f $SCRIPT_DIR/sylvia-iot-core.log"
    fi
    sleep 1
done

echo ""
echo "======================================"
echo "✅ All Services Started Successfully"
echo "======================================"
echo ""
echo "Services:"
echo "  - RabbitMQ:            http://localhost:15672 (guest/guest)"
echo "  - EMQX Dashboard:      http://localhost:18083 (admin/public)"
echo "  - Sylvia-IoT Core:     http://localhost:1080"
echo "    - Auth:              http://localhost:1080/auth"
echo "    - Broker:            http://localhost:1080/broker"
echo "    - Coremgr:           http://localhost:1080/coremgr"
echo "    - Data:              http://localhost:1080/data"
echo ""
echo "Test credentials:"
echo "  - Username: admin"
echo "  - Password: admin"
echo ""
echo "To stop services: ./stop.sh"
echo ""
