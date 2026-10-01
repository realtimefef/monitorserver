# NodeVigil — Backend

Spring Boot 3.4 REST API for the NodeVigil dashboard.

## Requirements
- Java 21+
- MySQL 8.0+
- Maven 3.8+

## Quick Start

### 1. Configure environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Run with Docker
```bash
docker-compose up -d
```

### 3. Run manually
```bash
# Set environment variables from .env
mvn spring-boot:run
```

## API Base URL
`http://localhost:8080/api/v1`

## Default Port
8080
