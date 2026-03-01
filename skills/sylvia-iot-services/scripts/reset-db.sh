#!/bin/bash

# Sylvia-IoT Database Reset Script
# This script resets the test database to its initial state

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_FILE="$SCRIPT_DIR/test.db"
SQL_FILE="$SCRIPT_DIR/test.db.sql"
PID_FILE="$SCRIPT_DIR/sylvia-iot-core.pid"

echo "======================================"
echo "Reset Sylvia-IoT Test Database"
echo "======================================"

# Check if sylvia-iot-core is running
if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo ""
    echo "⚠️  Warning: sylvia-iot-core is currently running"
    echo "   It's recommended to stop it before resetting the database."
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operation cancelled"
        exit 0
    fi
fi

# Check if SQLite is installed
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ Error: sqlite3 is not installed. Please install it first."
    echo "   Ubuntu/Debian: sudo apt-get install sqlite3"
    echo "   macOS: brew install sqlite3"
    exit 1
fi

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: SQL file not found: $SQL_FILE"
    exit 1
fi

# Backup existing database
if [ -f "$DB_FILE" ]; then
    BACKUP_FILE="$DB_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo ""
    echo "📦 Creating backup: $(basename $BACKUP_FILE)"
    cp "$DB_FILE" "$BACKUP_FILE"
    echo "✅ Backup created"
fi

# Reset database
echo ""
echo "🔄 Resetting database..."
rm -f "$DB_FILE"
sqlite3 "$DB_FILE" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database reset successfully"
else
    echo "❌ Error: Failed to reset database"
    if [ -f "$BACKUP_FILE" ]; then
        echo "   Restoring from backup..."
        mv "$BACKUP_FILE" "$DB_FILE"
        echo "✅ Database restored from backup"
    fi
    exit 1
fi

echo ""
echo "======================================"
echo "✅ Database Reset Complete"
echo "======================================"
echo ""
echo "Test credentials:"
echo "  - Username: admin"
echo "  - Password: admin"
echo ""
if [ -f "$BACKUP_FILE" ]; then
    echo "Backup saved at: $BACKUP_FILE"
fi
echo ""
