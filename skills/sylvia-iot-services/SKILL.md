---
name: sylvia-iot-services
description: Manages Sylvia-IoT backend services (RabbitMQ, EMQX, sylvia-iot-core) for development and integration testing. Use when starting, stopping, resetting, or checking the status of Sylvia-IoT backend services.
---

# Sylvia-IoT Services Management

## Available commands

### Start services

**Command**: `/sylvia-iot-services start`

Starts RabbitMQ, EMQX, and sylvia-iot-core. Downloads the binary on first run. Creates SQLite test database if not present.

Services available at:
- RabbitMQ: http://localhost:15672 (guest/guest)
- EMQX Dashboard: http://localhost:18083
- Sylvia-IoT Core: http://localhost:1080 (auth/broker/coremgr/data)

Test credentials: admin / admin

### Stop services

**Command**: `/sylvia-iot-services stop`

Stops sylvia-iot-core, RabbitMQ, and EMQX. Containers are stopped but not removed.

### Reset database

**Command**: `/sylvia-iot-services reset-db`

Backs up and recreates the SQLite test database with default data: admin/admin user and two OAuth2 clients.

### Check status

**Command**: `/sylvia-iot-services status`

Shows running status of sylvia-iot-core, RabbitMQ, and EMQX, plus service URLs and credentials.

## Implementation

Determine which command was requested (start, stop, reset-db, status) and run the corresponding script from `skills/sylvia-iot-services/scripts/`:

```bash
./start.sh
./stop.sh
./reset-db.sh
./status.sh
```

Requirements: Docker must be running; sqlite3 must be installed.
