# Sylvia-IoT Services Management Scripts

This directory contains scripts to manage Sylvia-IoT backend services for integration testing and development.

## Prerequisites

- **Docker**: Must be installed and running
- **sqlite3**: Must be installed (`apt-get install sqlite3` or `brew install sqlite3`)
- **curl**: For health checks (usually pre-installed)

## Scripts

### start.sh
Starts all Sylvia-IoT services including RabbitMQ, EMQX, and sylvia-iot-core.

```bash
./start.sh
```

**What it does:**
1. Checks if Docker is running
2. Starts RabbitMQ container (ports: 5671, 5672, 15672)
3. Starts EMQX container (ports: 1883, 8883, 18083)
4. Downloads sylvia-iot-core binary if not present
5. Creates SQLite test database if not exists
6. Starts sylvia-iot-core on port 1080
7. Waits for services to be ready

### stop.sh
Stops all running Sylvia-IoT services.

```bash
./stop.sh
```

**What it does:**
1. Stops sylvia-iot-core process gracefully
2. Stops RabbitMQ container
3. Stops EMQX container

**Note**: Docker containers are stopped but not removed. To remove them:
```bash
docker rm sylvia-rabbitmq sylvia-emqx
```

### reset-db.sh
Resets the test database to its initial state.

```bash
./reset-db.sh
```

**What it does:**
1. Creates a backup of the current database
2. Deletes the existing test database
3. Recreates it with initial test data

**Warning**: This will reset all data to the default test state.

### status.sh
Shows the current status of all services.

```bash
./status.sh
```

**What it shows:**
- sylvia-iot-core status and API availability
- Docker status
- RabbitMQ container status
- EMQX container status
- Service endpoints and test credentials

## Configuration Files

### config.json5
Test configuration for sylvia-iot-core. Defines:
- SQLite database path (test.db)
- Service URLs (all on localhost:1080)
- Service dependencies

### test.db.sql
Database schema and initial test data including:
- `user` table with admin account
- `client` table with OAuth2 clients (public and private)

**Default credentials:**
- Username: admin
- Password: admin

## Service Endpoints

When services are running:

- **Sylvia-IoT Core**: http://localhost:1080
  - Auth: http://localhost:1080/auth
  - Broker: http://localhost:1080/broker
  - Coremgr: http://localhost:1080/coremgr
  - Data: http://localhost:1080/data
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **EMQX Dashboard**: http://localhost:18083

## Claude Code Skill

These scripts can be invoked via the Claude Code skill:

- `/sylvia-iot-services start` - Start all services
- `/sylvia-iot-services stop` - Stop all services
- `/sylvia-iot-services reset-db` - Reset database
- `/sylvia-iot-services status` - Check status

## Troubleshooting

### Services won't start
- Ensure Docker is running: `docker info`
- Check if ports are already in use: `lsof -i :1080,5672,1883`
- Check logs: `tail -f sylvia-iot-core.log`

### Database issues
- Check if sqlite3 is installed: `which sqlite3`
- Try resetting the database: `./reset-db.sh`
- Check database file permissions

### Docker container issues
- List all containers: `docker ps -a`
- Check container logs: `docker logs sylvia-rabbitmq` or `docker logs sylvia-emqx`
- Remove and recreate: `docker rm sylvia-rabbitmq && ./start.sh`

## Development Notes

- All services use localhost:1080 for inter-service communication
- The sylvia-iot-core binary is downloaded from the latest GitHub release
- Database backups are created with timestamps when resetting
- Log file: `sylvia-iot-core.log` in this directory
- PID file: `sylvia-iot-core.pid` in this directory
