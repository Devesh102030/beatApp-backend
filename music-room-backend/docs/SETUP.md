# Setup Guide

Complete guide to set up the Music Room backend for development and production.

## Prerequisites

### Required

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **Docker**: For running PostgreSQL locally
- **Docker Compose**: For orchestrating services

### Optional

- **LiveKit Server**: Cloud account or self-hosted instance
- **PostgreSQL**: If not using Docker

## Installation Steps

### 1. Clone and Install

```bash
# Navigate to project directory
cd music-room-backend

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://music:music@localhost:5432/music_room?schema=public

# CORS Origins
WEB_APP_URL=http://localhost:5173
EXTENSION_ORIGIN=chrome-extension://your-extension-id

# LiveKit
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Security
JWT_SECRET=your-jwt-secret-change-in-production
HOST_SECRET_SIGNING_KEY=your-host-secret-signing-key-change-in-production
```

#### Getting LiveKit Credentials

**Option 1: LiveKit Cloud**

1. Sign up at [livekit.io](https://livekit.io)
2. Create a new project
3. Copy your API Key and Secret
4. Use the provided WebSocket URL

**Option 2: Self-Hosted**

1. Follow [LiveKit deployment guide](https://docs.livekit.io/deploy/)
2. Generate API credentials
3. Use your server's WebSocket URL

### 3. Start PostgreSQL

Using Docker Compose:

```bash
docker-compose up -d
```

Verify it's running:

```bash
docker-compose ps
```

You should see:

```
NAME                    STATUS
music-room-postgres     Up
```

### 4. Database Setup

Generate Prisma client:

```bash
pnpm prisma:generate
```

Run migrations:

```bash
pnpm prisma:migrate
```

This will create all necessary tables.

### 5. Seed Database (Optional)

Populate with test data:

```bash
pnpm prisma:seed
```

This creates:
- Test users
- A test room (code: `TEST01`)
- Sample chat messages

Test credentials:
- Room Code: `TEST01`
- Host Secret: `test-secret-123`

### 6. Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:3000`

### 7. Verify Installation

Open your browser:

- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/rooms/TEST01

You should see the Swagger documentation interface.

## Development Workflow

### Running the Server

```bash
# Development with hot reload
pnpm dev

# Production build
pnpm build
pnpm start

# Debug mode
pnpm start:debug
```

### Database Management

```bash
# Open Prisma Studio (GUI)
pnpm prisma:studio

# Create a new migration
pnpm prisma:migrate

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Seed database
pnpm prisma:seed
```

### Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# E2E tests
pnpm test:e2e
```

### Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL

**Solutions**:

1. Check Docker is running:
   ```bash
   docker ps
   ```

2. Restart PostgreSQL:
   ```bash
   docker-compose restart postgres
   ```

3. Check logs:
   ```bash
   docker-compose logs postgres
   ```

4. Verify DATABASE_URL in `.env`

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**: Change PORT in `.env`:

```env
PORT=3001
```

### Prisma Client Issues

**Problem**: Prisma client not found

**Solution**: Regenerate client:

```bash
pnpm prisma:generate
```

### LiveKit Token Errors

**Problem**: Failed to generate LiveKit token

**Solutions**:

1. Verify LIVEKIT_API_KEY and LIVEKIT_API_SECRET
2. Check LIVEKIT_URL format (should start with `wss://`)
3. Ensure LiveKit server is accessible

### CORS Errors

**Problem**: CORS errors from frontend

**Solution**: Update WEB_APP_URL and EXTENSION_ORIGIN in `.env`:

```env
WEB_APP_URL=http://localhost:5173
EXTENSION_ORIGIN=chrome-extension://your-actual-extension-id
```

## Production Deployment

### Environment Variables

Set production values:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@production-db:5432/music_room
WEB_APP_URL=https://your-app.com
EXTENSION_ORIGIN=chrome-extension://production-extension-id
LIVEKIT_URL=wss://your-livekit.com
LIVEKIT_API_KEY=prod-key
LIVEKIT_API_SECRET=prod-secret
JWT_SECRET=strong-random-secret-min-32-chars
HOST_SECRET_SIGNING_KEY=another-strong-random-secret-min-32-chars
```

### Build and Deploy

```bash
# Build
pnpm build

# Run migrations
pnpm prisma:migrate deploy

# Start production server
pnpm start:prod
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/main.js --name music-room-api

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma:generate
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
```

Build and run:

```bash
docker build -t music-room-api .
docker run -p 3000:3000 --env-file .env music-room-api
```

### Health Checks

Add health check endpoint monitoring:

- Check database connectivity
- Verify LiveKit credentials
- Monitor WebSocket connections

### Logging

In production, consider:

- Structured logging to files
- Log aggregation (e.g., ELK stack)
- Error tracking (e.g., Sentry)

### Security Checklist

- [ ] Strong JWT_SECRET and HOST_SECRET_SIGNING_KEY
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Database credentials secured
- [ ] LiveKit credentials secured
- [ ] No secrets in logs
- [ ] Regular security updates

## Next Steps

1. **Set up Redis** (optional): Replace in-memory state store
2. **Add monitoring**: Prometheus, Grafana
3. **Set up CI/CD**: GitHub Actions, GitLab CI
4. **Configure backups**: Database backups
5. **Add authentication**: Full user auth system
6. **Set up CDN**: For static assets
7. **Load balancing**: For multiple instances

## Support

For issues and questions:

1. Check the [API Documentation](./API.md)
2. Review [README.md](../README.md)
3. Check application logs
4. Verify environment configuration

## Useful Commands Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate         # Run migrations
pnpm prisma:studio          # Open Prisma Studio
pnpm prisma:seed            # Seed database

# Testing
pnpm test                   # Run tests
pnpm test:watch             # Watch mode
pnpm test:cov               # Coverage report

# Code Quality
pnpm lint                   # Lint code
pnpm format                 # Format code

# Docker
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs         # View logs
docker-compose ps           # List services
```
